import { useI18n } from '../../../i18n';
import type { TipAnalysis } from '../../../types';

export function TipPanel({ content, rtl }: { content: TipAnalysis; rtl?: boolean }) {
  const { t } = useI18n();
  const dir = rtl ? 'rtl' : 'auto';

  return (
    <div className="panel">
      <h2 className="panel__title">
        <span aria-hidden="true">💡</span> {t('tipTitle', { level: content.level })}
      </h2>

      <p className="panel__status panel__status--ok">
        <span aria-hidden="true">✓</span> {t('sentenceCorrect')}
      </p>

      <blockquote className="panel__quote" dir={dir}>
        {content.original}
      </blockquote>

      <div className="panel__section">
        <span className="panel__label">{t('betterForLevel', { level: content.level })}</span>
        <p className="panel__suggestion" dir={content.suggestion ? dir : 'auto'}>
          {content.suggestion ?? t('tipSplit')}
        </p>
      </div>

      <div className="panel__section">
        <span className="panel__label">{t('why')}</span>
        <p className="panel__text">
          {content.explanation ?? t('tipWhy', { estimated: content.estimatedLevel })}
        </p>
      </div>

      {content.expressions.length > 0 && (
        <div className="panel__section">
          <span className="panel__label">{t('expressions')}</span>
          <div className="panel__chips">
            {content.expressions.map((e) => (
              <span className="chip" key={e} dir={dir}>
                {e}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
