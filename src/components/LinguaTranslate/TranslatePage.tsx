import { useEffect, useRef } from 'react';
import { useLinguaTranslate } from '../../context/TranslateContext';
import { useI18n } from '../../i18n';
import { ArrowLeftIcon, TranslateIcon } from '../Icons/Icons';
import { TranslatePanel } from './TranslatePanel';

const HASH = '#translate';

/**
 * Smartphone: eigene Vollbild-Seite statt Fenster.
 * Sie bekommt einen Eintrag im Browserverlauf – die Zurück-Geste / Zurück-Taste des Handys
 * führt also wie in einer nativen App zum Chat zurück. Text und Übersetzung bleiben erhalten.
 */
export function TranslatePage() {
  const { t } = useI18n();
  const tr = useLinguaTranslate();
  const pushedRef = useRef(false);
  const closeRef = useRef(tr.close);
  closeRef.current = tr.close;

  useEffect(() => {
    if (window.location.hash !== HASH) {
      window.history.pushState({ linguaTranslate: true }, '', HASH);
    }
    pushedRef.current = true;
    const onPop = () => {
      if (window.location.hash !== HASH) {
        pushedRef.current = false;
        closeRef.current();
      }
    };
    window.addEventListener('popstate', onPop);
    // Hintergrund nicht mitscrollen lassen
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('popstate', onPop);
      document.body.style.overflow = overflow;
      // z. B. Wechsel zur Desktop-Ansicht: Verlaufseintrag still entfernen
      if (pushedRef.current && window.location.hash === HASH) {
        window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
      }
    };
  }, []);

  const back = () => {
    if (pushedRef.current && window.location.hash === HASH) window.history.back();
    else tr.close();
  };

  return (
    <div className="lt-page" role="dialog" aria-modal="true" aria-labelledby="lt-page-title">
      <header className="lt-page__head">
        <button type="button" className="lt-page__back" onClick={back} aria-label={t('ltBack')}>
          <ArrowLeftIcon size={22} strokeWidth={2.2} />
        </button>
        <div className="lt-page__title">
          <span className="lt-logo" aria-hidden="true">
            <TranslateIcon size={16} strokeWidth={2} />
          </span>
          <h1 id="lt-page-title">Lingua Translate</h1>
        </div>
        <span className="lt-page__spacer" aria-hidden="true" />
      </header>

      <main className="lt-page__body">
        <TranslatePanel variant="page" />
        <p className="lt-page__credits">{t('credits', { provider: 'OVHcloud AI Endpoints & LLM7.io' })}</p>
      </main>
    </div>
  );
}
