import { l, type ConversationScript } from './types';

export const it: ConversationScript = {
  translationLang: 'de',
  greeting: {
    basic: l('Ciao! Sono {voice}. Come stai?', "Hallo! Ich bin {voice}. Wie geht's dir?"),
    intermediate: l('Ciao! Sono {voice}. Come stai oggi?', 'Hallo! Ich bin {voice}. Wie geht es dir heute?'),
    advanced: l(
      'Ciao! Sono {voice}. Raccontami: che cosa ti ha colpito ultimamente?',
      'Hallo! Ich bin {voice}. Erzähl mal: Was hat dich in letzter Zeit beeindruckt?',
    ),
  },
  topics: [
    {
      id: 'cinema',
      pattern: /cinema|film/i,
      lines: {
        basic: l('Bello! Quale film?', 'Schön! Welcher Film?'),
        intermediate: l('Che bello! Che film hai visto?', 'Wie schön! Welchen Film hast du gesehen?'),
        advanced: l(
          'Fantastico! Che film hai visto e che cosa ne pensi?',
          'Fantastisch! Welchen Film hast du gesehen und was hältst du davon?',
        ),
      },
    },
    {
      id: 'restaurant',
      pattern: /ristorante|locale|mangiato|pizza|pasta/i,
      lines: {
        basic: l('Buono! Che cosa hai mangiato?', 'Lecker! Was hast du gegessen?'),
        intermediate: l('Che bello! Che cosa hai ordinato al ristorante?', 'Wie schön! Was hast du im Restaurant bestellt?'),
        advanced: l(
          'Ottimo! Che tipo di cucina preferisci, e perché?',
          'Hervorragend! Welche Art von Küche bevorzugst du, und warum?',
        ),
      },
    },
    {
      id: 'feeling',
      pattern: /\b(bene|benissimo|stanc[oa]|male)\b/i,
      lines: {
        basic: l('Bene! Che cosa hai fatto ieri?', 'Gut! Was hast du gestern gemacht?'),
        intermediate: l('Mi fa piacere! Che cosa hai fatto ieri?', 'Das freut mich! Was hast du gestern gemacht?'),
        advanced: l(
          "Mi fa molto piacere! Raccontami un po' com'è andata la tua giornata di ieri.",
          'Das freut mich sehr! Erzähl mir ein bisschen, wie dein gestriger Tag gelaufen ist.',
        ),
      },
    },
  ],
  replies: {
    basic: [
      l('Va bene! Ti piace la musica?', 'Okay! Magst du Musik?'),
      l('Molto bene! Dove abiti?', 'Sehr gut! Wo wohnst du?'),
      l('Bello! Che cosa fai nel fine settimana?', 'Schön! Was machst du am Wochenende?'),
    ],
    intermediate: [
      l('Davvero? Ti è piaciuto? Perché?', 'Wirklich? Hat es dir gefallen? Warum?'),
      l('Interessante! Che cosa farai questo fine settimana?', 'Interessant! Was wirst du dieses Wochenende machen?'),
      l("Capisco. Da quanto tempo studi l'italiano?", 'Verstehe. Wie lange lernst du schon Italienisch?'),
    ],
    advanced: [
      l(
        'È un punto di vista interessante. Che cosa ti ha portato a pensarla così?',
        'Das ist eine interessante Sichtweise. Was hat dich dazu gebracht, so zu denken?',
      ),
      l(
        'Capisco. Se potessi cambiare una cosa della tua routine quotidiana, quale sceglieresti?',
        'Verstehe. Wenn du eine Sache an deinem Alltag ändern könntest, welche würdest du wählen?',
      ),
      l(
        'Affascinante! Pensi che la tecnologia renda davvero più facile imparare le lingue?',
        'Faszinierend! Glaubst du, dass Technologie das Sprachenlernen wirklich leichter macht?',
      ),
    ],
  },
  suggestions: [
    'Ieri sono andato al cinema.',
    'Ho andato al ristorante.',
    'Vorrei eventualmente recarmi in quel locale al fine di scoprire la loro cucina.',
    'Sto bene, grazie!',
  ],
};
