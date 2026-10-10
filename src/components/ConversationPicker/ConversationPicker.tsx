import { useI18n } from '../../i18n';
import type { ConversationMeta, Language } from '../../types';
import { ArrowRightIcon, CloseIcon, PlusIcon, TrashIcon } from '../Icons/Icons';
import './ConversationPicker.scss';

interface ConversationPickerProps {
  language: Language;
  conversations: ConversationMeta[];
  /** Gerade geöffnetes Gespräch (null = noch keins gewählt). */
  currentId: string | null;
  onContinue: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

/** „Wann?“ in der Muttersprache, z. B. „vor 2 Stunden“ / „gestern“. */
function useRelativeTime() {
  const { lang } = useI18n();
  const rtf = new Intl.RelativeTimeFormat(lang === 'la' ? 'it' : lang, { numeric: 'auto' });
  return (ts: number) => {
    const diff = (ts - Date.now()) / 1000;
    const abs = Math.abs(diff);
    if (abs < 60) return rtf.format(0, 'second');
    if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
    if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
    if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day');
    return new Date(ts).toLocaleDateString(lang === 'la' ? 'it' : lang);
  };
}

/**
 * Gesprächsauswahl pro Lernsprache: letztes Gespräch fortsetzen, ein früheres öffnen
 * oder ein neues beginnen.
 */
export function ConversationPicker({
  language,
  conversations,
  currentId,
  onContinue,
  onNew,
  onDelete,
  onClose,
}: ConversationPickerProps) {
  const { t, languageName } = useI18n();
  const when = useRelativeTime();
  const [latest, ...older] = conversations;

  return (
    <section className="picker" aria-labelledby="picker-title">
      <div className="picker__card">
        {currentId && (
          <button type="button" className="picker__close" onClick={onClose} aria-label={t('close')}>
            <CloseIcon size={18} />
          </button>
        )}

        <div className="picker__head">
          <span className="picker__flag" aria-hidden="true">
            {language.flag}
          </span>
          <h2 id="picker-title">{t('chatsTitle', { language: languageName(language.code) })}</h2>
          <p>{t('chatsSub')}</p>
        </div>

        {latest && (
          <button type="button" className="picker__continue" onClick={() => onContinue(latest.id)}>
            <span className="picker__continue-label">
              {latest.id === currentId ? t('chatsCurrent') : t('chatsContinue')}
            </span>
            <span className="picker__preview">„{latest.preview}“</span>
            <span className="picker__meta">
              {when(latest.updatedAt)} · {t('chatsMessages', { count: latest.count })}
            </span>
            <span className="picker__arrow" aria-hidden="true">
              <ArrowRightIcon size={20} strokeWidth={2.2} />
            </span>
          </button>
        )}

        <button type="button" className="btn btn--primary picker__new" onClick={onNew}>
          <PlusIcon size={18} strokeWidth={2.2} />
          {t('chatsNew')}
        </button>

        {older.length > 0 && (
          <div className="picker__older">
            <span className="picker__older-title">{t('chatsOlder')}</span>
            <ul>
              {older.map((c) => (
                <li key={c.id} className={c.id === currentId ? 'is-current' : undefined}>
                  <button type="button" className="picker__item" onClick={() => onContinue(c.id)}>
                    <span className="picker__item-text">„{c.preview}“</span>
                    <span className="picker__item-meta">
                      {when(c.updatedAt)} · {t('chatsMessages', { count: c.count })}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="picker__delete"
                    onClick={() => onDelete(c.id)}
                    aria-label={t('chatsDelete')}
                    title={t('chatsDelete')}
                  >
                    <TrashIcon size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {latest && (
          <button type="button" className="picker__delete-latest" onClick={() => onDelete(latest.id)}>
            <TrashIcon size={14} /> {t('chatsDeleteLatest')}
          </button>
        )}
      </div>
    </section>
  );
}
