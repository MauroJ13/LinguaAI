import { END, START, matchCase, regexRule, type AnalyzerConfig } from './types';

const AVERE_TO_ESSERE: Record<string, string> = {
  ho: 'sono',
  hai: 'sei',
  ha: 'è',
  abbiamo: 'siamo',
  avete: 'siete',
  hanno: 'sono',
};

const ESSERE_VERBS: Record<string, string> = {
  andat: 'andare',
  venut: 'venire',
  partit: 'partire',
  arrivat: 'arrivare',
  uscit: 'uscire',
  entrat: 'entrare',
  rimast: 'rimanere',
  tornat: 'tornare',
  nat: 'nascere',
};

export const itAnalyzer: AnalyzerConfig = {
  errorRules: [
    regexRule(
      new RegExp(
        `${START}(ho|hai|ha|abbiamo|avete|hanno)\\s+(${Object.keys(ESSERE_VERBS).join('|')})([oaie])${END}`,
        'iu',
      ),
      (m) => `${m[1]}${matchCase(m[2], AVERE_TO_ESSERE[m[2].toLowerCase()])} ${m[3]}${m[4]}`,
      (m) => ({
        title: 'Hilfsverb „essere“',
        text: `Das Verb „${ESSERE_VERBS[m[3].toLowerCase()]}“ bildet das passato prossimo mit „essere“, nicht mit „avere“.`,
        hint: 'Mit „essere“ passt sich das Partizip an das Subjekt an: sono andato / sono andata.',
      }),
    ),
  ],
  markers: [/eventualmente/i, /recarmi/i, /\blocale\b/i, /al fine di/i, /tuttavia/i, /nondimeno/i, /pertanto/i, /qualora/i],
  simplify: [
    [/\s+eventualmente/gi, ''],
    [/recarmi/gi, 'andare'],
    [/quel locale/gi, 'quel ristorante'],
    [/al fine di/gi, 'per'],
    [/tuttavia|nondimeno/gi, 'ma'],
    [/pertanto/gi, 'quindi'],
    [/qualora/gi, 'se'],
  ],
};
