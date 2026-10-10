import { useI18n } from '../../i18n';
import type { Language, Level, Theme } from '../../types';
import { ChatsIcon, MoonIcon, RefreshIcon, SettingsIcon, SunIcon, TranslateIcon } from '../Icons/Icons';
import { Logo } from '../Logo/Logo';
import './Header.scss';

interface HeaderProps {
  language: Language;
  level: Level;
  theme: Theme;
  live: boolean;
  onToggleTheme: () => void;
  onOpenSettings: (tab?: 'languages' | 'level' | 'ai') => void;
  onNewChat: () => void;
  /** Gesprächsauswahl öffnen (fortsetzen / neu). */
  onShowChats: () => void;
  /** Lingua Translate öffnen. */
  onOpenTranslate: () => void;
  translateOpen?: boolean;
}

export function Header({ language, level, theme, live, onToggleTheme, onOpenSettings, onNewChat, onShowChats, onOpenTranslate, translateOpen }: HeaderProps) {
  const { t, languageName } = useI18n();

  return (
    <header className="app-header">
      <div className="app-header__left">
        <Logo />
        <span className="app-header__divider" aria-hidden="true" />
        <button type="button" className="session-pill" onClick={() => onOpenSettings('languages')}>
          <span className="session-pill__flag" aria-hidden="true">
            {language.flag}
          </span>
          <span className="session-pill__lang">{languageName(language.code)}</span>
          <span className="session-pill__dot" aria-hidden="true">
            ·
          </span>
          <span className="session-pill__level">{level}</span>
        </button>
      </div>

      <div className="app-header__right">
        <button
          type="button"
          className={`mode-pill mode-pill--${live ? 'live' : 'demo'}`}
          onClick={() => onOpenSettings('ai')}
          title={live ? t('modeLive') : t('modeDemoHint')}
        >
          <span className="mode-pill__dot" aria-hidden="true" />
          <span className="mode-pill__label">{live ? t('modeLive') : t('modeDemo')}</span>
        </button>

        <button
          type="button"
          className={`translate-pill${translateOpen ? ' is-active' : ''}`}
          onClick={onOpenTranslate}
          aria-pressed={translateOpen}
          title={t('ltOpen')}
        >
          <TranslateIcon size={17} strokeWidth={2} />
          <span>Lingua Translate</span>
        </button>

        <button type="button" className="voice-pill" onClick={onShowChats} title={t('chatsButton')}>
          <ChatsIcon size={18} />
          <span>{t('chatsButton')}</span>
        </button>

        <button type="button" className="icon-btn" onClick={onNewChat} title={t('newChat')} aria-label={t('newChat')}>
          <RefreshIcon size={18} />
        </button>

        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          title={t('toggleTheme')}
          aria-label={t('toggleTheme')}
        >
          {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>

        <button type="button" className="settings-btn" onClick={() => onOpenSettings()}>
          <SettingsIcon size={18} />
          <span>{t('settings')}</span>
        </button>
      </div>
    </header>
  );
}
