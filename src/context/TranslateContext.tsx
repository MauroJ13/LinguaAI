/**
 * Lingua Translate – gemeinsamer Zustand für Desktop-Fenster und mobile Seite.
 *
 * Der Zustand liegt bewusst hier (oberhalb von Chat/Onboarding) und nicht in der Komponente:
 * Minimieren, Schließen, Wechsel Desktop ↔ Mobile oder zurück zum Chat verlieren so weder
 * den eingegebenen Text noch die Übersetzung. Es gibt genau EIN Übersetzerfenster.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AiError } from '../services/ai/errors';
import { MAX_TRANSLATE_CHARS, translateText, type SourceLanguage } from '../services/translate/translate';
import type { LanguageCode } from '../types';

export type TranslatorMode = 'closed' | 'open' | 'minimized';
export type TranslateStatus = 'idle' | 'loading' | 'done' | 'error';
export type TranslateErrorKind = 'rate' | 'network' | 'other';

export interface Point {
  x: number;
  y: number;
}

interface TranslatorState {
  mode: TranslatorMode;
  source: SourceLanguage;
  target: LanguageCode;
  text: string;
  result: string;
  /** Text, zu dem `result` gehört (zeigt an, ob die Übersetzung veraltet ist). */
  resultFor: string;
  detected?: LanguageCode;
  status: TranslateStatus;
  error?: TranslateErrorKind;
  /** Fensterposition (Desktop) – null = Standardposition. */
  windowPos: Point | null;
  /** Position der minimierten Blase – null = Standardposition. */
  bubblePos: Point | null;
}

interface TranslatorApi extends TranslatorState {
  open: () => void;
  minimize: () => void;
  close: () => void;
  setText: (text: string) => void;
  setSource: (source: SourceLanguage) => void;
  setTarget: (target: LanguageCode) => void;
  swap: () => void;
  clear: () => void;
  /** Sofort übersetzen (Button / Strg+Enter / erneut versuchen). */
  translateNow: () => void;
  setWindowPos: (pos: Point) => void;
  setBubblePos: (pos: Point) => void;
  canSwap: boolean;
}

const PREFS_KEY = 'linguaai.translate';
const DEBOUNCE_MS = 900;

interface Prefs {
  source: SourceLanguage;
  target: LanguageCode;
  windowPos: Point | null;
  bubblePos: Point | null;
}

function loadPrefs(): Partial<Prefs> {
  try {
    return JSON.parse(window.localStorage.getItem(PREFS_KEY) ?? '{}') as Partial<Prefs>;
  } catch {
    return {};
  }
}

const TranslateContext = createContext<TranslatorApi | null>(null);

interface TranslateProviderProps {
  /** Standard-Zielsprache: die Muttersprache des Nutzers. */
  defaultTarget: LanguageCode;
  children: ReactNode;
}

export function TranslateProvider({ defaultTarget, children }: TranslateProviderProps) {
  const [state, setState] = useState<TranslatorState>(() => {
    const prefs = loadPrefs();
    return {
      mode: 'closed',
      source: prefs.source ?? 'auto',
      target: prefs.target ?? defaultTarget,
      text: '',
      result: '',
      resultFor: '',
      status: 'idle',
      windowPos: prefs.windowPos ?? null,
      bubblePos: prefs.bubblePos ?? null,
    };
  });

  const controllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const requestRef = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Sprachen & Positionen merken (nicht den Text – der bleibt nur für diese Sitzung)
  useEffect(() => {
    try {
      const prefs: Prefs = {
        source: state.source,
        target: state.target,
        windowPos: state.windowPos,
        bubblePos: state.bubblePos,
      };
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* ignorieren */
    }
  }, [state.source, state.target, state.windowPos, state.bubblePos]);

  const run = useCallback(async () => {
    window.clearTimeout(timerRef.current);
    controllerRef.current?.abort();
    const { text, source, target } = stateRef.current;
    const input = text.trim();
    if (!input) {
      setState((s) => ({ ...s, result: '', resultFor: '', status: 'idle', error: undefined, detected: undefined }));
      return;
    }

    const id = ++requestRef.current;
    const controller = new AbortController();
    controllerRef.current = controller;
    setState((s) => ({ ...s, status: 'loading', error: undefined }));

    try {
      const res = await translateText({ text: input, source, target, signal: controller.signal });
      if (id !== requestRef.current) return;
      setState((s) => ({
        ...s,
        result: res.translation,
        resultFor: input,
        detected: source === 'auto' ? res.detected : undefined,
        status: 'done',
      }));
    } catch (err) {
      if (id !== requestRef.current) return;
      if (err instanceof AiError && err.kind === 'aborted') return;
      const kind: TranslateErrorKind =
        err instanceof AiError && err.kind === 'rate'
          ? 'rate'
          : err instanceof AiError && err.kind === 'network'
            ? 'network'
            : 'other';
      setState((s) => ({ ...s, status: 'error', error: kind }));
    }
  }, []);

  /** Nach einer kurzen Tipp-Pause automatisch übersetzen (Sprachwechsel: fast sofort). */
  const schedule = useCallback(
    (delay = DEBOUNCE_MS) => {
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => void run(), delay);
    },
    [run],
  );

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
      controllerRef.current?.abort();
    },
    [],
  );

  const setText = useCallback(
    (text: string) => {
      setState((s) => ({ ...s, text: text.slice(0, MAX_TRANSLATE_CHARS) }));
      schedule();
    },
    [schedule],
  );

  const setSource = useCallback(
    (source: SourceLanguage) => {
      setState((s) => {
        // Gleiche Sprache auf beiden Seiten → wie bei Google tauschen
        if (source !== 'auto' && source === s.target) {
          const target = s.source === 'auto' ? (s.detected ?? s.target) : s.source;
          return { ...s, source, target: target === source ? s.target : target, detected: undefined };
        }
        return { ...s, source, detected: undefined };
      });
      schedule(120);
    },
    [schedule],
  );

  const setTarget = useCallback(
    (target: LanguageCode) => {
      setState((s) => {
        if (s.source !== 'auto' && target === s.source) return { ...s, target, source: s.target };
        return { ...s, target };
      });
      schedule(120);
    },
    [schedule],
  );

  const sourceForSwap = state.source === 'auto' ? state.detected : state.source;
  const canSwap = Boolean(sourceForSwap) && sourceForSwap !== state.target;

  const swap = useCallback(() => {
    const s = stateRef.current;
    const from = s.source === 'auto' ? s.detected : s.source;
    if (!from || from === s.target) return;
    // Übersetzung wird zum neuen Ausgangstext (wie bei Google Übersetzer)
    const hasResult = s.status === 'done' && s.result;
    setState({
      ...s,
      source: s.target,
      target: from,
      text: hasResult ? s.result : s.text,
      result: hasResult ? s.text : '',
      resultFor: hasResult ? s.result : '',
      detected: undefined,
      status: hasResult ? 'done' : s.status,
    });
    if (!hasResult) schedule(120);
  }, [schedule]);

  const clear = useCallback(() => {
    window.clearTimeout(timerRef.current);
    controllerRef.current?.abort();
    requestRef.current++;
    setState((s) => ({ ...s, text: '', result: '', resultFor: '', status: 'idle', error: undefined, detected: undefined }));
  }, []);

  const api = useMemo<TranslatorApi>(
    () => ({
      ...state,
      canSwap,
      open: () => setState((s) => ({ ...s, mode: 'open' })),
      minimize: () => setState((s) => ({ ...s, mode: 'minimized' })),
      close: () => setState((s) => ({ ...s, mode: 'closed' })),
      setText,
      setSource,
      setTarget,
      swap,
      clear,
      translateNow: () => void run(),
      setWindowPos: (windowPos) => setState((s) => ({ ...s, windowPos })),
      setBubblePos: (bubblePos) => setState((s) => ({ ...s, bubblePos })),
    }),
    [state, canSwap, setText, setSource, setTarget, swap, clear, run],
  );

  return <TranslateContext.Provider value={api}>{children}</TranslateContext.Provider>;
}

export function useLinguaTranslate(): TranslatorApi {
  const ctx = useContext(TranslateContext);
  if (!ctx) throw new Error('useLinguaTranslate must be used inside <TranslateProvider>');
  return ctx;
}
