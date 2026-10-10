/**
 * Sprachausgabe über die kostenlose Web Speech API des Browsers (speechSynthesis).
 * Funktioniert ohne Schlüssel und offline mit den auf dem Gerät installierten Stimmen.
 */

export interface Playback {
  promise: Promise<void>;
  cancel: () => void;
}

export interface BrowserSpeakOptions {
  /** BCP-47-Codes in Reihenfolge der Präferenz, z. B. ['fr-FR', 'fr']. */
  langTags: string[];
  gender: 'female' | 'male';
  pitch: number;
  rate: number;
}

export function isBrowserTtsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/* ---------- Stimmen laden ---------- */

let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isBrowserTtsSupported()) return Promise.resolve([]);
  const existing = window.speechSynthesis.getVoices();
  if (existing.length) return Promise.resolve(existing);
  if (!voicesPromise) {
    voicesPromise = new Promise((resolve) => {
      const done = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length) resolve(voices);
      };
      window.speechSynthesis.addEventListener('voiceschanged', done);
      window.setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1500);
    });
  }
  return voicesPromise.then((v) => (v.length ? v : window.speechSynthesis.getVoices()));
}

/* ---------- Passende Stimme wählen ---------- */

const FEMALE = [
  'female', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'veena', 'serena', 'allison', 'ava', 'susan',
  'zoe', 'kate', 'anna', 'petra', 'helena', 'marlene', 'vicki', 'amelie', 'amélie', 'audrey', 'aurelie', 'marie',
  'paulina', 'monica', 'mónica', 'marisol', 'soledad', 'alice', 'federica', 'paola', 'joana', 'luciana', 'catarina',
  'fernanda', 'milena', 'katya', 'zosia', 'ewa', 'ellen', 'claire', 'alva', 'klara', 'sara', 'nora', 'kyoko', 'o-ren',
  'yuna', 'ting-ting', 'tingting', 'mei-jia', 'meijia', 'sin-ji', 'sinji', 'melina', 'lekha', 'carmit', 'yelda', 'laura',
  'ioana', 'lana', 'mariska', 'zira', 'hedda', 'katja', 'hazel', 'heera', 'eva', 'elsa', 'hortense', 'julie', 'irina',
  'sabina', 'elena', 'nanami', 'sunhi', 'xiaoxiao', 'hila', 'lucia', 'isabela', 'francisca', 'agnieszka', 'filiz',
  'google deutsch', 'google français', 'google italiano', 'google русский', 'google 日本語', 'google 한국의',
  'google us english', 'google nederlands', 'google polski', 'google 普通话',
];

const MALE = [
  'male', 'daniel', 'alex', 'thomas', 'jorge', 'juan', 'diego', 'carlos', 'luca', 'yuri', 'aaron', 'arthur', 'gordon',
  'martin', 'nicolas', 'rishi', 'maged', 'majed', 'xander', 'otoya', 'hattori', 'oliver', 'lee', 'tom', 'david', 'mark',
  'stefan', 'pablo', 'paul', 'markus', 'yannick', 'felix', 'jacques', 'henri', 'conrad', 'ivan', 'pavel', 'andrej',
  'keita', 'injoon', 'yunxi', 'kangkang', 'asaf', 'hamed', 'hemant', 'cosimo', 'duarte', 'filip', 'mattias',
  'google español',
];

/** Spaß-/Effektstimmen von macOS, die sich nicht zum Lernen eignen. */
const NOVELTY = [
  'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'good news', 'jester', 'organ', 'superstar',
  'trinoids', 'whisper', 'wobble', 'zarvox', 'deranged', 'hysterical', 'junior', 'ralph', 'kathy', 'princess', 'fred',
  'eddy', 'flo', 'grandma', 'grandpa', 'reed', 'rocko', 'sandy', 'shelley',
];

function nameIncludes(voice: SpeechSynthesisVoice, list: string[]): boolean {
  const name = voice.name.toLowerCase();
  return list.some((n) => name === n || name.includes(n));
}

function guessGender(voice: SpeechSynthesisVoice): 'female' | 'male' | undefined {
  const name = voice.name.toLowerCase();
  if (/\bfemale\b/.test(name)) return 'female';
  if (/\bmale\b/.test(name)) return 'male';
  if (nameIncludes(voice, MALE)) return 'male';
  if (nameIncludes(voice, FEMALE)) return 'female';
  return undefined;
}

function matchesTag(voice: SpeechSynthesisVoice, tag: string): boolean {
  const vLang = voice.lang.toLowerCase().replace('_', '-');
  const t = tag.toLowerCase();
  if (t.includes('-')) return vLang === t;
  return vLang === t || vLang.split('-')[0] === t;
}

function score(voice: SpeechSynthesisVoice, gender: 'female' | 'male'): number {
  let s = 0;
  const g = guessGender(voice);
  if (g === gender) s += 4;
  else if (g && g !== gender) s -= 2;
  const name = voice.name.toLowerCase();
  if (/(premium|enhanced|natural|neural|online|siri)/.test(name)) s += 3;
  if (name.includes('google')) s += 1;
  if (nameIncludes(voice, NOVELTY)) s -= 8;
  return s;
}

export interface VoiceChoice {
  voice?: SpeechSynthesisVoice;
  lang: string;
  /** false, wenn nur eine Ersatzstimme (andere Sprache) gefunden wurde. */
  exact: boolean;
}

export async function pickVoice(langTags: string[], gender: 'female' | 'male'): Promise<VoiceChoice> {
  const voices = await loadVoices();
  // Serbisch/Bosnisch gelten als Serbokroatisch, „iw“ ist der alte Code für Hebräisch
  const ALIASES: Record<string, string> = { sr: 'hr', bs: 'hr', iw: 'he' };
  const base = (tag: string) => {
    const b = tag.split('-')[0].toLowerCase();
    return ALIASES[b] ?? b;
  };
  const primaryBase = base(langTags[0]);

  // Zuerst alle Stimmen der eigentlichen Sprache (z. B. en-GB, en-US) gemeinsam bewerten,
  // damit die gewünschte weibliche/männliche Stimme gefunden wird – danach Ersatzsprachen.
  const groups = [
    langTags.filter((tag) => base(tag) === primaryBase),
    ...langTags.filter((tag) => base(tag) !== primaryBase).map((tag) => [tag]),
  ];

  for (const tags of groups) {
    let best: { voice: SpeechSynthesisVoice; value: number } | null = null;
    for (const voice of voices) {
      const index = tags.findIndex((tag) => matchesTag(voice, tag));
      if (index < 0) continue;
      const value = score(voice, gender) + (index === 0 ? 1.5 : 0);
      if (!best || value > best.value) best = { voice, value };
    }
    if (best) {
      return { voice: best.voice, lang: best.voice.lang, exact: base(tags[0]) === primaryBase };
    }
  }
  // Keine passende Stimme: Browser entscheidet anhand von lang
  return { voice: undefined, lang: langTags[0], exact: false };
}

/* ---------- Sprechen ---------- */

/** Chrome bricht lange Äußerungen ab → Text in Sätze teilen. */
function splitIntoChunks(text: string): string[] {
  const parts = text.match(/[^.!?。！？؟;]+[.!?。！？؟;]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let current = '';
  for (const part of parts) {
    if ((current + part).length > 180 && current) {
      chunks.push(current.trim());
      current = part;
    } else {
      current += part;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [text];
}

export async function speakBrowser(text: string, options: BrowserSpeakOptions): Promise<Playback & { choice: VoiceChoice }> {
  const synth = window.speechSynthesis;
  const choice = await pickVoice(options.langTags, options.gender);
  synth.cancel();

  let cancelled = false;
  const chunks = splitIntoChunks(text);

  const promise = new Promise<void>((resolve, reject) => {
    let index = 0;
    let watchdog: number | undefined;

    const speakChunk = (chunk: string, useChosenVoice: boolean) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      if (useChosenVoice && choice.voice) utterance.voice = choice.voice;
      utterance.lang = useChosenVoice ? choice.lang : options.langTags[0];
      utterance.pitch = Math.min(2, Math.max(0, options.pitch));
      utterance.rate = Math.min(2, Math.max(0.5, options.rate));

      let started = false;
      utterance.onstart = () => {
        started = true;
        window.clearTimeout(watchdog);
      };
      utterance.onend = () => {
        window.clearTimeout(watchdog);
        next();
      };
      utterance.onerror = (event) => {
        window.clearTimeout(watchdog);
        if (cancelled || event.error === 'interrupted' || event.error === 'canceled') resolve();
        else if (useChosenVoice) speakChunk(chunk, false); // mit Standardstimme erneut versuchen
        else reject(new Error(event.error || 'speech error'));
      };

      // Manche (v. a. männliche) Systemstimmen bleiben stumm → nach kurzer Zeit Standardstimme nehmen
      if (useChosenVoice && choice.voice) {
        watchdog = window.setTimeout(() => {
          if (started || cancelled) return;
          utterance.onend = null;
          utterance.onerror = null;
          synth.cancel();
          window.setTimeout(() => speakChunk(chunk, false), 60);
        }, 2500);
      }
      synth.speak(utterance);
    };

    const next = () => {
      if (cancelled || index >= chunks.length) {
        resolve();
        return;
      }
      speakChunk(chunks[index++], true);
    };
    // Kleine Pause nach cancel(), sonst verschluckt Chrome den Anfang
    window.setTimeout(next, 60);
  });

  return {
    choice,
    promise,
    cancel: () => {
      cancelled = true;
      synth.cancel();
    },
  };
}
