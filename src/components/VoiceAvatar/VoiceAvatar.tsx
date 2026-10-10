import type { Voice } from '../../types';
import './VoiceAvatar.scss';

interface VoiceAvatarProps {
  voice: Voice;
  size?: number;
  speaking?: boolean;
}

export function VoiceAvatar({ voice, size = 36, speaking = false }: VoiceAvatarProps) {
  return (
    <span
      className={`voice-avatar${speaking ? ' is-speaking' : ''}`}
      style={{ width: size, height: size, background: voice.gradient, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {voice.name.charAt(0)}
    </span>
  );
}
