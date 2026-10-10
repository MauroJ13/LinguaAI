import { useEffect, useState } from 'react';
import { getLanguage } from '../../data/languages';
import { I18nProvider, useI18n } from '../../i18n';
import type { Settings } from '../../types';
import { AiSettingsPanel } from '../AiSettingsPanel/AiSettingsPanel';
import { CloseIcon } from '../Icons/Icons';
import { LanguageSelector } from '../LanguageSelector/LanguageSelector';
import { LevelSelector } from '../LevelSelector/LevelSelector';
import './SettingsModal.scss';

export type SettingsTab = 'languages' | 'level' | 'ai';

interface SettingsModalProps {
  settings: Settings;
  initialTab?: SettingsTab;
  onClose: () => void;
  onApply: (settings: Settings) => void;
  /** Zurück zum Startbildschirm (Sprachen neu wählen). */
  onBackToStart?: () => void;
}

function SettingsContent({
  settings,
  initialTab = 'languages',
  onClose,
  onApply,
  onBackToStart,
  draft,
  setDraft,
}: SettingsModalProps & { draft: Settings; setDraft: (s: Settings) => void }) {
  const { t, languageName } = useI18n();
  const [tab, setTab] = useState<SettingsTab>(initialTab);

  const languageChanged = draft.language !== settings.language || draft.nativeLanguage !== settings.nativeLanguage;
  const invalid = draft.language === draft.nativeLanguage;
  const hasChanges = languageChanged || draft.level !== settings.level;

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'languages', label: t('tabLanguages') },
    { id: 'level', label: t('tabLevel') },
    { id: 'ai', label: t('tabAi') },
  ];

  return (
    <div className="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <header className="modal__head">
        <div>
          <h2 id="settings-title">{t('settings')}</h2>
          <p>{t('settingsSub')}</p>
        </div>
        <button type="button" className="modal__close" onClick={onClose} aria-label={t('close')}>
          <CloseIcon size={18} />
        </button>
      </header>

      <nav className="modal__tabs" role="tablist">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`modal__tab${tab === item.id ? ' is-active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="modal__body" role="tabpanel">
        {tab === 'languages' && (
          <div className="modal__languages">
            <section>
              <h3 className="modal__section-title">{t('nativeLabel')}</h3>
              <LanguageSelector
                compact
                label={t('nativeLabel')}
                value={draft.nativeLanguage}
                onChange={(nativeLanguage) => setDraft({ ...draft, nativeLanguage })}
              />
            </section>
            <section>
              <h3 className="modal__section-title">{t('targetLabel')}</h3>
              <LanguageSelector
                compact
                label={t('targetLabel')}
                value={draft.language}
                exclude={draft.nativeLanguage}
                onChange={(language) => setDraft({ ...draft, language })}
              />
            </section>
          </div>
        )}
        {tab === 'level' && <LevelSelector value={draft.level} onChange={(level) => setDraft({ ...draft, level })} />}
        {tab === 'ai' && <AiSettingsPanel />}
      </div>

      <footer className="modal__foot">
        <p className={`modal__warning${languageChanged || invalid ? ' is-visible' : ''}`}>
          {invalid
            ? t('sameLanguage')
            : languageChanged && t('newChatWarning', { language: languageName(draft.language) })}
        </p>
        <div className="modal__buttons">
          {onBackToStart && tab === 'languages' && (
            <button type="button" className="btn btn--ghost" onClick={onBackToStart}>
              {t('backToStart')}
            </button>
          )}
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {tab === 'ai' && !hasChanges ? t('close') : t('cancel')}
          </button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={!hasChanges || invalid}
            onClick={() => onApply(draft)}
          >
            {t('apply')}
          </button>
        </div>
      </footer>
    </div>
  );
}

export function SettingsModal(props: SettingsModalProps) {
  const [draft, setDraft] = useState<Settings>(props.settings);
  const { onClose } = props;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Vorschau: Das Menü erscheint sofort in der neu gewählten Muttersprache.
  return (
    <I18nProvider lang={draft.nativeLanguage} applyToDocument={false}>
      <div
        className="modal"
        role="presentation"
        dir={getLanguage(draft.nativeLanguage).rtl ? 'rtl' : 'ltr'}
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <SettingsContent {...props} draft={draft} setDraft={setDraft} />
      </div>
    </I18nProvider>
  );
}
