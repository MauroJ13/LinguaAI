import type { Reason } from '../../types';

export type ErrorRule = (text: string) => { text: string; reason: Reason } | null;

export interface AnalyzerConfig {
  /** Echte Fehler → Korrektur. */
  errorRules: ErrorRule[];
  /** Ausdrücke, die auf ein höheres Sprachniveau hindeuten. */
  markers: RegExp[];
  /** Ersetzungen, um einen gehobenen Satz einfacher zu formulieren. */
  simplify: [RegExp, string][];
}

/** Übernimmt die Großschreibung des Originals (z. B. „J'ai“ → „Je suis“). */
export function matchCase(source: string, target: string): string {
  const first = source.charAt(0);
  if (first && first === first.toUpperCase() && first !== first.toLowerCase()) {
    return target.charAt(0).toUpperCase() + target.slice(1);
  }
  return target;
}

/**
 * Hilfsfunktion für Regex-basierte Fehlerregeln.
 * Ersetzt das erste Vorkommen und liefert die passende Erklärung.
 */
export function regexRule(
  pattern: RegExp,
  replace: (m: RegExpExecArray) => string,
  reason: (m: RegExpExecArray) => Reason,
): ErrorRule {
  return (text) => {
    const re = new RegExp(pattern.source, pattern.flags.replace('g', ''));
    const m = re.exec(text);
    if (!m) return null;
    return {
      text: text.slice(0, m.index) + replace(m) + text.slice(m.index + m[0].length),
      reason: reason(m),
    };
  };
}

/** Wortgrenzen, die auch mit Akzenten (é, ü, …) funktionieren. */
export const START = '(^|[^\\p{L}])';
export const END = '(?![\\p{L}])';
