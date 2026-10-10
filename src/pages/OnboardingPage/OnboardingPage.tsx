import { ArrowRightIcon, MoonIcon, SunIcon } from '../../components/Icons/Icons';
import { LanguageSelector } from '../../components/LanguageSelector/LanguageSelector';
import { LevelSelector } from '../../components/LevelSelector/LevelSelector';
import { Logo } from '../../components/Logo/Logo';
import { Toast } from '../../components/Toast/Toast';
import { VoiceAvatar } from '../../components/VoiceAvatar/VoiceAvatar';
import { LANGUAGES, getLanguage } from '../../data/languages';
import { getVoice } from '../../data/voices';
import { useSpeech } from '../../hooks/useSpeech';
import { useI18n } from '../../i18n';
import type { Settings, Theme } from '../../types';
import './OnboardingPage.scss';

interface OnboardingPageProps {
  settings: Settings;
  theme: Theme;
  onChange: (settings: Settings) => void;
  onToggleTheme: () => void;
  onStart: () => void;
}

/** Überschrift mit *hervorgehobenem* Wort. */
function HeroTitle({ text }: { text: string }) {
  const parts = text.split('*');
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="hero__accent">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function OnboardingPage({ settings, theme, onChange, onToggleTheme, onStart }: OnboardingPageProps) {
  const { t, languageName } = useI18n();
  const speech = useSpeech();

  const language = getLanguage(settings.language);
  const voice = getVoice(settings.voice);
  const invalid = settings.language === settings.nativeLanguage;

  const setNative = (nativeLanguage: Settings['nativeLanguage']) => {
    // Lernsprache darf nicht gleich der Muttersprache sein
    const languageClash = settings.language === nativeLanguage;
    onChange({
      ...settings,
      nativeLanguage,
      language: languageClash ? (nativeLanguage === 'en' ? 'fr' : 'en') : settings.language,
    });
  };

  return (
    <div className="onboarding">
      <div className="onboarding__glow" aria-hidden="true" />

      <header className="onboarding__top">
        <Logo />
        <button type="button" className="icon-btn" onClick={onToggleTheme} aria-label={t('toggleTheme')}>
          {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>
      </header>

      <main className="onboarding__main">
        <section className="hero">
          <span className="hero__badge">
            <span className="hero__pulse" aria-hidden="true" /> {t('tagline')}
          </span>
          <h1 className="hero__title">
            <HeroTitle text={t('heroTitle')} />
            <br />
            {t('heroTitle2')}
          </h1>
          <p className="hero__text">{t('heroText')}</p>
        </section>

        <div className="setup">
          <section className="setup__step" style={{ animationDelay: '0.05s' }}>
            <div className="setup__head">
              <span className="setup__num">1</span>
              <div>
                <h2>{t('stepNative')}</h2>
                <p>{t('stepNativeSub')}</p>
              </div>
            </div>
            <LanguageSelector label={t('nativeLabel')} value={settings.nativeLanguage} onChange={setNative} />
          </section>

          <section className="setup__step" style={{ animationDelay: '0.1s' }}>
            <div className="setup__head">
              <span className="setup__num">2</span>
              <div>
                <h2>{t('stepTarget')}</h2>
                <p>{t('stepTargetSub', { count: LANGUAGES.length })}</p>
              </div>
            </div>
            <LanguageSelector
              label={t('targetLabel')}
              value={settings.language}
              exclude={settings.nativeLanguage}
              onChange={(code) => onChange({ ...settings, language: code })}
            />
          </section>

          <section className="setup__step" style={{ animationDelay: '0.15s' }}>
            <div className="setup__head">
              <span className="setup__num">3</span>
              <div>
                <h2>{t('stepLevel')}</h2>
                <p>{t('stepLevelSub')}</p>
              </div>
            </div>
            <LevelSelector value={settings.level} onChange={(level) => onChange({ ...settings, level })} />
          </section>

        </div>
      </main>

      <div className="start-bar">
        <div className="start-bar__inner">
          <div className="start-bar__summary">
            <VoiceAvatar voice={voice} size={40} />
            <div>
              <span className="start-bar__label">
                {t('yourConversation')} · {t('modeLive')}
              </span>
              <span className="start-bar__value">
                {getLanguage(settings.nativeLanguage).flag} → {language.flag} {languageName(language.code)} ·{' '}
                {settings.level} · {voice.name}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn--primary start-bar__cta"
            onClick={() => {
              speech.stop();
              onStart();
            }}
            disabled={invalid}
            title={invalid ? t('sameLanguage') : undefined}
          >
            {t('start')}
            <ArrowRightIcon size={18} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <Toast message={speech.notice} onClose={speech.clearNotice} />
    </div>
  );
}
