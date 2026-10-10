import { useCallback, useEffect, useRef, useState } from 'react';
import { getLanguage } from '../data/languages';
import { levelSpeechRate } from '../data/levels';
import { getVoice } from '../data/voices';
import { useI18n } from '../i18n';
import { AiError } from '../services/ai/errors';
import { isBrowserTtsSupported, loadVoices, speakBrowser, type Playback } from '../services/speech/browserTts';
import { canUseElevenLabs, speakElevenLabs } from '../services/speech/elevenLabsTts';
import type { LanguageCode, Level, VoiceId } from '../types';

export interface SpeakParams {
  language: LanguageCode;
  level: Level;
  voice: VoiceId;
}

export interface SpeakOptions {
  /** Automatisches Vorlesen: keine Fehlermeldung, falls der Browser es blockiert. */
  auto?: boolean;
}

/**
 * Echte Sprachausgabe (🔁 und automatisches Vorlesen).
 * 1. ElevenLabs – natürliche Stimmen, wenn der Entwickler einen Schlüssel in `.env` eingetragen hat
 * 2. Browser-Stimme (Web Speech API) – kostenlos, unbegrenzt, immer als Rückfall
 */
export function useSpeech() {
  const { t, languageName } = useI18n();
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const playbackRef = useRef<Playback | null>(null);
  const tokenRef = useRef(0);
  const speakingRef = useRef<string | null>(null);
  const warnedRef = useRef(new Set<string>());

  const stop = useCallback(() => {
    tokenRef.current += 1;
    playbackRef.current?.cancel();
    playbackRef.current = null;
    speakingRef.current = null;
    setSpeakingId(null);
  }, []);

  useEffect(() => stop, [stop]);

  // Stimmen früh laden – Chrome liefert sie asynchron
  useEffect(() => {
    void loadVoices();
  }, []);

  const speak = useCallback(
    async (id: string, text: string, params: SpeakParams, options: SpeakOptions = {}) => {
      if (speakingRef.current === id) {
        if (!options.auto) stop();
        return;
      }
      stop();
      const token = ++tokenRef.current;
      speakingRef.current = id;
      setSpeakingId(id);

      const language = getLanguage(params.language);
      const voice = getVoice(params.voice);
      const rate = levelSpeechRate(params.level);
      const isCurrent = () => token === tokenRef.current;

      const playWithBrowser = async () => {
        if (!isBrowserTtsSupported()) throw new Error('speechSynthesis not supported');
        const playback = await speakBrowser(text, {
          langTags: language.speech,
          gender: voice.gender,
          pitch: voice.pitch,
          rate: voice.rate * rate,
        });
        if (!isCurrent()) {
          playback.cancel();
          return;
        }
        playbackRef.current = playback;
        if (!playback.choice.exact && !warnedRef.current.has(language.code)) {
          warnedRef.current.add(language.code);
          setNotice(t('ttsFallback', { language: languageName(language.code) }));
        }
        await playback.promise;
      };

      try {
        if (canUseElevenLabs(language.code)) {
          try {
            const playback = speakElevenLabs(text, { voice: voice.id, language: language.code, speed: rate });
            playbackRef.current = playback;
            await playback.promise;
            return;
          } catch (err) {
            if (!isCurrent() || (err instanceof AiError && err.kind === 'aborted')) return;
            // Autoplay blockiert → nicht auf die Browser-Stimme ausweichen (wäre ebenfalls blockiert)
            if (err instanceof DOMException && err.name === 'NotAllowedError') throw err;
            if (!warnedRef.current.has('eleven')) {
              warnedRef.current.add('eleven');
              setNotice(t('ttsElevenFallback', { error: err instanceof Error ? err.message : String(err) }));
            }
          }
        }
        await playWithBrowser();
      } catch (err) {
        if (isCurrent() && !options.auto) {
          setNotice(t('ttsError', { error: err instanceof Error ? err.message : String(err) }));
        }
      } finally {
        if (isCurrent()) {
          playbackRef.current = null;
          speakingRef.current = null;
          setSpeakingId(null);
        }
      }
    },
    [languageName, stop, t],
  );

  const clearNotice = useCallback(() => setNotice(null), []);

  return { speakingId, speak, stop, notice, clearNotice };
}
