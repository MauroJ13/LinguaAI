/**
 * Lokale Speicherung im Browser (localStorage):
 *  – zuletzt gewählte Einstellungen → beim nächsten Öffnen direkt zum Chat
 *  – mehrere Gespräche pro Sprachpaar (Muttersprache → Lernsprache) → fortsetzen oder neu beginnen
 */
import { isLanguageCode } from '../data/languages';
import { isLevel } from '../data/levels';
import type { ChatMessage, ConversationMeta, LanguageCode, Settings, Theme } from '../types';

const SETTINGS_KEY = 'linguaai.settings';
const THEME_KEY = 'linguaai.theme';
const CHAT_PREFIX = 'linguaai.chat.';
const INDEX_PREFIX = 'linguaai.chats.';
const MAX_MESSAGES = 200;
/** Ältere Gespräche werden ab dieser Anzahl automatisch entfernt. */
const MAX_CONVERSATIONS = 30;

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Speicher voll oder gesperrt – dann eben nur für diese Sitzung */
  }
}

/* ---------------- Einstellungen ---------------- */

export function loadSettings(): Settings | null {
  const s = read<Partial<Settings>>(SETTINGS_KEY);
  if (!s || !isLanguageCode(String(s.language)) || !isLanguageCode(String(s.nativeLanguage)) || !isLevel(s.level)) {
    return null;
  }
  return {
    nativeLanguage: s.nativeLanguage as LanguageCode,
    language: s.language as LanguageCode,
    level: s.level,
    voice: 'emma',
  };
}

export function saveSettings(settings: Settings) {
  write(SETTINGS_KEY, settings);
}

/** Zurück zum Startbildschirm (Einstellungen vergessen, Gespräche bleiben gespeichert). */
export function clearSettings() {
  try {
    window.localStorage.removeItem(SETTINGS_KEY);
  } catch {
    /* ignorieren */
  }
}

/* ---------------- Design ---------------- */

export function loadTheme(): Theme | null {
  const t = read<string>(THEME_KEY);
  return t === 'dark' || t === 'light' ? t : null;
}

export function saveTheme(theme: Theme) {
  write(THEME_KEY, theme);
}

/* ---------------- Gespräche ---------------- */

type Pair = { native: LanguageCode; target: LanguageCode };

const indexKey = ({ native, target }: Pair) => `${INDEX_PREFIX}${native}.${target}`;
const chatKey = ({ native, target }: Pair, id: string) => `${CHAT_PREFIX}${native}.${target}.${id}`;
/** Frühere Version: ein einziges Gespräch pro Sprachpaar. */
const legacyKey = ({ native, target }: Pair) => `${CHAT_PREFIX}${native}.${target}`;

function remove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignorieren */
  }
}

function sanitize(list: unknown): ChatMessage[] {
  if (!Array.isArray(list)) return [];
  return (list as ChatMessage[])
    .filter((m) => m && typeof m.id === 'string' && typeof m.text === 'string')
    .map((m) => ({
      ...m,
      // Unterbrochene Anfragen (z. B. Seite neu geladen) nicht ewig „laden“ lassen
      analysisStatus: m.analysisStatus === 'pending' ? 'error' : m.analysisStatus,
      translationStatus: m.translationStatus === 'pending' ? undefined : m.translationStatus,
    }));
}

function writeIndex(pair: Pair, list: ConversationMeta[]) {
  const sorted = [...list].sort((a, b) => b.updatedAt - a.updatedAt);
  sorted.slice(MAX_CONVERSATIONS).forEach((c) => remove(chatKey(pair, c.id)));
  write(indexKey(pair), sorted.slice(0, MAX_CONVERSATIONS));
}

function metaFor(id: string, messages: ChatMessage[], createdAt: number): ConversationMeta {
  const real = messages.filter((m) => m.role !== 'system');
  const lastUser = [...real].reverse().find((m) => m.role === 'user');
  const last = real[real.length - 1];
  return {
    id,
    createdAt,
    updatedAt: last?.createdAt ?? Date.now(),
    preview: (lastUser ?? last)?.text.slice(0, 90) ?? '',
    count: real.length,
    userCount: real.filter((m) => m.role === 'user').length,
  };
}

/** Altes Einzel-Gespräch einmalig in die neue Gesprächsliste übernehmen. */
function migrateLegacy(pair: Pair): ConversationMeta[] | null {
  const old = sanitize(read<ChatMessage[]>(legacyKey(pair)));
  remove(legacyKey(pair));
  if (!old.length) return null;
  const id = `c${old[0].createdAt}`;
  write(chatKey(pair, id), old);
  const meta = metaFor(id, old, old[0].createdAt);
  writeIndex(pair, [meta]);
  return [meta];
}

/** Alle gespeicherten Gespräche eines Sprachpaars, neuestes zuerst. */
export function listConversations(native: LanguageCode, target: LanguageCode): ConversationMeta[] {
  const pair = { native, target };
  const list = read<ConversationMeta[]>(indexKey(pair));
  if (!Array.isArray(list)) return migrateLegacy(pair) ?? [];
  return list
    .filter((c) => c && typeof c.id === 'string' && c.count > 0)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function loadConversation(native: LanguageCode, target: LanguageCode, id: string): ChatMessage[] {
  return sanitize(read<ChatMessage[]>(chatKey({ native, target }, id)));
}

export function saveConversation(native: LanguageCode, target: LanguageCode, id: string, messages: ChatMessage[]) {
  const pair = { native, target };
  // Erst speichern, wenn wirklich gesprochen wurde (nicht nur die Begrüßung)
  if (!messages.some((m) => m.role === 'user')) return;
  const trimmed = messages.slice(-MAX_MESSAGES);
  write(chatKey(pair, id), trimmed);
  const list = listConversations(native, target);
  const existing = list.find((c) => c.id === id);
  const meta = metaFor(id, trimmed, existing?.createdAt ?? trimmed[0]?.createdAt ?? Date.now());
  writeIndex(pair, [meta, ...list.filter((c) => c.id !== id)]);
}

export function deleteConversation(native: LanguageCode, target: LanguageCode, id: string) {
  const pair = { native, target };
  remove(chatKey(pair, id));
  writeIndex(pair, listConversations(native, target).filter((c) => c.id !== id));
}
