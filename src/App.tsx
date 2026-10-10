import { useEffect, useState } from 'react';
import { AiSettingsProvider } from './context/AiSettingsContext';
import { TranslateProvider } from './context/TranslateContext';
import { createDefaultSettings } from './data/defaults';
import { detectNativeLanguage } from './data/languages';
import { useTheme } from './hooks/useTheme';
import { I18nProvider } from './i18n';
import { ChatPage } from './pages/ChatPage/ChatPage';
import { OnboardingPage } from './pages/OnboardingPage/OnboardingPage';
import { clearSettings, loadSettings, saveSettings } from './services/storage';
import type { Settings } from './types';

// Wer schon einmal eine Sprache gewählt hat, landet direkt im Chat.
const savedSettings = loadSettings();

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<Settings>(() => savedSettings ?? createDefaultSettings(detectNativeLanguage()));
  const [started, setStarted] = useState(Boolean(savedSettings));

  // Einstellungen merken, sobald der Chat läuft
  useEffect(() => {
    if (started) saveSettings(settings);
  }, [started, settings]);

  const backToStart = () => {
    clearSettings();
    setStarted(false);
  };

  return (
    <AiSettingsProvider>
      {/* Die Oberfläche erscheint immer in der gewählten Muttersprache */}
      <I18nProvider lang={settings.nativeLanguage}>
        {/* Lingua Translate: Zustand bleibt beim Minimieren, Schließen und Ansichtswechsel erhalten */}
        <TranslateProvider defaultTarget={settings.nativeLanguage}>
        {started ? (
          <ChatPage
            settings={settings}
            theme={theme}
            onToggleTheme={toggleTheme}
            onSettingsChange={setSettings}
            onBackToStart={backToStart}
          />
        ) : (
          <OnboardingPage
            settings={settings}
            theme={theme}
            onChange={setSettings}
            onToggleTheme={toggleTheme}
            onStart={() => setStarted(true)}
          />
        )}
        </TranslateProvider>
      </I18nProvider>
    </AiSettingsProvider>
  );
}
