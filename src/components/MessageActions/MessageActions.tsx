import { useI18n } from '../../i18n';
import type { Analysis, AnalysisStatus } from '../../types';
import './MessageActions.scss';

interface AiActionsProps {
  role: 'ai';
  isSpeaking?: boolean;
  isTranslationOpen?: boolean;
  onSpeak: () => void;
  onTranslate: () => void;
}

interface UserActionsProps {
  role: 'user';
  isAnalysisOpen?: boolean;
  analysis?: Analysis;
  analysisStatus?: AnalysisStatus;
  onAnalyze: () => void;
}

type MessageActionsProps = AiActionsProps | UserActionsProps;

export function MessageActions(props: MessageActionsProps) {
  const { t } = useI18n();

  if (props.role === 'user') {
    const { analysis, analysisStatus, isAnalysisOpen, onAnalyze } = props;
    const status = analysisStatus === 'pending' ? 'pending' : (analysis?.type ?? 'none');
    const badge =
      analysis?.type === 'correction'
        ? t('badgeError')
        : analysis?.type === 'tip'
          ? t('badgeTip')
          : analysis?.type === 'ok' && !analysis.unchecked
            ? t('badgeOk')
            : null;

    return (
      <div className="message-actions message-actions--user">
        <button
          type="button"
          className={`action-btn action-btn--analysis is-${status}${isAnalysisOpen ? ' is-active' : ''}`}
          onClick={onAnalyze}
          aria-pressed={isAnalysisOpen}
          title={t('hintFeedback')}
        >
          <span className="action-btn__icon" aria-hidden="true">
            💡
          </span>
          <span className="action-btn__label">{t('analyze')}</span>
          {status === 'pending' && <span className="action-btn__spinner" aria-label={t('analyzing')} />}
          {badge && <span className="action-btn__badge">{badge}</span>}
        </button>
      </div>
    );
  }

  const { isSpeaking, isTranslationOpen, onSpeak, onTranslate } = props;
  return (
    <div className="message-actions">
      <button
        type="button"
        className={`action-btn${isSpeaking ? ' is-active' : ''}`}
        onClick={onSpeak}
        aria-pressed={isSpeaking}
        title={isSpeaking ? t('stop') : t('hintListen')}
      >
        <span className="action-btn__icon" aria-hidden="true">
          🔁
        </span>
        <span className="action-btn__label">{isSpeaking ? t('stop') : t('hintListen')}</span>
      </button>
      <button
        type="button"
        className={`action-btn${isTranslationOpen ? ' is-active' : ''}`}
        onClick={onTranslate}
        aria-pressed={isTranslationOpen}
        title={t('hintTranslate')}
      >
        <span className="action-btn__icon" aria-hidden="true">
          🌐
        </span>
        <span className="action-btn__label">{t('hintTranslate')}</span>
      </button>
    </div>
  );
}
