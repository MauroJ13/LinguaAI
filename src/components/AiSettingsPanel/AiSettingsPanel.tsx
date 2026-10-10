import { useState } from 'react';
import { useAiSettings } from '../../context/AiSettingsContext';
import { useI18n } from '../../i18n';
import { testConnection } from '../../services/ai/tutorAi';
import { ELEVENLABS_KEY } from '../../services/speech/elevenLabsTts';
import { CheckIcon } from '../Icons/Icons';
import './AiSettingsPanel.scss';

type TestState = { status: 'idle' } | { status: 'testing' } | { status: 'ok'; model: string } | { status: 'error'; error: string };

/**
 * KI- und Stimmen-Einstellungen. Alles funktioniert ohne Einrichtung:
 * KI über kostenlose Dienste (OVHcloud AI Endpoints, LLM7.io), Stimme über ElevenLabs
 * (falls vom Entwickler in `.env` hinterlegt) oder die kostenlose Browser-Stimme.
 */
export function AiSettingsPanel() {
  const { t } = useI18n();
  const { ai, updateAi } = useAiSettings();
  const [test, setTest] = useState<TestState>({ status: 'idle' });

  const runTest = async () => {
    setTest({ status: 'testing' });
    try {
      const model = await testConnection();
      setTest({ status: 'ok', model });
    } catch (err) {
      setTest({ status: 'error', error: err instanceof Error ? err.message : String(err) });
    }
  };

  const hasEleven = Boolean(ELEVENLABS_KEY);

  return (
    <div className="ai-panel">
      <div className="ai-panel__connected">
        <span className="ai-panel__connected-icon" aria-hidden="true">
          <CheckIcon size={18} strokeWidth={3} />
        </span>
        <div>
          <h3>{t('aiConnectedTitle')}</h3>
          <p>{t('aiConnectedText')}</p>
          <p className="ai-panel__credits">
            {t('credits', { provider: 'OVHcloud AI Endpoints & LLM7.io' })}
            {' · '}
            <a href="https://endpoints.ai.cloud.ovh.net" target="_blank" rel="noreferrer">
              OVHcloud
            </a>
            {' · '}
            <a href="https://llm7.io" target="_blank" rel="noreferrer">
              llm7.io
            </a>
          </p>
        </div>
      </div>

      <div className="ai-panel__actions">
        <button type="button" className="btn btn--ghost" disabled={test.status === 'testing'} onClick={runTest}>
          {test.status === 'testing' ? t('aiTesting') : t('aiTest')}
        </button>
        <p className={`ai-panel__status ai-panel__status--${test.status}`} role="status">
          {test.status === 'ok' && t('aiOk', { model: test.model })}
          {test.status === 'error' && t('aiFail', { error: test.error })}
        </p>
      </div>

      <div className="ai-panel__group">
        <span className="ai-panel__label">{t('ttsTitle')}</span>
        <div className="ai-option is-selected" role="status">
          <span className="ai-option__check" aria-hidden="true">
            <CheckIcon size={12} strokeWidth={3} />
          </span>
          <span>
            <strong>{hasEleven ? t('ttsEleven') : t('ttsBrowser')}</strong>
            <small>
              {hasEleven ? t('ttsElevenSub') : t('ttsBrowserSub')}
              {hasEleven && (
                <>
                  {' · '}
                  <a href="https://elevenlabs.io" target="_blank" rel="noreferrer">
                    elevenlabs.io
                  </a>
                </>
              )}
            </small>
          </span>
        </div>
      </div>

      <label className="ai-toggle">
        <input type="checkbox" checked={ai.autoSpeak} onChange={(e) => updateAi({ autoSpeak: e.target.checked })} />
        <span className="ai-toggle__switch" aria-hidden="true" />
        <span>
          <strong>{t('autoSpeak')}</strong>
          <small>{t('autoSpeakSub')}</small>
        </span>
      </label>

      <label className="ai-toggle">
        <input
          type="checkbox"
          checked={ai.autoFeedback}
          onChange={(e) => updateAi({ autoFeedback: e.target.checked })}
        />
        <span className="ai-toggle__switch" aria-hidden="true" />
        <span>
          <strong>{t('autoFeedback')}</strong>
          <small>{t('autoFeedbackSub')}</small>
        </span>
      </label>
    </div>
  );
}
