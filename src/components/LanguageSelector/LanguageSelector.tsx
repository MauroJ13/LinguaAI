import { useMemo, useState } from 'react';
import { LANGUAGES } from '../../data/languages';
import { useI18n } from '../../i18n';
import type { LanguageCode } from '../../types';
import { CheckIcon, SearchIcon } from '../Icons/Icons';
import './LanguageSelector.scss';

interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (code: LanguageCode) => void;
  /** Sprache, die hier nicht gewählt werden kann (z. B. die Muttersprache). */
  exclude?: LanguageCode;
  compact?: boolean;
  label?: string;
}

export function LanguageSelector({ value, onChange, exclude, compact = false, label }: LanguageSelectorProps) {
  const { t, languageName } = useI18n();
  const [query, setQuery] = useState('');

  const items = useMemo(
    () => LANGUAGES.map((lang) => ({ ...lang, displayName: languageName(lang.code) })),
    [languageName],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (l) =>
        l.displayName.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.englishName.toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <div className={`language-selector${compact ? ' language-selector--compact' : ''}`}>
      <label className="language-selector__search">
        <SearchIcon size={17} />
        <input
          type="search"
          placeholder={t('searchLanguage')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t('searchLanguage')}
        />
      </label>

      <div className="language-selector__grid" role="radiogroup" aria-label={label}>
        {filtered.map((lang) => {
          const selected = lang.code === value;
          const disabled = lang.code === exclude;
          return (
            <button
              key={lang.code}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              title={disabled ? t('sameLanguage') : undefined}
              className={`language-card${selected ? ' is-selected' : ''}`}
              onClick={() => onChange(lang.code)}
            >
              <span className="language-card__flag" aria-hidden="true">
                {lang.flag}
              </span>
              <span className="language-card__names">
                <span className="language-card__name">{lang.displayName}</span>
                <span className="language-card__native" dir={lang.rtl ? 'rtl' : 'ltr'}>
                  {lang.nativeName}
                </span>
              </span>
              <span className="language-card__check" aria-hidden="true">
                <CheckIcon size={13} strokeWidth={3} />
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && <p className="language-selector__empty">{t('noLanguage')}</p>}
      </div>
    </div>
  );
}
