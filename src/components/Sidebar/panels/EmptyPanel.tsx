import { useI18n } from '../../../i18n';

export function EmptyPanel() {
  const { t } = useI18n();
  return (
    <div className="panel panel--empty">
      <div className="panel__empty-art" aria-hidden="true">
        <span>🔁</span>
        <span>🌐</span>
        <span>💡</span>
      </div>
      <p className="panel__empty-title">{t('emptyTitle')}</p>
      <ul className="panel__empty-list">
        <li>
          <span aria-hidden="true">🌐</span>
          <span>
            <strong>{t('hintTranslate')}</strong> {t('emptyTranslate')}
          </span>
        </li>
        <li>
          <span aria-hidden="true">💡</span>
          <span>
            <strong>{t('analyze')}</strong> {t('emptyAnalyze')}
          </span>
        </li>
        <li>
          <span aria-hidden="true">🔁</span>
          <span>
            <strong>{t('hintListen')}</strong> {t('emptyListen')}
          </span>
        </li>
      </ul>
    </div>
  );
}
