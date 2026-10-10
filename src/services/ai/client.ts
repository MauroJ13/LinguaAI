/**
 * Einheitlicher Zugang zur KI – kostenlose Dienste ohne Schlüssel und ohne Anmeldung
 * (OVHcloud AI Endpoints, LLM7.io), siehe ./freeProviders.ts.
 */
import { AiError, parseJson } from './errors';
import { freeChat } from './freeProviders';

export const PROVIDER_LABEL = 'OVHcloud AI Endpoints & LLM7.io';

export interface AiRequest {
  system: string;
  prompt: string;
  temperature?: number;
  signal?: AbortSignal;
  /** Zweite Meinung von einem anderen Modell einholen. */
  otherModel?: boolean;
}

export async function aiText(req: AiRequest & { json?: boolean }): Promise<{ text: string; model: string }> {
  const result = await freeChat(req.system, req.prompt, {
    json: req.json,
    temperature: req.temperature,
    signal: req.signal,
    otherModel: req.otherModel,
  });
  if (req.signal?.aborted) throw new AiError('aborted', 'aborted');
  return { text: result.text, model: `${result.provider} · ${result.model}` };
}

export async function aiJson<T>(req: AiRequest): Promise<T> {
  // Kostenlose Modelle liefern gelegentlich kaputtes JSON → einmal neu fragen
  for (let attempt = 0; ; attempt++) {
    const { text } = await aiText({ ...req, json: true });
    try {
      return parseJson<T>(text);
    } catch (err) {
      if (attempt >= 1) throw err;
    }
  }
}
