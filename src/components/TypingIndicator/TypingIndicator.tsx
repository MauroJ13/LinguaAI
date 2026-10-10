import { useI18n } from '../../i18n';
import type { Voice } from '../../types';
import { VoiceAvatar } from '../VoiceAvatar/VoiceAvatar';
import './TypingIndicator.scss';

export function TypingIndicator({ voice }: { voice: Voice }) {
  const { t } = useI18n();
  return (
    <div className="typing" role="status" aria-live="polite">
      <VoiceAvatar voice={voice} size={38} />
      <div className="typing__bubble">
        <span className="typing__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="typing__label">{t('typing', { name: voice.name })}</span>
      </div>
    </div>
  );
}
