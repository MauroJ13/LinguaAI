import type { Level, Tier } from '../types';

export const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function levelIndex(level: Level): number {
  return LEVELS.indexOf(level);
}

export function isLevel(value: unknown): value is Level {
  return typeof value === 'string' && (LEVELS as string[]).includes(value);
}

export function getTier(level: Level): Tier {
  if (level === 'A1' || level === 'A2') return 'basic';
  if (level === 'B1' || level === 'B2') return 'intermediate';
  return 'advanced';
}

/** Sprechtempo der Browser-Stimme je Niveau (langsamer für Einsteiger). */
export function levelSpeechRate(level: Level): number {
  return { A1: 0.78, A2: 0.86, B1: 0.94, B2: 1, C1: 1.04, C2: 1.08 }[level];
}

/** Genaue Regeln je Niveau für den KI-Prompt – damit sich A1 und C2 wirklich unterscheiden. */
export const LEVEL_GUIDE: Record<Level, string> = {
  A1: 'A1 (absolute beginner): 1–2 very short sentences, MAX 12 words in total. Present tense only. Only the most basic everyday words (greetings, family, food, colours, numbers, hobbies). No idioms, no subordinate clauses. End with ONE very simple question (yes/no or either/or).',
  A2: 'A2 (elementary): 2 short sentences, MAX 20 words in total. Present tense, simple past and near future only. Common everyday vocabulary. No idioms. End with one simple question.',
  B1: 'B1 (intermediate): 2–3 sentences, MAX 35 words in total. Everyday vocabulary plus some topic words, all common tenses, simple subordinate clauses (because, when, if). End with one open question.',
  B2: 'B2 (upper intermediate): 3 sentences, MAX 50 words in total. Natural, fluent language with varied tenses, some common idioms, opinions with reasons. End with an open question that asks for an opinion.',
  C1: 'C1 (advanced): 3–4 sentences, MAX 70 words in total. Sophisticated, precise and idiomatic vocabulary, complex structures (subjunctive/conditional, passive, relative clauses, connectors), nuanced opinions. End with a thought-provoking question.',
  C2: 'C2 (proficient): 3–5 sentences, MAX 80 words in total. Near-native, elegant and idiomatic style with rare vocabulary, figurative language and subtle humour. End with a demanding, abstract question.',
};

/** Veranschaulicht den Unterschied zwischen den Niveaus (für den KI-Prompt, auf Englisch). */
export const LEVEL_CONTRAST =
  'Illustration of how different the levels must sound (English only as an example): ' +
  'A1: "Nice! Do you like films?" · B1: "That sounds fun! What kind of films do you usually watch, and why?" · ' +
  'C1: "How intriguing – what drew you to that particular film, and did it live up to the expectations the trailer had raised?"';
