import { useI18n } from '../../../i18n';
import type { OkAnalysis } from '../../../types';

export function OkPanel({ content, rtl }: { content: OkAnalysis; rtl?: boolean }) {
  const { t } = useI18n();

  if (content.unchecked) {
    return (
      <div className="panel">
        <h2 className="panel__title">
          <span aria-hidden="true">💡</span> {t('modeDemo')}
        </h2>
        <blockquote className="panel__quote" dir={rtl ? 'rtl' : 'auto'}>
          {content.original}
        </blockquote>
        <p className="panel__missing">{t('modeDemoHint')}</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel__badge-ok" aria-hidden="true">
        ✓
      </div>
      <h2 className="panel__title">
        <span aria-hidden="true">✅</span> {t('okTitle', { level: content.level })}
      </h2>

      <p className="panel__text">{t('okText')}</p>

      <blockquote className="panel__quote" dir={rtl ? 'rtl' : 'auto'}>
        {content.original}
      </blockquote>

      <p className="panel__note">{content.note ?? t('okNote')}</p>
    </div>
  );
}
