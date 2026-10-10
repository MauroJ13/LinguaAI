import type { LanguageCode, ScriptLine, Tier } from '../../types';

export interface Topic {
  id: string;
  pattern: RegExp;
  lines: Record<Tier, ScriptLine>;
}

export interface ConversationScript {
  /** Sprache der vorbereiteten Übersetzungen (Demo-Modus). */
  translationLang: LanguageCode;
  greeting: Record<Tier, ScriptLine>;
  topics?: Topic[];
  replies: Record<Tier, ScriptLine[]>;
  /** Beispielsätze zum schnellen Ausprobieren im Chat. */
  suggestions?: string[];
}

export const l = (text: string, translation: string): ScriptLine => ({ text, translation });

export function allTiers<T>(value: T): Record<Tier, T> {
  return { basic: value, intermediate: value, advanced: value };
}
