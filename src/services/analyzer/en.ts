import { END, START, matchCase, regexRule, type AnalyzerConfig } from './types';

const IRREGULAR: Record<string, [string, string, string]> = {
  goed: ['go', 'went', 'gone'],
  eated: ['eat', 'ate', 'eaten'],
  buyed: ['buy', 'bought', 'bought'],
  runned: ['run', 'ran', 'run'],
  catched: ['catch', 'caught', 'caught'],
  thinked: ['think', 'thought', 'thought'],
  teached: ['teach', 'taught', 'taught'],
  drinked: ['drink', 'drank', 'drunk'],
  writed: ['write', 'wrote', 'written'],
  taked: ['take', 'took', 'taken'],
  comed: ['come', 'came', 'come'],
  maked: ['make', 'made', 'made'],
};

export const enAnalyzer: AnalyzerConfig = {
  errorRules: [
    regexRule(
      new RegExp(`${START}(${Object.keys(IRREGULAR).join('|')})${END}`, 'iu'),
      (m) => `${m[1]}${matchCase(m[2], IRREGULAR[m[2].toLowerCase()][1])}`,
      (m) => {
        const [base, past, pp] = IRREGULAR[m[2].toLowerCase()];
        return {
          title: 'Unregelmäßiges Verb',
          text: `„${base}“ ist ein unregelmäßiges Verb. Die Vergangenheit lautet „${past}“, nicht „${m[2].toLowerCase()}“.`,
          hint: `${base} – ${past} – ${pp}`,
        };
      },
    ),
    regexRule(
      new RegExp(`${START}(he|she|it) don['’]t${END}`, 'iu'),
      (m) => `${m[1]}${m[2]} doesn't`,
      () => ({
        title: '3. Person Singular',
        text: 'Bei he / she / it wird die Verneinung mit „doesn’t“ gebildet.',
        hint: 'I / you / we / they don’t · he / she / it doesn’t',
      }),
    ),
    regexRule(
      new RegExp(`${START}(I am|I'm) agree${END}`, 'iu'),
      (m) => `${m[1]}${matchCase(m[2], 'I')} agree`,
      () => ({
        title: '„agree“ ist ein Verb',
        text: '„agree“ ist bereits ein Verb – „am“ wird nicht benötigt.',
        hint: 'I agree · I don’t agree',
      }),
    ),
  ],
  markers: [
    /would be inclined/i,
    /\bventure\b/i,
    /establishment/i,
    /in order to/i,
    /\bsample\b/i,
    /nevertheless/i,
    /furthermore/i,
    /notwithstanding/i,
    /henceforth/i,
    /\bwhom\b/i,
    /consequently/i,
  ],
  simplify: [
    [/would be inclined to/gi, 'would like to'],
    [/venture into/gi, 'go to'],
    [/that establishment/gi, 'that restaurant'],
    [/establishment/gi, 'place'],
    [/in order to/gi, 'to'],
    [/\bsample\b/gi, 'try'],
    [/nevertheless/gi, 'still'],
    [/furthermore/gi, 'also'],
    [/consequently/gi, 'so'],
  ],
};
