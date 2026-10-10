import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { DEFAULT_AI_SETTINGS } from '../data/defaults';
import type { AiSettings } from '../types';

const STORAGE_KEY = 'linguaai.ai-settings';

function load(): AiSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AI_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AiSettings>;
    return {
      autoSpeak: parsed.autoSpeak !== false,
      autoFeedback: parsed.autoFeedback !== false,
    };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

interface AiSettingsValue {
  ai: AiSettings;
  /** Echte KI ist immer aktiv (kostenlose Dienste ohne Schlüssel). */
  aiEnabled: boolean;
  updateAi: (patch: Partial<AiSettings>) => void;
}

const AiSettingsContext = createContext<AiSettingsValue>({
  ai: DEFAULT_AI_SETTINGS,
  aiEnabled: true,
  updateAi: () => undefined,
});

/** KI-Einstellungen (automatisches Vorlesen, Auto-Feedback) – lokal im Browser gespeichert. */
export function AiSettingsProvider({ children }: { children: ReactNode }) {
  const [ai, setAi] = useState<AiSettings>(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ai));
    } catch {
      /* Speicher nicht verfügbar – Einstellungen gelten nur für diese Sitzung. */
    }
  }, [ai]);

  const updateAi = useCallback((patch: Partial<AiSettings>) => setAi((prev) => ({ ...prev, ...patch })), []);

  return (
    <AiSettingsContext.Provider value={{ ai, aiEnabled: true, updateAi }}>
      {children}
    </AiSettingsContext.Provider>
  );
}

export function useAiSettings(): AiSettingsValue {
  return useContext(AiSettingsContext);
}
