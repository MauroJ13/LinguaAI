import type { LanguageCode } from '../../types';
import type { ConversationScript } from './types';
import { de } from './de';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { it } from './it';
import { pt } from './pt';
import { ar, el, he, hi, hr, ja, ko, la, nl, pl, ru, sv, tr, zh } from './others';

export const CONVERSATION_SCRIPTS: Record<LanguageCode, ConversationScript> = {
  de, en, fr, es, it, pt, ru, hr, pl, nl, tr, sv, ja, ko, zh, el, ar, hi, la, he,
};

export function getScript(code: LanguageCode): ConversationScript {
  return CONVERSATION_SCRIPTS[code];
}

export type { ConversationScript, Topic } from './types';
