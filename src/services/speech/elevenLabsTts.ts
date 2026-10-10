/**
 * Natürliche Sprachausgabe über ElevenLabs (https://elevenlabs.io).
 *
 * ElevenLabs braucht einen Schlüssel. Er wird EINMAL vom Entwickler in der Datei `.env`
 * eingetragen (VITE_ELEVENLABS_API_KEY) – die Nutzer der App sehen davon nichts.
 * Ohne Schlüssel, bei verbrauchtem Gratis-Kontingent oder für Sprachen, die ElevenLabs
 * nicht kann (Latein, Hebräisch), liest automatisch die kostenlose Browser-Stimme vor.
 */
import { AiError } from '../ai/errors';
import type { LanguageCode, VoiceId } from '../../types';
import type { Playback } from './browserTts';

export const ELEVENLABS_KEY: string = (import.meta.env?.VITE_ELEVENLABS_API_KEY ?? '').trim();

/** Schnelles, günstiges Mehrsprachen-Modell (32 Sprachen). */
const MODEL = 'eleven_flash_v2_5';

/** Fertige ElevenLabs-Stimmen (im Gratis-Plan enthalten). */
const VOICE_IDS: Record<VoiceId, string> = {
  emma: 'EXAVITQu4vr4xnSDxMaL', // Sarah – ruhig, vertrauensvoll
};

/** Lernsprachen, die das Modell nicht spricht → Browser-Stimme. */
const UNSUPPORTED: LanguageCode[] = ['la', 'he'];

/** Nach Kontingent-/Schlüsselfehler für den Rest der Sitzung nicht mehr versuchen. */
let disabledReason: string | null = null;

export function canUseElevenLabs(language: LanguageCode): boolean {
  return Boolean(ELEVENLABS_KEY) && !disabledReason && !UNSUPPORTED.includes(language);
}

const cache = new Map<string, string>(); // Text → Blob-URL (spart Kontingent bei Wiederholung)

export interface ElevenSpeakOptions {
  voice: VoiceId;
  language: LanguageCode;
  /** 0.7 – 1.2 (langsamer für Einsteiger). */
  speed: number;
}

async function fetchAudio(text: string, o: ElevenSpeakOptions, signal: AbortSignal): Promise<string> {
  const key = `${o.voice}|${o.language}|${o.speed}|${text}`;
  const cached = cache.get(key);
  if (cached) return cached;

  let res: Response;
  try {
    res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_IDS[o.voice]}?output_format=mp3_44100_64`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'xi-api-key': ELEVENLABS_KEY },
        body: JSON.stringify({
          text,
          model_id: MODEL,
          language_code: o.language,
          voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: Math.min(1.2, Math.max(0.7, o.speed)) },
        }),
        signal,
      },
    );
  } catch (err) {
    if (signal.aborted) throw new AiError('aborted', 'aborted');
    throw new AiError(`ElevenLabs: ${err instanceof Error ? err.message : 'network error'}`, 'network');
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      message = data?.detail?.message ?? data?.detail?.status ?? message;
    } catch {
      /* kein JSON */
    }
    // Schlüssel ungültig, Kontingent leer, Konto gesperrt → für diese Sitzung abschalten
    if (res.status === 401 || res.status === 402 || res.status === 403 || /quota|credits/i.test(message)) {
      disabledReason = message;
      throw new AiError(`ElevenLabs: ${message}`, res.status === 401 ? 'auth' : 'rate', res.status);
    }
    throw new AiError(`ElevenLabs: ${message}`, res.status === 429 ? 'rate' : 'other', res.status);
  }

  const url = URL.createObjectURL(await res.blob());
  cache.set(key, url);
  return url;
}

export function speakElevenLabs(text: string, options: ElevenSpeakOptions): Playback {
  const controller = new AbortController();
  const audio = new Audio();
  let cancelled = false;
  let finish: () => void = () => undefined;

  const promise = (async () => {
    const url = await fetchAudio(text, options, controller.signal);
    if (cancelled) return;
    audio.src = url;
    await new Promise<void>((resolve, reject) => {
      finish = resolve;
      audio.onended = () => resolve();
      audio.onerror = () => reject(new AiError('ElevenLabs: audio playback failed', 'other'));
      audio.play().catch(reject);
    });
  })();

  return {
    promise,
    cancel: () => {
      cancelled = true;
      controller.abort();
      audio.pause();
      finish();
    },
  };
}
