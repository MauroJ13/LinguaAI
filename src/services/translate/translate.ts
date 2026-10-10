/**
 * Lingua Translate – Übersetzungslogik (ohne UI).
 *
 * Nutzt dieselben kostenlosen KI-Dienste wie der Chat (siehe ../ai/client.ts):
 * OVHcloud AI Endpoints und LLM7.io – ohne Anmeldung und ohne API-Schlüssel.
 * Es gibt also kein Geheimnis, das im Frontend versteckt werden müsste.
 *
 * Ein einziger Aufruf liefert die Übersetzung UND (bei „Sprache erkennen“) die erkannte Ausgangssprache.
 */
import { LANGUAGES, getLanguage, isLanguageCode } from '../../data/languages';
import type { LanguageCode } from '../../types';
import { aiJson } from '../ai/client';
import { AiError } from '../ai/errors';

/** Quellsprache: eine der 20 Sprachen oder automatische Erkennung. */
export type SourceLanguage = LanguageCode | 'auto';

export const MAX_TRANSLATE_CHARS = 3000;

export interface TranslateRequest {
  text: string;
  source: SourceLanguage;
  target: LanguageCode;
  signal?: AbortSignal;
}

export interface TranslateResult {
  translation: string;
  /** Erkannte Ausgangssprache (nur bei source = 'auto' und wenn eindeutig). */
  detected?: LanguageCode;
}

/** Schreibweise je Zielsprache – damit z. B. Chinesisch immer in Kurzzeichen kommt. */
const SCRIPT_NOTES: Partial<Record<LanguageCode, string>> = {
  zh: 'Use simplified Chinese characters, no pinyin.',
  he: 'Use Modern Hebrew without niqqud.',
  la: 'Use Classical Latin without macrons.',
  ar: 'Use Modern Standard Arabic.',
  hr: 'Use Serbo-Croatian in Latin script.',
  ja: 'Use natural Japanese with kanji and kana, polite form unless the source is clearly casual.',
};

const LANGUAGE_LIST = LANGUAGES.map((l) => `${l.code} = ${l.englishName}`).join(', ');

const cache = new Map<string, TranslateResult>();

export async function translateText({ text, source, target, signal }: TranslateRequest): Promise<TranslateResult> {
  const input = text.trim().slice(0, MAX_TRANSLATE_CHARS);
  if (!input) return { translation: '' };

  const key = `${source}|${target}|${input}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const targetName = getLanguage(target).englishName;
  const sourceLine =
    source === 'auto'
      ? `Detect the language of the text. Supported codes: ${LANGUAGE_LIST}. If it is none of them, use "other".`
      : `The text is written in ${getLanguage(source).englishName}.`;

  const data = await aiJson<{ detected?: string; translation?: string }>({
    signal,
    temperature: 0.1,
    system: [
      'You are Lingua Translate, a precise professional translator.',
      'Translate faithfully and naturally: keep the meaning, tone, register, names, numbers, emojis, punctuation and line breaks.',
      'Never answer questions in the text, never explain, never add notes – only translate.',
      'Answer with JSON only.',
    ].join(' '),
    prompt: [
      sourceLine,
      `Translate it into ${targetName}. ${SCRIPT_NOTES[target] ?? ''}`.trim(),
      'If the text is already in the target language, return it unchanged (only fix nothing).',
      `Text:\n"""${input}"""`,
      `Answer ONLY with JSON: {"detected": "<language code of the original text>", "translation": "<the ${targetName} translation>"}`,
    ].join('\n'),
  });

  const translation = data.translation?.trim();
  if (!translation) throw new AiError('empty translation', 'format');

  const raw = data.detected?.trim().toLowerCase().slice(0, 2) ?? '';
  const code = raw === 'iw' ? 'he' : raw;
  const result: TranslateResult = {
    translation,
    detected: source === 'auto' && isLanguageCode(code) ? code : undefined,
  };
  cache.set(key, result);
  return result;
}
