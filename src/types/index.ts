export type LanguageCode =
  | 'de' | 'en' | 'fr' | 'es' | 'it' | 'pt' | 'ru' | 'hr' | 'pl' | 'nl'
  | 'tr' | 'sv' | 'ja' | 'ko' | 'zh' | 'el' | 'ar' | 'hi' | 'la' | 'he';

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/** Grobe Einteilung der Niveaus für die simulierten Antworten (Demo-Modus). */
export type Tier = 'basic' | 'intermediate' | 'advanced';

/** Es gibt nur noch eine Stimme: Emma. */
export type VoiceId = 'emma';

export type Theme = 'dark' | 'light';

export interface Language {
  code: LanguageCode;
  /** Englischer Name – wird für die KI-Prompts verwendet. */
  englishName: string;
  nativeName: string;
  flag: string;
  /** BCP-47-Codes für Sprachausgabe/-erkennung, in Reihenfolge der Präferenz. */
  speech: string[];
  rtl?: boolean;
}

export interface Voice {
  id: VoiceId;
  name: string;
  gender: 'female' | 'male';
  gradient: string;
  /** Tonhöhe & Tempo für die Browser-Stimme. */
  pitch: number;
  rate: number;
}

/** Lern-Einstellungen, die der Nutzer im Onboarding wählt. */
export interface Settings {
  nativeLanguage: LanguageCode;
  language: LanguageCode;
  level: Level;
  voice: VoiceId;
}

/** KI- und Sprachausgabe-Einstellungen (lokal im Browser gespeichert). */
export interface AiSettings {
  /** Neue KI-Nachrichten automatisch einmal vorlesen. */
  autoSpeak: boolean;
  /** Korrekturen automatisch in der Sidebar öffnen. */
  autoFeedback: boolean;
}

/** Eintrag in der Gesprächsliste (gespeichert pro Sprachpaar). */
export interface ConversationMeta {
  id: string;
  createdAt: number;
  updatedAt: number;
  /** Letzte eigene Nachricht (oder letzte Nachricht) als Vorschau. */
  preview: string;
  count: number;
  userCount: number;
}

export type MessageRole = 'ai' | 'user' | 'system';

export type AnalysisStatus = 'pending' | 'done' | 'error';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  createdAt: number;
  /** KI-Nachrichten: Übersetzung in die Muttersprache. */
  translation?: string;
  translationStatus?: 'pending' | 'done' | 'error';
  /** Nutzer-Nachrichten: Analyse (💡). */
  analysis?: Analysis;
  analysisStatus?: AnalysisStatus;
  /** Woher die Nachricht stammt (echte KI oder Demo-Simulation). */
  source?: 'ai' | 'demo';
}

export interface ScriptLine {
  text: string;
  translation: string;
}

/* ---------- Analyse (💡) ---------- */

export interface Reason {
  title: string;
  text: string;
  hint?: string;
}

export interface CorrectionAnalysis {
  type: 'correction';
  original: string;
  corrected: string;
  reasons: Reason[];
}

export interface TipAnalysis {
  type: 'tip';
  original: string;
  suggestion: string | null;
  level: Level;
  estimatedLevel: Level;
  expressions: string[];
  explanation?: string;
}

export interface OkAnalysis {
  type: 'ok';
  original: string;
  level: Level;
  note?: string;
  /** Demo-Modus ohne Regeln für diese Sprache: Satz wurde nicht wirklich geprüft. */
  unchecked?: boolean;
}

export type Analysis = CorrectionAnalysis | TipAnalysis | OkAnalysis;

/* ---------- Sidebar ---------- */

export type SidebarContent =
  | { type: 'empty' }
  | { type: 'translation'; messageId: string }
  | { type: 'analysis'; messageId: string };
