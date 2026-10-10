import { memo } from 'react';
import { useI18n } from '../../i18n';
import type { ChatMessage as ChatMessageType, Voice } from '../../types';
import { formatTime } from '../../utils/format';
import { MessageActions } from '../MessageActions/MessageActions';
import { VoiceAvatar } from '../VoiceAvatar/VoiceAvatar';
import './ChatMessage.scss';

export type ActivePanel = 'translation' | 'analysis' | null;

interface ChatMessageProps {
  message: ChatMessageType;
  voice: Voice;
  /** Schreibrichtung der Lernsprache (Arabisch/Hebräisch = rtl). */
  targetRtl?: boolean;
  isSpeaking: boolean;
  activePanel: ActivePanel;
  onSpeak: (message: ChatMessageType) => void;
  onTranslate: (message: ChatMessageType) => void;
  onAnalyze: (message: ChatMessageType) => void;
}

function ChatMessageComponent({
  message,
  voice,
  targetRtl,
  isSpeaking,
  activePanel,
  onSpeak,
  onTranslate,
  onAnalyze,
}: ChatMessageProps) {
  const { t } = useI18n();

  if (message.role === 'system') {
    return (
      <div className="chat-notice" role="status">
        <span>{message.text}</span>
      </div>
    );
  }

  const isAi = message.role === 'ai';
  const classes = ['message', `message--${message.role}`];
  if (activePanel) classes.push('is-active');

  return (
    <article className={classes.join(' ')} aria-label={isAi ? voice.name : t('you')}>
      {isAi ? (
        <VoiceAvatar voice={voice} size={38} speaking={isSpeaking} />
      ) : (
        <span className="message__avatar-user" aria-hidden="true">
          {t('you').slice(0, 3)}
        </span>
      )}

      <div className="message__body">
        <div className="message__meta">
          <span className="message__author">
            {isAi ? (
              <>
                {voice.name} <span className="message__badge">{t('aiBadge')}</span>
              </>
            ) : (
              t('you')
            )}
          </span>
          <time dateTime={new Date(message.createdAt).toISOString()}>{formatTime(message.createdAt)}</time>
        </div>

        <div className="message__bubble" dir={targetRtl ? 'rtl' : 'auto'}>
          {message.text}
        </div>

        {isAi ? (
          <MessageActions
            role="ai"
            isSpeaking={isSpeaking}
            isTranslationOpen={activePanel === 'translation'}
            onSpeak={() => onSpeak(message)}
            onTranslate={() => onTranslate(message)}
          />
        ) : (
          <MessageActions
            role="user"
            analysis={message.analysis}
            analysisStatus={message.analysisStatus}
            isAnalysisOpen={activePanel === 'analysis'}
            onAnalyze={() => onAnalyze(message)}
          />
        )}

        {isAi && isSpeaking && (
          <button type="button" className="message__speaking" onClick={() => onSpeak(message)} aria-live="polite">
            <span className="message__wave" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
            🔊 {t('speaking')} <span className="message__speaking-voice">{t('voiceLabel', { name: voice.name })}</span>
          </button>
        )}
      </div>
    </article>
  );
}

export const ChatMessage = memo(ChatMessageComponent);
