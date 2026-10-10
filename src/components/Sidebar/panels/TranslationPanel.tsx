import { useI18n } from '../../../i18n';
import type { ChatMessage, Language } from '../../../types';
import { LoadingPanel } from './LoadingPanel';

interface TranslationPanelProps {
  message: ChatMessage;
  targetLanguage: Language;
  live: boolean;
}

export function TranslationPanel({ message, targetLanguage }: TranslationPanelProps) {
  const { t, lang, languageName } = useI18n();

  if (!message.translation && message.translationStatus === 'pending') {
    return <LoadingPanel icon="🌐" label={t('translating')} />;
  }

  return (
    <div className="panel">
      <h2 className="panel__title">
        <span aria-hidden="true">🌐</span> {t('translation')}
      </h2>

      {message.translation ? (
        <p className="panel__translation" lang={lang}>
          {message.translation}
        </p>
      ) : (
        <p className="panel__missing">{t('translationMissing')}</p>
      )}

      <div className="panel__section">
        <span className="panel__label">
          {t('original')} · {languageName(targetLanguage.code)}
        </span>
        <blockquote className="panel__quote" dir={targetLanguage.rtl ? 'rtl' : 'auto'} lang={targetLanguage.code}>
          {message.text}
        </blockquote>
      </div>

      <p className="panel__note">{t('translationTip')}</p>
    </div>
  );
}
