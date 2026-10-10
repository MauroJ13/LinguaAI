import { useCallback, useEffect, useRef, useState } from 'react';
import type { TranslateFn } from '../i18n';
import { AiError } from '../services/ai/errors';
import { aiGreeting, aiTranslate, aiTurn } from '../services/ai/tutorAi';
import { analyzeMessage, hasAnalyzer } from '../services/analyzer';
import {
  createContext,
  createGreeting,
  createReply,
  getThinkingDelay,
  type ConversationContext,
  type DemoLine,
} from '../services/tutorEngine';
import type { Analysis, ChatMessage, ConversationMeta, Settings } from '../types';
import { deleteConversation, listConversations, loadConversation, saveConversation } from '../services/storage';
import { createId } from '../utils/format';

interface UseChatOptions {
  settings: Settings;
  aiEnabled: boolean;
  t: TranslateFn;
  /** Wird aufgerufen, sobald eine Nutzernachricht analysiert wurde (Auto-Feedback). */
  onAnalysis?: (messageId: string, analysis: Analysis) => void;
}

const aiMessage = (line: DemoLine, source: 'ai' | 'demo'): ChatMessage => ({
  id: createId('ai'),
  role: 'ai',
  text: line.text,
  translation: line.translation || undefined,
  createdAt: Date.now(),
  source,
});

const systemMessage = (text: string): ChatMessage => ({
  id: createId('sys'),
  role: 'system',
  text,
  createdAt: Date.now(),
});

/**
 * Verwaltet den kompletten Chat-Workflow:
 * Begrüßung, Nutzernachrichten, Analyse (💡), Antworten und Übersetzungen –
 * mit echter KI (kostenlose Dienste) oder im Demo-Modus.
 */
export function useChat({ settings, aiEnabled, t, onAnalysis }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  /** Zuletzt NEU erzeugte KI-Nachricht (nicht aus dem Speicher geladen) – wird automatisch vorgelesen. */
  const [freshAiId, setFreshAiId] = useState<string | null>(null);

  const settingsRef = useRef(settings);
  const aiRef = useRef({ aiEnabled });
  const tRef = useRef(t);
  const onAnalysisRef = useRef(onAnalysis);
  const messagesRef = useRef<ChatMessage[]>([]);
  const contextRef = useRef<ConversationContext>(createContext());
  const timersRef = useRef<number[]>([]);
  const conversationRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    settingsRef.current = settings;
    aiRef.current = { aiEnabled };
    tRef.current = t;
    onAnalysisRef.current = onAnalysis;
  });

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const updateMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      const id = window.setTimeout(() => {
        timersRef.current = timersRef.current.filter((x) => x !== id);
        resolve();
      }, ms);
      timersRef.current.push(id);
    });

  const cancelPending = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const fallbackNotice = (err: unknown): ChatMessage =>
    systemMessage(
      err instanceof AiError && err.kind === 'rate'
        ? tRef.current('rateLimit')
        : tRef.current('aiFallback', { error: err instanceof Error ? err.message : String(err) }),
    );

  const isAborted = (err: unknown) => err instanceof AiError && err.kind === 'aborted';

  /* ---------------- Gespräche: fortsetzen oder neu beginnen ---------------- */

  /** Sprachpaar + Gespräch, zu dem die angezeigten Nachrichten gehören (für die Speicherung). */
  const pairRef = useRef({ native: settings.nativeLanguage, target: settings.language });
  const idRef = useRef<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationMeta[]>([]);
  /** true = es gibt gespeicherte Gespräche und der Nutzer soll wählen (fortsetzen / neu). */
  const [choosing, setChoosing] = useState(false);

  const refreshList = useCallback(() => {
    const { native, target } = pairRef.current;
    const list = listConversations(native, target);
    setConversations(list);
    return list;
  }, []);

  const activate = (id: string | null) => {
    idRef.current = id;
    setConversationId(id);
  };

  /** Startet ein neues Gespräch mit Begrüßung. */
  const startNew = useCallback(async () => {
    cancelPending();
    const conversation = ++conversationRef.current;
    const isCurrent = () => conversation === conversationRef.current;
    contextRef.current = createContext();

    const s = settingsRef.current;
    const { aiEnabled: live } = aiRef.current;
    pairRef.current = { native: s.nativeLanguage, target: s.language };
    activate(createId('c'));
    setChoosing(false);
    setMessages([]);
    setIsTyping(true);

    try {
      if (live) {
        const controller = new AbortController();
        controllerRef.current = controller;
        try {
          const line = await aiGreeting(s, controller.signal);
          if (isCurrent()) {
            const msg = aiMessage(line, 'ai');
            setMessages([msg]);
            setFreshAiId(msg.id);
          }
          return;
        } catch (err) {
          if (!isCurrent() || isAborted(err)) return;
          const msg = aiMessage(createGreeting(s), 'demo');
          setMessages([fallbackNotice(err), msg]);
          setFreshAiId(msg.id);
          return;
        }
      }
      await wait(900);
      if (isCurrent()) {
        const msg = aiMessage(createGreeting(s), 'demo');
        setMessages([msg]);
        setFreshAiId(msg.id);
      }
    } finally {
      if (isCurrent()) setIsTyping(false);
    }
  }, [cancelPending]);

  /** Gespeichertes Gespräch öffnen und dort weiterreden. */
  const openConversation = useCallback(
    (id: string) => {
      cancelPending();
      conversationRef.current += 1;
      contextRef.current = createContext();
      const { native, target } = pairRef.current;
      const saved = loadConversation(native, target, id);
      if (!saved.length) {
        void startNew();
        return;
      }
      activate(id);
      setChoosing(false);
      setIsTyping(false);
      setMessages(saved);
    },
    [cancelPending, startNew],
  );

  const removeConversation = useCallback(
    (id: string) => {
      const { native, target } = pairRef.current;
      deleteConversation(native, target, id);
      const list = refreshList();
      if (id === idRef.current) {
        activate(null);
        setMessages([]);
        if (!list.length) void startNew();
        else setChoosing(true);
      }
    },
    [refreshList, startNew],
  );

  /** Gesprächsauswahl öffnen (z. B. über den Button „Gespräche“). */
  const showChooser = useCallback(() => {
    refreshList();
    setChoosing(true);
  }, [refreshList]);

  /** Auswahl schließen – nur möglich, wenn schon ein Gespräch offen ist. */
  const hideChooser = useCallback(() => {
    if (idRef.current) setChoosing(false);
  }, []);

  // Verlauf automatisch speichern
  useEffect(() => {
    if (!idRef.current) return;
    saveConversation(pairRef.current.native, pairRef.current.target, idRef.current, messages);
  }, [messages]);

  // Neue Lern- oder Muttersprache (oder App-Start) → gespeicherte Gespräche? Dann wählen lassen.
  useEffect(() => {
    cancelPending();
    conversationRef.current += 1;
    pairRef.current = { native: settings.nativeLanguage, target: settings.language };
    activate(null);
    setMessages([]);
    setIsTyping(false);
    const list = refreshList();
    if (list.length) setChoosing(true);
    else void startNew();
    return () => {
      conversationRef.current += 1;
      cancelPending();
    };
  }, [settings.language, settings.nativeLanguage, startNew, cancelPending, refreshList]);

  // Niveauwechsel → kurzer Hinweis im Chat
  const previousRef = useRef(settings);
  useEffect(() => {
    const prev = previousRef.current;
    previousRef.current = settings;
    if (prev.language !== settings.language || prev.nativeLanguage !== settings.nativeLanguage) return;
    if (prev.level !== settings.level && idRef.current) {
      setMessages((m) => [...m, systemMessage(t('levelChanged', { level: settings.level }))]);
    }
  }, [settings, t]);

  /* ---------------- Nachricht senden ---------------- */

  const demoAnalysis = (text: string): Analysis => {
    const s = settingsRef.current;
    const analysis = analyzeMessage(text, s.language, s.level);
    if (analysis.type === 'ok' && !hasAnalyzer(s.language)) return { ...analysis, unchecked: true };
    return analysis;
  };

  const sendMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text) return;

      const conversation = conversationRef.current;
      const isCurrent = () => conversation === conversationRef.current;
      const history = messagesRef.current;
      const userId = createId('user');

      setMessages((m) => [
        ...m,
        { id: userId, role: 'user', text, createdAt: Date.now(), analysisStatus: 'pending' },
      ]);
      setIsTyping(true);

      const s = settingsRef.current;
      const { aiEnabled: live } = aiRef.current;

      const finish = (analysis: Analysis | undefined, reply: DemoLine, source: 'ai' | 'demo', notice?: ChatMessage) => {
        updateMessage(userId, analysis ? { analysis, analysisStatus: 'done', source } : { analysisStatus: 'error', source });
        const msg = aiMessage(reply, source);
        setMessages((m) => [...m, ...(notice ? [notice] : []), msg]);
        setFreshAiId(msg.id);
        if (analysis) onAnalysisRef.current?.(userId, analysis);
      };

      try {
        if (live) {
          const controller = new AbortController();
          controllerRef.current = controller;
          try {
            const result = await aiTurn(s, history, text, controller.signal);
            if (isCurrent()) finish(result.analysis, result.reply, 'ai');
          } catch (err) {
            if (!isCurrent() || isAborted(err)) return;
            finish(demoAnalysis(text), createReply(text, s, contextRef.current), 'demo', fallbackNotice(err));
          }
          return;
        }

        await wait(getThinkingDelay(text));
        if (isCurrent()) finish(demoAnalysis(text), createReply(text, s, contextRef.current), 'demo');
      } finally {
        if (isCurrent()) setIsTyping(false);
      }
    },
    [updateMessage],
  );

  /* ---------------- Übersetzung auf Abruf ---------------- */

  const requestTranslation = useCallback(
    async (message: ChatMessage) => {
      if (message.translation || message.translationStatus === 'pending') return;
      const { aiEnabled: live } = aiRef.current;
      if (!live) return;
      updateMessage(message.id, { translationStatus: 'pending' });
      try {
        const translation = await aiTranslate(settingsRef.current, message.text);
        updateMessage(message.id, { translation, translationStatus: 'done' });
      } catch {
        updateMessage(message.id, { translationStatus: 'error' });
      }
    },
    [updateMessage],
  );

  // Liste nach jeder Änderung aktuell halten (für die Gesprächsauswahl)
  useEffect(() => {
    if (choosing) refreshList();
  }, [choosing, refreshList]);

  return {
    messages,
    isTyping,
    freshAiId,
    sendMessage,
    requestTranslation,
    conversations,
    conversationId,
    choosing,
    startNew,
    openConversation,
    removeConversation,
    showChooser,
    hideChooser,
  };
}
