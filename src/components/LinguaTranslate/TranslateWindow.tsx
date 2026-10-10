import { useEffect, useRef } from 'react';
import { useLinguaTranslate } from '../../context/TranslateContext';
import { useDraggable } from '../../hooks/useDraggable';
import { useI18n } from '../../i18n';
import { CloseIcon, GripIcon, MinimizeIcon, TranslateIcon } from '../Icons/Icons';
import { TranslatePanel } from './TranslatePanel';

/** Breite der rechten Lernhilfe-Sidebar (wie in den Styles) – das Fenster startet über dem Chat. */
const sidebarWidth = () => (window.innerWidth > 1180 ? 368 : 320);

/** Desktop: schwebendes, verschiebbares Übersetzerfenster über der Chat-Ansicht. */
export function TranslateWindow() {
  const { t } = useI18n();
  const tr = useLinguaTranslate();
  const titleId = 'lingua-translate-title';

  const drag = useDraggable<HTMLDivElement>({
    position: tr.windowPos,
    keepVisible: 160,
    getDefault: ({ width }) => ({
      x: Math.max(16, (window.innerWidth - sidebarWidth() - width) / 2),
      y: 84,
    }),
    onCommit: tr.setWindowPos,
  });

  return (
    <div
      ref={drag.ref}
      className={`lt-window${drag.dragging ? ' is-dragging' : ''}`}
      style={drag.style}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          tr.minimize();
        }
      }}
    >
      <div className="lt-window__inner">
        <header className="lt-window__head" {...drag.handleProps} title={t('ltDragHint')}>
          <span className="lt-logo" aria-hidden="true">
            <TranslateIcon size={18} strokeWidth={2} />
          </span>
          <div className="lt-window__title">
            <h2 id={titleId}>Lingua Translate</h2>
            <p>{t('ltSubtitle')}</p>
          </div>
          <button
            type="button"
            data-drag-handle
            className="lt-grip"
            aria-label={t('ltDragHint')}
            title={t('ltDragHint')}
            onKeyDown={drag.onKeyDown}
          >
            <GripIcon size={18} />
          </button>
          <div className="lt-window__actions">
            <button type="button" className="lt-icon-btn" onClick={tr.minimize} aria-label={t('ltMinimize')} title={t('ltMinimize')}>
              <MinimizeIcon size={18} strokeWidth={2.2} />
            </button>
            <button type="button" className="lt-icon-btn" onClick={tr.close} aria-label={t('close')} title={t('close')}>
              <CloseIcon size={18} />
            </button>
          </div>
        </header>

        <TranslatePanel variant="window" autoFocus />

        <footer className="lt-window__foot">{t('credits', { provider: 'OVHcloud AI Endpoints & LLM7.io' })}</footer>
      </div>
    </div>
  );
}

/** Minimierte Ansicht: kleine, verschiebbare Blase – ein Klick öffnet das Fenster wieder. */
export function TranslateBubble() {
  const { t } = useI18n();
  const tr = useLinguaTranslate();
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const drag = useDraggable<HTMLDivElement>({
    position: tr.bubblePos,
    getDefault: ({ width, height }) => ({
      x: window.innerWidth - sidebarWidth() - width - 24,
      // über der Eingabezeile und den Vorschlägen des Chats
      y: window.innerHeight - height - 220,
    }),
    onCommit: tr.setBubblePos,
  });

  // Nach dem Minimieren den Fokus auf die Blase setzen (Tastaturbedienung) – erst nach dem Platzieren
  useEffect(() => {
    const id = window.setTimeout(() => buttonRef.current?.focus({ preventScroll: true }), 60);
    return () => window.clearTimeout(id);
  }, []);

  const pending = tr.status === 'loading';
  const ready = tr.status === 'done' && tr.result;

  return (
    <div ref={drag.ref} className={`lt-bubble${drag.dragging ? ' is-dragging' : ''}`} style={drag.style}>
      <button
        ref={buttonRef}
        type="button"
        data-drag-handle
        className="lt-bubble__btn"
        aria-label={t('ltRestore')}
        title={t('ltRestore')}
        {...drag.handleProps}
        onKeyDown={(e) => {
          if (e.key.startsWith('Arrow')) drag.onKeyDown(e);
        }}
        onClick={() => {
          if (!drag.wasDragged()) tr.open();
        }}
      >
        <TranslateIcon size={22} strokeWidth={2} />
        {(pending || ready) && <span className={`lt-bubble__dot${pending ? ' is-pending' : ''}`} aria-hidden="true" />}
      </button>
    </div>
  );
}
