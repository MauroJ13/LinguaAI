import { useEffect, useRef, useState } from 'react';
import { useLinguaTranslate } from '../../context/TranslateContext';
import { getLanguage } from '../../data/languages';
import { useSpeech } from '../../hooks/useSpeech';
import { useI18n } from '../../i18n';
import { MAX_TRANSLATE_CHARS } from '../../services/translate/translate';
import type { LanguageCode } from '../../types';
import { AlertIcon, CheckIcon, CloseIcon, CopyIcon, SpeakerIcon, StopIcon, SwapIcon } from '../Icons/Icons';
import { Toast } from '../Toast/Toast';
import { LanguagePicker } from './LanguagePicker';

interface TranslatePanelProps {
  /** window = schwebendes Desktop-Fenster, page = mobile Vollbild-Seite. */
  variant: 'window' | 'page';
  autoFocus?: boolean;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback für ältere Browser / unsichere Kontexte
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.focus();
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

/**
 * Herzstück von Lingua Translate: Sprachwahl, Eingabe, Übersetzung und Aktionen.
 * Wird im Desktop-Fenster und auf der mobilen Seite gleich verwendet – nur das Layout unterscheidet sich.
 */
export function TranslatePanel({ variant, autoFocus }: TranslatePanelProps) {
  const { t } = useI18n();
  const tr = useLinguaTranslate();
  const speech = useSpeech();
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLParagraphElement>(null);

  const sourceLang: LanguageCode | undefined = tr.source === 'auto' ? tr.detected : tr.source;
  const target = getLanguage(tr.target);
  const hasText = tr.text.trim().length > 0;
  const hasResult = tr.status === 'done' && tr.result.length > 0;
  const stale = hasResult && tr.text.trim() !== tr.resultFor;
  const sheet = variant === 'page' ? 'sheet' : 'dropdown';

  useEffect(() => {
    if (!autoFocus) return;
    const id = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 80);
    return () => window.clearTimeout(id);
  }, [autoFocus]);

  // Auf der mobilen Seite wächst das Eingabefeld mit dem Text
  useEffect(() => {
    const el = inputRef.current;
    if (!el || variant !== 'page') return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(150, el.scrollHeight)}px`;
  }, [tr.text, variant]);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(id);
  }, [copied]);

  const speak = (id: string, text: string, language: LanguageCode) =>
    void speech.speak(id, text, { language, level: 'B2', voice: 'emma' });

  const errorText =
    tr.error === 'rate' ? t('ltErrorRate') : tr.error === 'network' ? t('ltErrorNetwork') : t('ltError');

  return (
    <div className={`lt-panel lt-panel--${variant}`}>
      <div className="lt-langbar">
        <LanguagePicker
          label={t('ltSource')}
          value={tr.source}
          detected={tr.detected}
          allowAuto
          variant={sheet}
          onChange={tr.setSource}
        />
        <button
          type="button"
          className="lt-swap"
          onClick={tr.swap}
          disabled={!tr.canSwap}
          aria-label={t('ltSwap')}
          title={t('ltSwap')}
        >
          <SwapIcon size={18} strokeWidth={2} />
        </button>
        <LanguagePicker
          label={t('ltTarget')}
          value={tr.target}
          variant={sheet}
          onChange={(v) => v !== 'auto' && tr.setTarget(v)}
        />
      </div>

      <div className="lt-panes">
        {/* ---------- Ausgangstext ---------- */}
        <section className="lt-pane lt-pane--source" aria-label={t('ltSource')}>
          <textarea
            ref={inputRef}
            className="lt-input"
            value={tr.text}
            dir="auto"
            lang={sourceLang}
            maxLength={MAX_TRANSLATE_CHARS}
            placeholder={t('ltPlaceholder')}
            aria-label={t('ltPlaceholder')}
            spellCheck
            onChange={(e) => tr.setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                tr.translateNow();
              }
            }}
          />
          {hasText && (
            <button
              type="button"
              className="lt-icon-btn lt-clear"
              onClick={() => {
                tr.clear();
                inputRef.current?.focus();
              }}
              aria-label={t('ltClear')}
              title={t('ltClear')}
            >
              <CloseIcon size={18} />
            </button>
          )}
          <div className="lt-pane__foot">
            <button
              type="button"
              className="lt-icon-btn"
              disabled={!hasText || !sourceLang}
              onClick={() => sourceLang && speak('lt-source', tr.text, sourceLang)}
              aria-label={speech.speakingId === 'lt-source' ? t('ltStop') : t('ltListenSource')}
              title={speech.speakingId === 'lt-source' ? t('ltStop') : t('ltListenSource')}
            >
              {speech.speakingId === 'lt-source' ? <StopIcon size={18} /> : <SpeakerIcon size={18} />}
            </button>
            <span className="lt-hint">{variant === 'window' && hasText ? t('ltShortcut') : ''}</span>
            <span className="lt-count" aria-live="off">
              {tr.text.length.toLocaleString()} / {MAX_TRANSLATE_CHARS.toLocaleString()}
            </span>
          </div>
        </section>

        {/* ---------- Übersetzung ---------- */}
        <section
          className={`lt-pane lt-pane--result${tr.status === 'loading' ? ' is-loading' : ''}`}
          aria-label={t('ltTarget')}
          aria-busy={tr.status === 'loading'}
        >
          <span className="lt-progress" aria-hidden="true" />
          <div className="lt-result" aria-live="polite">
            {tr.status === 'error' ? (
              <div className="lt-error" role="alert">
                <AlertIcon size={22} />
                <div>
                  <p>{errorText}</p>
                  <button type="button" className="btn btn--ghost lt-retry" onClick={tr.translateNow}>
                    {t('ltRetry')}
                  </button>
                </div>
              </div>
            ) : hasResult ? (
              <p
                ref={outputRef}
                className={`lt-output${stale || tr.status === 'loading' ? ' is-stale' : ''}`}
                dir={target.rtl ? 'rtl' : 'ltr'}
                lang={target.code}
              >
                {tr.result}
              </p>
            ) : tr.status === 'loading' ? (
              <div className="lt-skeleton" aria-label={t('ltTranslating')}>
                <span />
                <span />
                <span />
              </div>
            ) : (
              <p className="lt-placeholder">{t('ltResultEmpty')}</p>
            )}
          </div>
          <div className="lt-pane__foot">
            <button
              type="button"
              className="lt-icon-btn"
              disabled={!hasResult}
              onClick={() => speak('lt-result', tr.result, tr.target)}
              aria-label={speech.speakingId === 'lt-result' ? t('ltStop') : t('ltListenResult')}
              title={speech.speakingId === 'lt-result' ? t('ltStop') : t('ltListenResult')}
            >
              {speech.speakingId === 'lt-result' ? <StopIcon size={18} /> : <SpeakerIcon size={18} />}
            </button>
            <span className="lt-hint">{tr.status === 'loading' ? t('ltTranslating') : ''}</span>
            <button
              type="button"
              className={`lt-copy${copied ? ' is-copied' : ''}`}
              disabled={!hasResult}
              onClick={async () => {
                const ok = await copyToClipboard(tr.result);
                setCopied(ok);
                // Zwischenablage gesperrt → Übersetzung markieren, damit man sie mit Strg/⌘+C kopieren kann
                if (!ok && outputRef.current) window.getSelection()?.selectAllChildren(outputRef.current);
              }}
            >
              {copied ? <CheckIcon size={16} strokeWidth={2.6} /> : <CopyIcon size={16} />}
              <span>{copied ? t('ltCopied') : t('ltCopy')}</span>
            </button>
          </div>
        </section>
      </div>

      <Toast message={speech.notice} onClose={speech.clearNotice} />
    </div>
  );
}
