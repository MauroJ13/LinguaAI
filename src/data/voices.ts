import type { Voice, VoiceId } from '../types';

/** Die KI-Lehrkraft – eine einzige, zuverlässige Stimme. */
export const VOICES: Voice[] = [
  {
    id: 'emma',
    name: 'Emma',
    gender: 'female',
    gradient: 'linear-gradient(135deg, #f472b6 0%, #8b5cf6 100%)',
    pitch: 1.05,
    rate: 0.95,
  },
];

export function getVoice(_id?: VoiceId): Voice {
  return VOICES[0];
}
