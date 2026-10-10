import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { LANGUAGES, getLanguage } from '../../data/languages';
import { useI18n } from '../../i18n';
import type { SourceLanguage } from '../../services/translate/translate';
import type { LanguageCode } from '../../types';
import { CheckIcon, ChevronDownIcon, CloseIcon, SearchIcon, SparkleIcon } from '../Icons/Icons';

interface LanguagePickerProps {
  value: SourceLanguage;
  onChange: (value: SourceLanguage) => void;
  /** Option „Sprache erkennen“ anbieten (nur Quellsprache). */
  allowAuto?: boolean;
  /** Erkannte Sprache (bei „Sprache erkennen“). */
  detected?: LanguageCode;
  /** Beschriftung für Screenreader, z. B. „Ausgangssprache“. */
  label: string;
  /** dropdown = Desktop-Fenster, sheet = Bottom-Sheet auf dem Smartphone. */
  variant?: 'dropdown' | 'sheet';
}

interface Option {
  value: SourceLanguage;
  flag: string;
  name: string;
  native?: string;
  rtl?: boolean;
}

/** Sprachauswahl für Lingua Translate – Suche, Tastatursteuerung, alle 20 Sprachen. */
export function LanguagePicker({ value, onChange, allowAuto, detected, label, variant = 'dropdown' }: LanguagePickerProps) {
  const { t, languageName } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const options = useMemo<Option[]>(() => {
    const langs: Option[] = LANGUAGES.map((l) => ({
      value: l.code,
      flag: l.flag,
      name: languageName(l.code),
      native: l.nativeName,
      rtl: l.rtl,
    })).sort((a, b) => a.name.localeCompare(b.name));
    return allowAuto ? [{ value: 'auto', flag: '', name: t('ltAuto') }, ...langs] : langs;
  }, [allowAuto, languageName, t]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const english = o.value === 'auto' ? '' : getLanguage(o.value).englishName;
      return [o.name, o.native ?? '', english].some((n) => n.toLowerCase().includes(q));
    });
  }, [options, query]);

  const close = (focusTrigger = true) => {
    setOpen(false);
    setQuery('');
    if (focusTrigger) triggerRef.current?.focus();
  };

  const select = (v: SourceLanguage) => {
    onChange(v);
    close();
  };

  // Beim Öffnen: Suche fokussieren, aktuelle Sprache markieren
  useEffect(() => {
    if (!open) return;
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    const id = window.setTimeout(() => searchRef.current?.focus({ preventScroll: true }), 30);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Klick außerhalb schließt (nur Dropdown – das Sheet hat einen Hintergrund)
  useEffect(() => {
    if (!open || variant === 'sheet') return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, variant]);

  // Aktive Option sichtbar halten
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[active];
      if (opt) select(opt.value);
    }
  };

  const current = value === 'auto' ? null : getLanguage(value);

  return (
    <div className={`lt-picker lt-picker--${variant}${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="lt-picker__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${current ? languageName(current.code) : t('ltAuto')}`}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {current ? (
          <span className="lt-picker__flag" aria-hidden="true">
            {current.flag}
          </span>
        ) : (
          <span className="lt-picker__flag lt-picker__flag--auto" aria-hidden="true">
            <SparkleIcon size={15} strokeWidth={2} />
          </span>
        )}
        <span className="lt-picker__text">
          <span className="lt-picker__name">{current ? languageName(current.code) : t('ltAuto')}</span>
          {!current && detected && (
            <span className="lt-picker__detected">{t('ltDetected', { language: languageName(detected) })}</span>
          )}
        </span>
        <ChevronDownIcon size={16} className="lt-picker__chevron" />
      </button>

      {open && (
        <>
          {variant === 'sheet' && <div className="lt-picker__backdrop" onClick={() => close()} aria-hidden="true" />}
          <div className="lt-picker__popover" role="dialog" aria-label={label} onKeyDown={onKeyDown}>
            {variant === 'sheet' && (
              <div className="lt-picker__sheet-head">
                <strong>{label}</strong>
                <button type="button" className="lt-icon-btn" onClick={() => close()} aria-label={t('close')}>
                  <CloseIcon size={18} />
                </button>
              </div>
            )}
            <label className="lt-picker__search">
              <SearchIcon size={16} />
              <input
                ref={searchRef}
                type="search"
                value={query}
                placeholder={t('searchLanguage')}
                aria-label={t('searchLanguage')}
                aria-controls={listId}
                aria-activedescendant={filtered[active] ? `${listId}-${active}` : undefined}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
              />
            </label>
            <ul className="lt-picker__list" role="listbox" id={listId} aria-label={label} ref={listRef}>
              {filtered.map((o, i) => {
                const selected = o.value === value;
                return (
                  <li
                    key={o.value}
                    id={`${listId}-${i}`}
                    data-index={i}
                    role="option"
                    aria-selected={selected}
                    className={`lt-picker__option${i === active ? ' is-active' : ''}${selected ? ' is-selected' : ''}`}
                    onPointerEnter={() => setActive(i)}
                    onClick={() => select(o.value)}
                  >
                    <span className="lt-picker__flag" aria-hidden="true">
                      {o.value === 'auto' ? <SparkleIcon size={15} strokeWidth={2} /> : o.flag}
                    </span>
                    <span className="lt-picker__option-text">
                      <span>{o.name}</span>
                      {o.native && o.native !== o.name && (
                        <small dir={o.rtl ? 'rtl' : 'ltr'}>{o.native}</small>
                      )}
                    </span>
                    {selected && <CheckIcon size={16} strokeWidth={2.6} className="lt-picker__check" />}
                  </li>
                );
              })}
              {filtered.length === 0 && <li className="lt-picker__empty">{t('noLanguage')}</li>}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
