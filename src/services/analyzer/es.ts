import { END, START, matchCase, regexRule, type AnalyzerConfig } from './types';

const SER_TO_ESTAR: Record<string, string> = {
  soy: 'estoy',
  eres: 'estás',
  es: 'está',
  somos: 'estamos',
  sois: 'estáis',
  son: 'están',
};

export const esAnalyzer: AnalyzerConfig = {
  errorRules: [
    regexRule(
      new RegExp(`${START}(soy|eres|es|somos|sois|son)\\s+(muy\\s+)?((?:cansad|preocupad|content)(?:o|a|os|as))${END}`, 'iu'),
      (m) => `${m[1]}${matchCase(m[2], SER_TO_ESTAR[m[2].toLowerCase()])} ${m[3] ?? ''}${m[4]}`,
      () => ({
        title: '„estar“ statt „ser“',
        text: 'Vorübergehende Zustände und Gefühle (müde, besorgt, zufrieden …) werden mit „estar“ ausgedrückt.',
        hint: 'ser = dauerhafte Eigenschaften · estar = Zustände, Gefühle, Orte',
      }),
    ),
    regexRule(
      new RegExp(`${START}([Aa]|[Dd]e) el${END}`, 'u'),
      (m) => `${m[1]}${matchCase(m[2], m[2].toLowerCase() === 'a' ? 'al' : 'del')}`,
      (m) => ({
        title: 'Zusammenziehung',
        text: `„${m[2].toLowerCase()} + el“ wird immer zu „${m[2].toLowerCase() === 'a' ? 'al' : 'del'}“.`,
        hint: 'a + el = al · de + el = del',
      }),
    ),
  ],
  markers: [
    /quisiera/i,
    /eventualmente/i,
    /dirigirme/i,
    /dicho establecimiento/i,
    /con el fin de/i,
    /gastronomía/i,
    /no obstante/i,
    /sin embargo/i,
    /por consiguiente/i,
  ],
  simplify: [
    [/quisiera/gi, 'quiero'],
    [/\s+eventualmente/gi, ''],
    [/dirigirme a/gi, 'ir a'],
    [/dicho establecimiento/gi, 'ese restaurante'],
    [/con el fin de/gi, 'para'],
    [/gastronomía/gi, 'comida'],
    [/no obstante|sin embargo/gi, 'pero'],
    [/por consiguiente/gi, 'por eso'],
  ],
};
