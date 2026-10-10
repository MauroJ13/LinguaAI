/**
 * Kostenlose KI-Dienste OHNE Anmeldung und OHNE API-Schlüssel (OpenAI-kompatibel, CORS erlaubt).
 *
 *  1. OVHcloud AI Endpoints – https://endpoints.ai.cloud.ovh.net (anonym: 2 Anfragen/Minute pro Modell)
 *     → mehrere Modelle werden abwechselnd genutzt, damit das Limit nicht greift.
 *  2. LLM7.io               – https://llm7.io (anonym, Tageslimit pro IP)
 *
 * Ist ein Modell ausgelastet, wird automatisch das nächste probiert.
 * Am Ende bleibt der Demo-Modus als letzte Rückfallebene.
 */
import { AiError } from './errors';

interface FreeEndpoint {
  id: 'ovh' | 'llm7';
  label: string;
  url: string;
  models: string[];
  headers: Record<string, string>;
  /** Zusätzliche Felder im Request-Body. */
  extra?: Record<string, unknown>;
  timeoutMs: number;
  /** Anonymes Limit: Anfragen pro Minute und Modell (für die Verteilung auf mehrere Modelle). */
  rpm?: number;
}

export const FREE_ENDPOINTS: FreeEndpoint[] = [
  {
    id: 'ovh',
    label: 'OVHcloud AI Endpoints',
    url: 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions',
    // Schnelle, mehrsprachige Modelle zuerst (Stand Oktober 2026)
    // Reihenfolge nach Test: Mistral Small erkennt Fehler am zuverlässigsten; die großen
    // Denk-Modelle (Qwen, gpt-oss) sind genau, aber langsam (15–30 s) → Reserve.
    models: [
      'Mistral-Small-3.2-24B-Instruct-2506',
      'Meta-Llama-3_3-70B-Instruct',
      'Qwen3.5-397B-A17B',
      'gpt-oss-120b',
    ],
    headers: {},
    timeoutMs: 40000,
    rpm: 2,
  },
  {
    id: 'llm7',
    label: 'LLM7.io',
    url: 'https://api.llm7.io/v1/chat/completions',
    models: ['gpt-oss:20b', 'DeepSeek-V4-Flash-0731', 'mistral-Nemo-Instruct-2407'],
    headers: { Authorization: 'Bearer unused' },
    timeoutMs: 30000,
  },
];

/** Merkt sich, welcher Dienst/Modell zuletzt funktioniert hat, und was gerade gesperrt ist. */
const blockedUntil = new Map<string, number>();
let lastWorking: { endpoint: string; model: string } | null = null;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Zeitpunkte der letzten Anfragen je Modell – um das Minutenlimit gar nicht erst zu erreichen. */
const recentCalls = new Map<string, number[]>();

function hasCapacity(endpoint: FreeEndpoint, key: string): boolean {
  if (!endpoint.rpm) return true;
  const now = Date.now();
  const calls = (recentCalls.get(key) ?? []).filter((t) => now - t < 60_000);
  recentCalls.set(key, calls);
  return calls.length < endpoint.rpm;
}

function noteCall(key: string) {
  recentCalls.set(key, [...(recentCalls.get(key) ?? []), Date.now()]);
}

async function callOnce(
  endpoint: FreeEndpoint,
  model: string,
  system: string,
  prompt: string,
  json: boolean,
  temperature: number | undefined,
): Promise<string> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), endpoint.timeoutMs);
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt },
    ],
    ...endpoint.extra,
  };
  if (json) body.response_format = { type: 'json_object' };
  if (temperature !== undefined) body.temperature = temperature;

  let res: Response;
  try {
    res = await fetch(endpoint.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...endpoint.headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new AiError(`${endpoint.label}: network error`, 'network');
  } finally {
    window.clearTimeout(timer);
  }

  let data: {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string; retry_after?: number } | string;
    message?: string;
  } = {};
  try {
    data = await res.json();
  } catch {
    /* kein JSON */
  }

  const apiError = typeof data.error === 'string' ? { message: data.error } : data.error;
  const errorText = apiError?.message ?? data.message;

  if (res.status === 429 || res.status === 402) {
    const retry = Number(apiError?.retry_after ?? res.headers.get('retry-after') ?? 0);
    const err = new AiError(`${endpoint.label}: ${errorText ?? 'rate limit'}`, 'rate', res.status);
    (err as AiError & { retryAfter?: number }).retryAfter = retry;
    throw err;
  }
  if (res.status === 400 && json && /json mode/i.test(errorText ?? '')) {
    // Modell kann keinen JSON-Modus → ohne response_format erneut fragen (Prompt verlangt ja JSON)
    return callOnce(endpoint, model, system, prompt, false, temperature);
  }
  if (res.status === 401 || res.status === 403) {
    throw new AiError(`${endpoint.label}: ${errorText ?? 'model needs a key'}`, 'model', res.status);
  }
  if (!res.ok) {
    throw new AiError(`${endpoint.label}: ${errorText ?? `HTTP ${res.status}`}`, 'model', res.status);
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new AiError(`${endpoint.label}: empty response`, 'format');
  return text;
}

export interface FreeChatResult {
  text: string;
  model: string;
  provider: string;
}

export async function freeChat(
  system: string,
  prompt: string,
  options: {
    json?: boolean;
    temperature?: number;
    signal?: AbortSignal;
    /** Zweite Meinung: das zuletzt genutzte Modell ans Ende stellen. */
    otherModel?: boolean;
  } = {},
): Promise<FreeChatResult> {
  // Reihenfolge: zuletzt funktionierende Kombination zuerst
  const routes: { endpoint: FreeEndpoint; model: string }[] = [];
  for (const endpoint of FREE_ENDPOINTS) {
    for (const model of endpoint.models) routes.push({ endpoint, model });
  }
  if (lastWorking) {
    routes.sort((a, b) => {
      const aw = a.endpoint.id === lastWorking!.endpoint && a.model === lastWorking!.model ? -1 : 0;
      const bw = b.endpoint.id === lastWorking!.endpoint && b.model === lastWorking!.model ? -1 : 0;
      return options.otherModel ? bw - aw : aw - bw;
    });
  }

  let lastError: AiError = new AiError('no free AI service available', 'network');

  // Zwei Durchgänge: Sind alle Modelle nur wegen des Minutenlimits „voll“, kurz warten und erneut versuchen
  for (let pass = 0; pass < 2; pass++) {
  let waitingForCapacity = false;
  for (const { endpoint, model } of routes) {
    const key = `${endpoint.id}|${model}`;
    if ((blockedUntil.get(key) ?? 0) > Date.now()) continue;
    if (!hasCapacity(endpoint, key)) {
      waitingForCapacity = true;
      continue;
    }
    if (options.signal?.aborted) throw new AiError('aborted', 'aborted');

    // Bei kurzer Überlastung einmal kurz warten und erneut versuchen
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        noteCall(key);
        const text = await callOnce(endpoint, model, system, prompt, Boolean(options.json), options.temperature);
        lastWorking = { endpoint: endpoint.id, model };
        return { text, model, provider: endpoint.label };
      } catch (err) {
        const error = err instanceof AiError ? err : new AiError(String(err), 'other');
        lastError = error;
        const retryAfter = (error as AiError & { retryAfter?: number }).retryAfter ?? 0;
        if (error.kind === 'rate' && attempt === 0 && retryAfter > 0 && retryAfter <= 12) {
          await wait(retryAfter * 1000);
          continue;
        }
        // Netzwerkfehler betreffen nicht ein bestimmtes Modell → nicht sperren (sonst schlägt „Erneut versuchen“ fehl)
        if (error.kind === 'network') break;
        // Dienst/Modell für eine Weile überspringen
        const pause =
          error.kind === 'rate'
            ? Math.min(Math.max(retryAfter, 60), 24 * 3600) * 1000
            : error.kind === 'model'
              ? 10 * 60_000
              : 30_000;
        blockedUntil.set(key, Date.now() + pause);
        break;
      }
    }
  }
  if (!waitingForCapacity || pass === 1) break;
  await wait(secondsUntilCapacity() * 1000);
  }
  throw lastError;
}

/** Sekunden, bis bei einem Modell wieder eine Anfrage frei ist (max. 30). */
function secondsUntilCapacity(): number {
  const now = Date.now();
  let soonest = 30;
  for (const calls of recentCalls.values()) {
    if (calls.length) soonest = Math.min(soonest, Math.max(1, Math.ceil((calls[0] + 60_000 - now) / 1000)));
  }
  return soonest;
}
