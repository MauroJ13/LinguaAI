import { l, type ConversationScript } from './types';

export const fr: ConversationScript = {
  translationLang: 'de',
  greeting: {
    basic: l("Bonjour ! Je m'appelle {voice}. Comment vas-tu ?", 'Hallo! Ich heiße {voice}. Wie geht es dir?'),
    intermediate: l(
      "Bonjour ! Moi, c'est {voice}. Comment vas-tu aujourd'hui ?",
      'Hallo! Ich bin {voice}. Wie geht es dir heute?',
    ),
    advanced: l(
      "Bonjour et bienvenue ! Moi, c'est {voice}. Dis-moi, qu'est-ce qui t'a marqué ces derniers temps ?",
      'Hallo und willkommen! Ich bin {voice}. Sag mal, was hat dich in letzter Zeit beschäftigt?',
    ),
  },
  topics: [
    {
      id: 'cinema',
      pattern: /cin[ée]ma|film/i,
      lines: {
        basic: l('Super ! Quel film ?', 'Super! Welcher Film?'),
        intermediate: l('Ah, super ! Quel film as-tu regardé ?', 'Ah, super! Welchen Film hast du gesehen?'),
        advanced: l(
          "Ah, génial ! Quel film as-tu vu, et qu'est-ce que tu en as pensé ?",
          'Ah, genial! Welchen Film hast du gesehen, und was hast du davon gehalten?',
        ),
      },
    },
    {
      id: 'restaurant',
      pattern: /restaurant|établissement|cuisine/i,
      lines: {
        basic: l('Miam ! Tu as mangé quoi ?', 'Lecker! Was hast du gegessen?'),
        intermediate: l(
          "Ça a l'air bien ! Qu'est-ce que tu as mangé au restaurant ?",
          'Klingt gut! Was hast du im Restaurant gegessen?',
        ),
        advanced: l(
          'Quelle bonne idée ! Quel genre de cuisine est-ce que tu préfères, et pourquoi ?',
          'Was für eine gute Idee! Welche Art von Küche bevorzugst du, und warum?',
        ),
      },
    },
    {
      id: 'food',
      pattern: /mang|pomme|pizza|pain|fromage|croissant/i,
      lines: {
        basic: l("C'est bon ! Tu aimes les fruits ?", 'Das ist gut! Magst du Obst?'),
        intermediate: l(
          "C'est très bien ! Qu'est-ce que tu aimes manger le plus ?",
          'Sehr gut! Was isst du am liebsten?',
        ),
        advanced: l('Intéressant ! Est-ce que tu cuisines souvent toi-même ?', 'Interessant! Kochst du oft selbst?'),
      },
    },
    {
      id: 'work',
      pattern: /travail|bureau|école|université|cours|job/i,
      lines: {
        basic: l("C'est bien ! Tu aimes ça ?", 'Das ist schön! Magst du das?'),
        intermediate: l(
          "Et ça se passe bien ? Qu'est-ce que tu fais exactement ?",
          'Und läuft es gut? Was machst du genau?',
        ),
        advanced: l(
          "Qu'est-ce qui te motive le plus dans ce que tu fais au quotidien ?",
          'Was motiviert dich am meisten an dem, was du täglich machst?',
        ),
      },
    },
    {
      id: 'travel',
      pattern: /week-end|weekend|vacances|voyage|paris|plage/i,
      lines: {
        basic: l('Super ! Tu aimes voyager ?', 'Super! Reist du gern?'),
        intermediate: l(
          "Génial ! Où est-ce que tu aimerais partir en vacances ?",
          'Toll! Wohin würdest du gern in den Urlaub fahren?',
        ),
        advanced: l(
          "Quel voyage t'a le plus marqué jusqu'à présent ?",
          'Welche Reise hat dich bisher am meisten beeindruckt?',
        ),
      },
    },
    {
      id: 'feeling',
      pattern: /\b(bien|ça va|ca va|fatigu|mal|super)\b/i,
      lines: {
        basic: l("Très bien ! Qu'est-ce que tu as fait hier ?", 'Sehr gut! Was hast du gestern gemacht?'),
        intermediate: l(
          "Ça me fait plaisir ! Qu'est-ce que tu as fait hier ?",
          'Das freut mich! Was hast du gestern gemacht?',
        ),
        advanced: l(
          "Ça me fait plaisir ! Raconte-moi un peu ta journée d'hier.",
          'Das freut mich! Erzähl mir ein bisschen von deinem gestrigen Tag.',
        ),
      },
    },
  ],
  replies: {
    basic: [
      l("D'accord ! Et toi, tu aimes la musique ?", 'Okay! Und du, magst du Musik?'),
      l('Très bien ! Tu habites où ?', 'Sehr gut! Wo wohnst du?'),
      l("Super ! Qu'est-ce que tu fais le week-end ?", 'Super! Was machst du am Wochenende?'),
      l("C'est intéressant ! Tu as des frères et sœurs ?", 'Das ist interessant! Hast du Geschwister?'),
    ],
    intermediate: [
      l("Ah bon ? Et ça t'a plu ? Pourquoi ?", 'Ach so? Und hat es dir gefallen? Warum?'),
      l(
        "Intéressant ! Qu'est-ce que tu vas faire ce week-end ?",
        'Interessant! Was wirst du dieses Wochenende machen?',
      ),
      l(
        'Je comprends. Depuis combien de temps est-ce que tu apprends le français ?',
        'Ich verstehe. Seit wann lernst du Französisch?',
      ),
      l(
        "C'est cool ! Quelle est ta saison préférée, et pourquoi ?",
        'Das ist cool! Was ist deine Lieblingsjahreszeit, und warum?',
      ),
    ],
    advanced: [
      l(
        "C'est un point de vue intéressant. Qu'est-ce qui t'a amené à penser ainsi ?",
        'Das ist eine interessante Sichtweise. Was hat dich dazu gebracht, so zu denken?',
      ),
      l(
        'Je vois. Si tu pouvais changer une chose dans ton quotidien, laquelle choisirais-tu ?',
        'Ich verstehe. Wenn du eine Sache in deinem Alltag ändern könntest, welche würdest du wählen?',
      ),
      l(
        "Passionnant ! Penses-tu que la technologie facilite vraiment l'apprentissage des langues ?",
        'Spannend! Glaubst du, dass Technologie das Sprachenlernen wirklich erleichtert?',
      ),
      l('Tout à fait. Comment imagines-tu ta vie dans dix ans ?', 'Absolut. Wie stellst du dir dein Leben in zehn Jahren vor?'),
    ],
  },
  suggestions: [
    'Je suis allé au cinéma hier.',
    "J'ai allé au restaurant.",
    'Je souhaiterais éventuellement me rendre dans cet établissement afin de découvrir leur cuisine.',
    "J'ai mangé des pommes.",
  ],
};
