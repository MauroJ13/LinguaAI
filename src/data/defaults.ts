import type { AiSettings, LanguageCode, Settings } from '../types';

export function createDefaultSettings(nativeLanguage: LanguageCode): Settings {
  return {
    nativeLanguage,
    language: nativeLanguage === 'fr' ? 'en' : 'fr',
    level: 'B1',
    voice: 'emma',
  };
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  autoSpeak: true,
  autoFeedback: true,
};
