/** Gemeinsame Fehlerklasse und JSON-Hilfe für die KI-Dienste. */

export type AiErrorKind = 'auth' | 'rate' | 'network' | 'model' | 'aborted' | 'format' | 'other';

export class AiError extends Error {
  constructor(
    message: string,
    public kind: AiErrorKind,
    public status?: number,
  ) {
    super(message);
    this.name = 'AiError';
  }
}

/** Entfernt ```json-Zäune o. Ä. und parst das erste JSON-Objekt. */
export function parseJson<T>(text: string): T {
  const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T;
      } catch {
        /* weiter unten */
      }
    }
    throw new AiError('invalid JSON from AI', 'format');
  }
}
