/**
 * Demo-Modus: simulierter KI-Sprachlehrer.
 * Wird als Rückfall verwendet, wenn die kostenlose KI gerade nicht erreichbar ist.
 */
import { getScript } from '../data/conversations';
import { getTier } from '../data/levels';
import { getVoice } from '../data/voices';
import type { ScriptLine, Settings } from '../types';

export interface ConversationContext {
  usedTopics: Set<string>;
  turn: number;
}

export function createContext(): ConversationContext {
  return { usedTopics: new Set(), turn: 0 };
}

export interface DemoLine {
  text: string;
  /** Nur gesetzt, wenn die vorbereitete Übersetzung in der Muttersprache vorliegt. */
  translation?: string;
}

function fill(line: ScriptLine, settings: Settings): DemoLine {
  const name = getVoice(settings.voice).name;
  const script = getScript(settings.language);
  return {
    text: line.text.split('{voice}').join(name),
    translation:
      script.translationLang === settings.nativeLanguage ? line.translation.split('{voice}').join(name) : undefined,
  };
}

export function createGreeting(settings: Settings): DemoLine {
  const script = getScript(settings.language);
  return fill(script.greeting[getTier(settings.level)], settings);
}

/** Liefert eine niveauabhängige, simulierte Antwort und aktualisiert den Gesprächskontext. */
export function createReply(userText: string, settings: Settings, ctx: ConversationContext): DemoLine {
  const script = getScript(settings.language);
  const tier = getTier(settings.level);

  const topic = script.topics?.find((t) => !ctx.usedTopics.has(t.id) && t.pattern.test(userText));
  if (topic) {
    ctx.usedTopics.add(topic.id);
    return fill(topic.lines[tier], settings);
  }

  const pool = script.replies[tier];
  const line = pool[ctx.turn % pool.length];
  ctx.turn += 1;
  return fill(line, settings);
}

/** Realistische „Denkzeit“ abhängig von der Länge der Nutzernachricht. */
export function getThinkingDelay(userText: string): number {
  return Math.min(2200, Math.max(900, 650 + userText.length * 14));
}
