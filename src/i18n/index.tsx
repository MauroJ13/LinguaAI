import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { getLanguage } from '../data/languages';
import type { LanguageCode } from '../types';
import { ar, arNames } from './locales/ar';
import { de, deNames } from './locales/de';
import { el, elNames } from './locales/el';
import { en, enNames } from './locales/en';
import { es, esNames } from './locales/es';
import { fr, frNames } from './locales/fr';
import { he, heNames } from './locales/he';
import { hi, hiNames } from './locales/hi';
import { hr, hrNames } from './locales/hr';
import { it, itNames } from './locales/it';
import { ja, jaNames } from './locales/ja';
import { ko, koNames } from './locales/ko';
import { la, laNames } from './locales/la';
import { nl, nlNames } from './locales/nl';
import { pl, plNames } from './locales/pl';
import { pt, ptNames } from './locales/pt';
import { ru, ruNames } from './locales/ru';
import { sv, svNames } from './locales/sv';
import { tr, trNames } from './locales/tr';
import { zh, zhNames } from './locales/zh';
import type { UiKey, UiStrings } from './types';

type NameOverrides = Partial<Record<LanguageCode, string>>;

const LOCALES: Record<LanguageCode, { strings: UiStrings; names: NameOverrides }> = {
  de: { strings: de, names: deNames },
  en: { strings: en, names: enNames },
  fr: { strings: fr, names: frNames },
  es: { strings: es, names: esNames },
  it: { strings: it, names: itNames },
  pt: { strings: pt, names: ptNames },
  ru: { strings: ru, names: ruNames },
  hr: { strings: hr, names: hrNames },
  pl: { strings: pl, names: plNames },
  nl: { strings: nl, names: nlNames },
  tr: { strings: tr, names: trNames },
  sv: { strings: sv, names: svNames },
  ja: { strings: ja, names: jaNames },
  ko: { strings: ko, names: koNames },
  zh: { strings: zh, names: zhNames },
  el: { strings: el, names: elNames },
  ar: { strings: ar, names: arNames },
  hi: { strings: hi, names: hiNames },
  la: { strings: la, names: laNames },
  he: { strings: he, names: heNames },
};

export type TranslateFn = (key: UiKey, vars?: Record<string, string | number>) => string;

export interface I18n {
  lang: LanguageCode;
  dir: 'ltr' | 'rtl';
  t: TranslateFn;
  /** Name einer Sprache in der aktuellen Oberflächensprache (großgeschrieben). */
  languageName: (code: LanguageCode) => string;
}

function capitalize(value: string, locale: string): string {
  return value.charAt(0).toLocaleUpperCase(locale) + value.slice(1);
}

export function createI18n(lang: LanguageCode): I18n {
  const locale = LOCALES[lang] ?? LOCALES.de;
  let displayNames: Intl.DisplayNames | null = null;
  try {
    displayNames = new Intl.DisplayNames([lang], { type: 'language' });
  } catch {
    displayNames = null;
  }

  const t: TranslateFn = (key, vars) => {
    let text = locale.strings[key] ?? LOCALES.en.strings[key] ?? key;
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.split(`{${name}}`).join(String(value));
      }
    }
    return text;
  };

  const languageName = (code: LanguageCode) => {
    const override = locale.names[code];
    if (override) return capitalize(override, lang);
    const fromIntl = displayNames?.of(code);
    if (fromIntl && fromIntl.toLowerCase() !== code) return capitalize(fromIntl, lang);
    return getLanguage(code).nativeName;
  };

  return { lang, dir: getLanguage(lang).rtl ? 'rtl' : 'ltr', t, languageName };
}

const I18nContext = createContext<I18n>(createI18n('de'));

interface I18nProviderProps {
  lang: LanguageCode;
  children: ReactNode;
  /** false für verschachtelte Vorschauen (z. B. im Einstellungsdialog). */
  applyToDocument?: boolean;
}

export function I18nProvider({ lang, children, applyToDocument = true }: I18nProviderProps) {
  const value = useMemo(() => createI18n(lang), [lang]);

  useEffect(() => {
    if (!applyToDocument) return;
    document.documentElement.lang = lang;
    document.documentElement.dir = value.dir;
  }, [lang, value.dir, applyToDocument]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}

export type { UiKey } from './types';
