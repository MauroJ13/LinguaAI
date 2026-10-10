import { END, START, matchCase, regexRule, type AnalyzerConfig } from './types';

const HABEN_TO_SEIN: Record<string, string> = {
  'ich habe': 'ich bin',
  'du hast': 'du bist',
  'er hat': 'er ist',
  'sie hat': 'sie ist',
  'es hat': 'es ist',
  'man hat': 'man ist',
  'wir haben': 'wir sind',
  'ihr habt': 'ihr seid',
  'sie haben': 'sie sind',
};

const SEIN_VERBS: Record<string, string> = {
  gegangen: 'gehen',
  gekommen: 'kommen',
  geflogen: 'fliegen',
  gelaufen: 'laufen',
  geblieben: 'bleiben',
  gewesen: 'sein',
  geworden: 'werden',
  aufgestanden: 'aufstehen',
  angekommen: 'ankommen',
  gereist: 'reisen',
};

const auxAlt = Object.keys(HABEN_TO_SEIN).join('|');
const partAlt = Object.keys(SEIN_VERBS).join('|');

export const deAnalyzer: AnalyzerConfig = {
  errorRules: [
    regexRule(
      new RegExp(`${START}(${auxAlt})((?:\\s[^.!?]*?)?)\\s(${partAlt})${END}`, 'iu'),
      (m) => `${m[1]}${matchCase(m[2], HABEN_TO_SEIN[m[2].toLowerCase()])}${m[3]} ${m[4]}`,
      (m) => ({
        title: 'Perfekt mit „sein“',
        text: `Das Verb „${SEIN_VERBS[m[4].toLowerCase()]}“ bildet das Perfekt mit „sein“, nicht mit „haben“.`,
        hint: 'Merkhilfe: Verben der Bewegung (gehen, fahren, fliegen …) und der Zustandsveränderung (aufstehen, werden …) stehen im Perfekt mit „sein“.',
      }),
    ),
  ],
  markers: [
    /beabsichtige/i,
    /demnächst/i,
    /\bjene[snmr]?\b/i,
    /etablissement/i,
    /begeben/i,
    /dortige/i,
    /erkunden/i,
    /nichtsdestotrotz/i,
    /infolgedessen/i,
    /diesbezüglich/i,
  ],
  simplify: [
    [/Ich beabsichtige, mich demnächst in jenes Etablissement zu begeben/gi, 'Ich möchte bald in dieses Restaurant gehen'],
    [/die dortige Küche zu erkunden/gi, 'das Essen dort zu probieren'],
    [/nichtsdestotrotz/gi, 'trotzdem'],
    [/infolgedessen/gi, 'deshalb'],
    [/diesbezüglich/gi, 'dazu'],
    [/demnächst/gi, 'bald'],
    [/Etablissement/gi, 'Restaurant'],
    [/\bjenes\b/gi, 'dieses'],
  ],
};
