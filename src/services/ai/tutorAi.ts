/**
 * Die echte KI-Lehrkraft: baut die Prompts (kostenlose KI-Dienste) und wandelt die Antworten
 * in die Datenstrukturen der App um.
 *
 * Pro Nutzernachricht gibt es genau EINEN Aufruf, der gleichzeitig
 *  – die Nachricht analysiert (Fehler / Niveau) und
 *  – die nächste Antwort inkl. Übersetzung liefert.
 * Das schont das kostenlose Kontingent.
 */
import { getLanguage } from '../../data/languages';
import { LEVEL_CONTRAST, LEVEL_GUIDE, isLevel, levelIndex } from '../../data/levels';
import { getVoice } from '../../data/voices';
import type { Analysis, ChatMessage, Level, Reason, ScriptLine, Settings } from '../../types';
import { aiJson, aiText } from './client';

const LANGUAGE_NOTES: Partial<Record<string, string>> = {
  la: 'Write Classical Latin (no macrons). Keep vocabulary suited to the level.',
  he: 'Write Modern Hebrew without niqqud.',
  zh: 'Write simplified Chinese characters only (no pinyin in reply.text).',
  hr: 'Write Serbo-Croatian in Latin script (ijekavian forms are fine).',
  ar: 'Write Modern Standard Arabic.',
  ja: 'Use polite form (です/ます) and kana/kanji appropriate to the level.',
};

function names(settings: Settings) {
  return {
    target: getLanguage(settings.language).englishName,
    native: getLanguage(settings.nativeLanguage).englishName,
    voice: getVoice(settings.voice).name,
  };
}

function systemPrompt(settings: Settings): string {
  const { target, native, voice } = names(settings);
  const note = LANGUAGE_NOTES[settings.language];
  return [
    `You are "${voice}", a friendly, patient and encouraging ${target} teacher inside the language-learning app LinguaAI.`,
    `The learner's native language is ${native}. The learner is learning ${target}.`,
    `The learner's CEFR level is ${settings.level}. Your own chat replies are ALWAYS written in ${target} only and MUST follow these rules for level ${settings.level} exactly:`,
    LEVEL_GUIDE[settings.level],
    LEVEL_CONTRAST,
    'Be natural and warm, react to what the learner said and keep the conversation going.',
    'Never mention the learner\'s mistakes inside the chat reply – corrections are shown separately in the app.',
    `Every explanation, title, hint, note and translation must be written in ${native}.`,
    note ?? '',
    'Always answer with valid JSON only, no markdown.',
  ]
    .filter(Boolean)
    .join('\n');
}

function transcript(history: ChatMessage[]): string {
  const lines = history
    .filter((m) => m.role === 'ai' || m.role === 'user')
    .slice(-14)
    .map((m) => `${m.role === 'ai' ? 'Teacher' : 'Learner'}: ${m.text}`);
  return lines.length ? lines.join('\n') : '(no messages yet)';
}

/* ------------------------------------------------------------------ */
/* Begrüßung                                                            */
/* ------------------------------------------------------------------ */

export async function aiGreeting(settings: Settings, signal?: AbortSignal): Promise<ScriptLine> {
  const { target, native, voice } = names(settings);
  const data = await aiJson<{ text?: string; translation?: string }>({
    signal,
    temperature: 0.9,
    system: systemPrompt(settings),
    prompt: [
      `Start a new conversation. Greet the learner, introduce yourself as ${voice} and ask one question (pick a varied everyday topic). Follow the level ${settings.level} rules from above exactly – an A1 greeting must be tiny and simple, a C2 greeting rich and elegant.`,
      `Answer ONLY with JSON: {"text": "<your message in ${target}>", "translation": "<translation of text into ${native}>"}`,
    ].join('\n'),
  });
  if (!data.text) throw new Error('empty greeting');
  return { text: data.text.trim(), translation: (data.translation ?? '').trim() };
}

/* ------------------------------------------------------------------ */
/* Gesprächsrunde: Analyse + Antwort                                    */
/* ------------------------------------------------------------------ */

interface RawTurn {
  analysis?: {
    isCorrect?: boolean;
    type?: string;
    corrected?: string;
    reasons?: { title?: string; text?: string; hint?: string }[];
    suggestion?: string;
    estimatedLevel?: string;
    expressions?: string[];
    explanation?: string;
    note?: string;
  };
  reply?: { text?: string; translation?: string };
}

export interface TurnResult {
  /** Fehlt, wenn das (kostenlose) Modell keine verwertbare Analyse geliefert hat. */
  analysis?: Analysis;
  reply: ScriptLine;
}

/** Vergleich ohne Groß-/Kleinschreibung, Satzzeichen und Leerzeichen – solche Unterschiede sind keine Fehler. */
function normalize(s: string): string {
  return s
    .normalize('NFC')
    .toLocaleLowerCase()
    .replace(/[\s.!?¿¡,;:'"«»„“”‘’`´…()\[\]\-–—。、，！？؟،]+/g, '')
    .trim();
}

/** Die KI sagt „falsch“, liefert aber keinen veränderten Satz. */
function isInconsistent(raw: NonNullable<RawTurn['analysis']>, original: string): boolean {
  const saysWrong = raw.isCorrect === false || raw.type === 'correction';
  const changed = Boolean(raw.corrected) && normalize(raw.corrected!) !== normalize(original);
  return saysWrong && !changed && raw.isCorrect !== true;
}

/** Nur die Korrektur – kurz und gezielt, von einem anderen Modell. */
async function secondOpinion(settings: Settings, userText: string, signal?: AbortSignal): Promise<Analysis | undefined> {
  const { target, native } = names(settings);
  const raw = await aiJson<NonNullable<RawTurn['analysis']>>({
    signal,
    otherModel: true,
    temperature: 0.1,
    system: `You are a careful ${target} teacher. Answer with JSON only.`,
    prompt: `Check this ${target} sentence written by a learner (level ${settings.level}):
"""${userText}"""
Ignore capitalisation, punctuation and style. If it contains a real grammar, vocabulary or spelling mistake, correct it with minimal changes.
Answer ONLY with JSON: {"isCorrect": true | false, "type": "correction" | "ok", "corrected": "<corrected sentence in ${target}, only if wrong>", "reasons": [{"title": "short rule name in ${native}", "text": "explanation in ${native}", "hint": "short memory aid in ${native}"}]}`,
  });
  if (isInconsistent(raw, userText)) return undefined;
  return toAnalysis(raw, userText, settings.level);
}

function toAnalysis(raw: RawTurn['analysis'], original: string, level: Level): Analysis {
  const type = raw?.type;
  // Schutz vor falschen Korrekturen: Die KI hat den Satz selbst als korrekt eingestuft
  // oder die „Korrektur“ unterscheidet sich nur in Satzzeichen/Großschreibung.
  const reallyWrong =
    type === 'correction' &&
    raw?.isCorrect !== true &&
    Boolean(raw?.corrected) &&
    normalize(raw!.corrected!) !== normalize(original);

  if (reallyWrong && raw?.corrected) {
    const reasons: Reason[] = (raw.reasons ?? [])
      .filter((r) => r && (r.title || r.text))
      .slice(0, 4)
      .map((r) => ({ title: (r.title ?? '').trim(), text: (r.text ?? '').trim(), hint: r.hint?.trim() || undefined }));
    return { type: 'correction', original, corrected: raw.corrected.trim(), reasons };
  }

  if (type === 'tip') {
    const est = raw?.estimatedLevel;
    const estimated: Level = isLevel(est) ? est : level;
    // Nur echte Niveau-Abweichungen zeigen
    if (estimated !== level || raw?.suggestion) {
      return {
        type: 'tip',
        original,
        level,
        estimatedLevel: estimated,
        suggestion: raw?.suggestion?.trim() || null,
        expressions: (raw?.expressions ?? []).filter((e) => typeof e === 'string' && e.trim()).slice(0, 8),
        explanation: raw?.explanation?.trim() || undefined,
      };
    }
  }

  return { type: 'ok', original, level, note: raw?.note?.trim() || undefined };
}

export async function aiTurn(
  settings: Settings,
  history: ChatMessage[],
  userText: string,
  signal?: AbortSignal,
): Promise<TurnResult> {
  const { target, native } = names(settings);
  const lvl = settings.level;
  const allowRicher = levelIndex(lvl) >= levelIndex('C1');

  const prompt = `Conversation so far (oldest first):
${transcript(history)}

The learner just wrote:
"""${userText}"""

Do two things and answer ONLY with JSON of this shape:
{
  "analysis": {
    "isCorrect": true | false,
    "type": "correction" | "tip" | "ok",
    "corrected": "correction only: the learner's message fully corrected in ${target} with minimal changes",
    "reasons": [{"title": "short rule name in ${native}", "text": "clear explanation in ${native} naming the concrete word/rule", "hint": "short memory aid in ${native} or empty"}],
    "suggestion": "tip only: a version in ${target} that fits level ${lvl}",
    "estimatedLevel": "tip only: the CEFR level (A1–C2) the learner's message actually corresponds to",
    "expressions": ["tip only: the words/phrases from the learner's message that do not fit level ${lvl}"],
    "explanation": "tip only: why the suggestion fits level ${lvl} better, in ${native}",
    "note": "ok only: one short encouraging remark in ${native}"
  },
  "reply": {
    "text": "your next chat message in ${target} – follow the level ${lvl} rules exactly (${LEVEL_GUIDE[lvl].split(':')[1]?.split('.')[0]?.trim() ?? ''})",
    "translation": "translation of reply.text into ${native}"
  }
}

How to decide – analyse ONLY the learner's latest message between the triple quotes, never earlier messages:
Step 1 – "isCorrect": Would a careful native-speaking ${target} teacher accept this message as correct ${target}? Answer true or false BEFORE choosing the type. If you are not sure, answer true.
Step 2 – "type":
1. "correction" ONLY if isCorrect is false because of a real mistake: grammar, conjugation, tense, auxiliary verb, agreement (gender, number, case), articles, prepositions, word order, spelling, missing or wrong diacritics that change the word, a wrong or non-existent word, a clearly wrong word choice or false friend – or if the message is not written in ${target} (then "corrected" is how to say it in ${target}). "corrected" must really change at least one word. List every mistake as its own reason (max 4).
2. "tip" if the message is correct but its vocabulary or structures are clearly above level ${lvl}${allowRicher ? ` or clearly too basic for level ${lvl}` : ''}. Give a ${allowRicher ? 'better suited' : 'simpler'} version as "suggestion".
3. "ok" if it is correct and fits level ${lvl}.
Do NOT count as mistakes: capitalisation, punctuation, missing final full stop, spaces, typographic apostrophes/quotes, missing accents on capital letters, informal but correct everyday language, short answers or single words, names, emojis, British vs American spelling, or a different but also correct way of saying something.
Never call a correct sentence a mistake. Only include the fields that belong to the chosen type.`;

  const data = await aiJson<RawTurn>({
    signal,
    temperature: 0.3,
    system: systemPrompt(settings),
    prompt,
  });

  // Kleinere kostenlose Modelle liefern manchmal eine flachere Struktur → tolerant auslesen
  const flat = data as RawTurn & { text?: string; translation?: string };
  const replyText = (data.reply?.text ?? flat.text)?.trim();
  if (!replyText) throw new Error('empty reply');

  // Widerspruch: „falsch“, aber keine echte Korrektur geliefert → zweite Meinung eines anderen Modells,
  // statt den Satz fälschlich als korrekt anzuzeigen.
  let analysis = data.analysis?.type ? toAnalysis(data.analysis, userText, lvl) : undefined;
  if (data.analysis && isInconsistent(data.analysis, userText)) {
    analysis = await secondOpinion(settings, userText, signal).catch(() => undefined);
  }

  return {
    analysis,
    reply: { text: replyText, translation: (data.reply?.translation ?? flat.translation ?? '').trim() },
  };
}

/* ------------------------------------------------------------------ */
/* Übersetzung auf Abruf                                                */
/* ------------------------------------------------------------------ */

export async function aiTranslate(settings: Settings, text: string, signal?: AbortSignal): Promise<string> {
  const { target, native } = names(settings);
  const data = await aiJson<{ translation?: string }>({
    signal,
    temperature: 0.2,
    system: `You are a precise translator from ${target} into ${native}. Answer with JSON only.`,
    prompt: `Translate this ${target} text into natural ${native}.\nText: """${text}"""\nAnswer ONLY with JSON: {"translation": "..."}`,
  });
  if (!data.translation) throw new Error('empty translation');
  return data.translation.trim();
}

/* ------------------------------------------------------------------ */
/* Verbindungstest                                                      */
/* ------------------------------------------------------------------ */

export async function testConnection(signal?: AbortSignal): Promise<string> {
  const { model } = await aiText({
    signal,
    system: 'You are a connection test. Answer with JSON only.',
    prompt: 'Answer ONLY with JSON: {"ok": true}',
    json: true,
  });
  return model;
}
