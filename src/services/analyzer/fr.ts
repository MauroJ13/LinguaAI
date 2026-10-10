import { END, START, matchCase, regexRule, type AnalyzerConfig } from './types';

const AUX_TO_ETRE: Record<string, string> = {
  "j'ai": 'je suis',
  'tu as': 'tu es',
  'il a': 'il est',
  'elle a': 'elle est',
  'on a': 'on est',
  'nous avons': 'nous sommes',
  'vous avez': 'vous êtes',
  'ils ont': 'ils sont',
  'elles ont': 'elles sont',
};

const ETRE_VERBS: Record<string, string> = {
  allé: 'aller',
  venu: 'venir',
  revenu: 'revenir',
  devenu: 'devenir',
  parti: 'partir',
  arrivé: 'arriver',
  sorti: 'sortir',
  entré: 'entrer',
  rentré: 'rentrer',
  resté: 'rester',
  tombé: 'tomber',
  retourné: 'retourner',
  monté: 'monter',
  descendu: 'descendre',
  né: 'naître',
  mort: 'mourir',
};

const auxAlt = "j['’]ai|tu as|il a|elle a|on a|nous avons|vous avez|ils ont|elles ont";
const partAlt = Object.keys(ETRE_VERBS).sort((a, b) => b.length - a.length).join('|');

const AGE: Record<string, string> = {
  'je suis': "j'ai",
  'tu es': 'tu as',
  'il est': 'il a',
  'elle est': 'elle a',
  'on est': 'on a',
};

const PLACES = 'restaurant|cinéma|marché|parc|travail|bureau|musée|supermarché|théâtre|stade|lycée|zoo';

export const frAnalyzer: AnalyzerConfig = {
  errorRules: [
    // J'ai allé → Je suis allé
    regexRule(
      new RegExp(`${START}(${auxAlt})\\s+(${partAlt})(es|e|s)?${END}`, 'iu'),
      (m) => {
        const key = m[2].toLowerCase().replace('’', "'");
        return `${m[1]}${matchCase(m[2], AUX_TO_ETRE[key])} ${m[3]}${m[4] ?? ''}`;
      },
      (m) => {
        const inf = ETRE_VERBS[m[3].toLowerCase()] ?? 'aller';
        return {
          title: 'Hilfsverb „être“',
          text: `Bei dem Verb „${inf}“ wird im passé composé „être“ verwendet – nicht „avoir“.`,
          hint: 'Merkhilfe: Verben der Bewegung und Veränderung (aller, venir, partir, arriver, rester …) bilden das passé composé mit „être“. Das Partizip passt sich dann an das Subjekt an: allé / allée.',
        };
      },
    ),
    // Je suis 20 ans → J'ai 20 ans
    regexRule(
      new RegExp(`${START}(je suis|tu es|il est|elle est|on est)\\s+(\\d+)\\s+ans${END}`, 'iu'),
      (m) => `${m[1]}${matchCase(m[2], AGE[m[2].toLowerCase()])} ${m[3]} ans`,
      () => ({
        title: 'Alter mit „avoir“',
        text: 'Im Französischen „hat“ man sein Alter: Das Alter wird mit „avoir“ angegeben, nicht mit „être“.',
        hint: "Wörtlich: „Ich habe 20 Jahre“ → J'ai 20 ans.",
      }),
    ),
    // à le restaurant → au restaurant
    regexRule(
      new RegExp(`${START}(à|de) le (${PLACES})${END}`, 'iu'),
      (m) => `${m[1]}${matchCase(m[2], m[2].toLowerCase() === 'à' ? 'au' : 'du')} ${m[3]}`,
      (m) => ({
        title: 'Zusammenziehung',
        text: `„${m[2].toLowerCase()} + le“ wird immer zu „${m[2].toLowerCase() === 'à' ? 'au' : 'du'}“ zusammengezogen.`,
        hint: 'à + le = au · à + les = aux · de + le = du · de + les = des',
      }),
    ),
    // je va → je vais
    regexRule(
      new RegExp(`${START}(je) va${END}`, 'iu'),
      (m) => `${m[1]}${m[2]} vais`,
      () => ({
        title: 'Konjugation von „aller“',
        text: 'Die 1. Person Singular von „aller“ lautet „je vais“.',
        hint: 'je vais · tu vas · il/elle va · nous allons · vous allez · ils/elles vont',
      }),
    ),
  ],
  markers: [
    /souhaiterai[st]?/i,
    /éventuellement/i,
    /établissement/i,
    /afin de/i,
    /\b(me|te|se|nous|vous) rendre\b/i,
    /néanmoins/i,
    /toutefois/i,
    /par conséquent/i,
    /d'autant plus/i,
    /il convient/i,
    /\b(auquel|lesquels|lesquelles|duquel)\b/i,
    /quiconque/i,
  ],
  simplify: [
    [/souhaiterais/gi, 'voudrais'],
    [/\s+éventuellement/gi, ''],
    [/\b(me|te|se) rendre\b/gi, 'aller'],
    [/cet établissement/gi, 'ce restaurant'],
    [/établissement/gi, 'restaurant'],
    [/afin de/gi, 'pour'],
    [/néanmoins|toutefois/gi, 'mais'],
    [/par conséquent/gi, 'donc'],
    [/il convient de/gi, 'il faut'],
  ],
};
