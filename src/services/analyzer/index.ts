/**
 * Simulierte Satzanalyse (💡).
 * Unterscheidet drei Fälle:
 *  1. echter Fehler            → Korrektur
 *  2. korrekt, aber zu schwer  → Merkhilfe mit einfacherer Variante
 *  3. korrekt und passend      → Bestätigung
 * Ein korrekter Satz wird nie als Fehler markiert.
 */
import { levelIndex } from '../../data/levels';
import type { Analysis, LanguageCode, Level, Reason } from '../../types';
import { deAnalyzer } from './de';
import { enAnalyzer } from './en';
import { esAnalyzer } from './es';
import { frAnalyzer } from './fr';
import { itAnalyzer } from './it';
import type { AnalyzerConfig } from './types';

const ANALYZERS: Partial<Record<LanguageCode, AnalyzerConfig>> = {
  fr: frAnalyzer,
  en: enAnalyzer,
  de: deAnalyzer,
  es: esAnalyzer,
  it: itAnalyzer,
};

function estimateLevel(markerCount: number): Level | null {
  if (markerCount >= 2) return 'C1';
  if (markerCount === 1) return 'B2';
  return null;
}

export function analyzeMessage(text: string, language: LanguageCode, level: Level): Analysis {
  const original = text.trim();
  const config = ANALYZERS[language];
  if (!config) return { type: 'ok', original, level };

  // Fall 1 – echte Fehler
  let corrected = original;
  const reasons: Reason[] = [];
  for (const rule of config.errorRules) {
    const result = rule(corrected);
    if (result) {
      corrected = result.text;
      reasons.push(result.reason);
    }
  }
  if (reasons.length > 0) {
    return { type: 'correction', original, corrected, reasons };
  }

  // Fall 2 – korrekt, aber über dem gewählten Niveau
  const expressions = config.markers
    .map((m) => original.match(m)?.[0])
    .filter((m): m is string => Boolean(m));
  const estimated = estimateLevel(expressions.length);

  if (estimated && levelIndex(level) < levelIndex(estimated)) {
    let simpler = original;
    for (const [pattern, replacement] of config.simplify) {
      simpler = simpler.replace(pattern, replacement);
    }
    simpler = simpler.replace(/\s{2,}/g, ' ').trim();
    simpler = simpler.charAt(0).toUpperCase() + simpler.slice(1);
    return {
      type: 'tip',
      original,
      suggestion: simpler !== original ? simpler : null,
      level,
      estimatedLevel: estimated,
      expressions,
    };
  }

  // Fall 3 – korrekt und passend
  return { type: 'ok', original, level };
}

export function hasAnalyzer(language: LanguageCode): boolean {
  return language in ANALYZERS;
}
