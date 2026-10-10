import type { Language, LanguageCode } from '../types';

export const LANGUAGES: Language[] = [
  { code: 'de', englishName: 'German', nativeName: 'Deutsch', flag: '🇩🇪', speech: ['de-DE', 'de'] },
  { code: 'en', englishName: 'English', nativeName: 'English', flag: '🇬🇧', speech: ['en-GB', 'en-US', 'en'] },
  { code: 'fr', englishName: 'French', nativeName: 'Français', flag: '🇫🇷', speech: ['fr-FR', 'fr'] },
  { code: 'es', englishName: 'Spanish', nativeName: 'Español', flag: '🇪🇸', speech: ['es-ES', 'es'] },
  { code: 'it', englishName: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', speech: ['it-IT', 'it'] },
  { code: 'pt', englishName: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', speech: ['pt-PT', 'pt-BR', 'pt'] },
  { code: 'ru', englishName: 'Russian', nativeName: 'Русский', flag: '🇷🇺', speech: ['ru-RU', 'ru'] },
  {
    code: 'hr',
    englishName: 'Serbo-Croatian (Latin script)',
    nativeName: 'Srpskohrvatski',
    flag: '🇭🇷',
    speech: ['hr-HR', 'hr', 'sr-RS', 'sr', 'bs-BA', 'bs'],
  },
  { code: 'pl', englishName: 'Polish', nativeName: 'Polski', flag: '🇵🇱', speech: ['pl-PL', 'pl'] },
  { code: 'nl', englishName: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', speech: ['nl-NL', 'nl'] },
  { code: 'tr', englishName: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', speech: ['tr-TR', 'tr'] },
  { code: 'sv', englishName: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', speech: ['sv-SE', 'sv'] },
  { code: 'ja', englishName: 'Japanese', nativeName: '日本語', flag: '🇯🇵', speech: ['ja-JP', 'ja'] },
  { code: 'ko', englishName: 'Korean', nativeName: '한국어', flag: '🇰🇷', speech: ['ko-KR', 'ko'] },
  { code: 'zh', englishName: 'Chinese (Mandarin, simplified)', nativeName: '中文', flag: '🇨🇳', speech: ['zh-CN', 'zh'] },
  { code: 'el', englishName: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', speech: ['el-GR', 'el'] },
  { code: 'ar', englishName: 'Arabic (Modern Standard)', nativeName: 'العربية', flag: '🇸🇦', speech: ['ar-SA', 'ar'], rtl: true },
  { code: 'hi', englishName: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', speech: ['hi-IN', 'hi'] },
  // Latein: kaum ein System hat eine lateinische Stimme → Italienisch klingt der Kirchenaussprache am nächsten.
  { code: 'la', englishName: 'Latin', nativeName: 'Latina', flag: '🇻🇦', speech: ['la', 'it-IT', 'it'] },
  { code: 'he', englishName: 'Modern Hebrew', nativeName: 'עברית', flag: '🇮🇱', speech: ['he-IL', 'he', 'iw-IL'], rtl: true },
];

export function getLanguage(code: LanguageCode): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[2];
}

export function isLanguageCode(value: string): value is LanguageCode {
  return LANGUAGES.some((l) => l.code === value);
}

/** Muttersprache anhand der Browsersprache vorschlagen (Standard: Deutsch). */
export function detectNativeLanguage(): LanguageCode {
  if (typeof navigator === 'undefined') return 'de';
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of langs) {
    const base = tag.toLowerCase().split('-')[0];
    const mapped = base === 'sr' || base === 'bs' || base === 'sh' ? 'hr' : base === 'iw' ? 'he' : base;
    if (isLanguageCode(mapped)) return mapped;
  }
  return 'de';
}
