import { l, type ConversationScript } from './types';

/** Für Deutsch-Lernende wird ins Englische übersetzt. */
export const de: ConversationScript = {
  translationLang: 'en',
  greeting: {
    basic: l("Hallo! Ich bin {voice}. Wie geht's dir?", "Hi! I'm {voice}. How are you?"),
    intermediate: l('Hallo! Ich bin {voice}. Wie geht es dir heute?', "Hello! I'm {voice}. How are you today?"),
    advanced: l(
      'Hallo und herzlich willkommen! Ich bin {voice}. Was beschäftigt dich in letzter Zeit?',
      "Hello and welcome! I'm {voice}. What's been on your mind lately?",
    ),
  },
  topics: [
    {
      id: 'cinema',
      pattern: /kino|film/i,
      lines: {
        basic: l('Cool! Welcher Film?', 'Cool! Which movie?'),
        intermediate: l('Oh, super! Welchen Film hast du gesehen?', 'Oh, great! Which movie did you see?'),
        advanced: l(
          'Klasse! Welchen Film hast du gesehen, und wie fandest du ihn?',
          'Brilliant! Which film did you see, and what did you think of it?',
        ),
      },
    },
    {
      id: 'restaurant',
      pattern: /restaurant|etablissement|essen|gegessen/i,
      lines: {
        basic: l('Lecker! Was hast du gegessen?', 'Yum! What did you eat?'),
        intermediate: l(
          'Klingt gut! Was hast du im Restaurant bestellt?',
          'Sounds good! What did you order at the restaurant?',
        ),
        advanced: l(
          'Schön! Welche Küche magst du am liebsten, und warum?',
          'Lovely! Which cuisine do you like best, and why?',
        ),
      },
    },
    {
      id: 'home',
      pattern: /hause|heim/i,
      lines: {
        basic: l('Okay! Was machst du gern zu Hause?', 'Okay! What do you like doing at home?'),
        intermediate: l(
          'Verstehe! Wie entspannst du dich am liebsten zu Hause?',
          'I see! How do you like to relax at home?',
        ),
        advanced: l(
          'Was macht für dich ein richtiges Zuhause aus?',
          'What makes a place feel like a real home to you?',
        ),
      },
    },
    {
      id: 'feeling',
      pattern: /\b(gut|super|müde|okay|schlecht|prima)\b/i,
      lines: {
        basic: l('Schön! Was hast du gestern gemacht?', 'Nice! What did you do yesterday?'),
        intermediate: l('Das freut mich! Was hast du gestern gemacht?', "I'm glad! What did you do yesterday?"),
        advanced: l(
          'Das freut mich! Erzähl mir doch ein bisschen von deinem gestrigen Tag.',
          "I'm glad! Tell me a bit about your day yesterday.",
        ),
      },
    },
  ],
  replies: {
    basic: [
      l('Okay! Magst du Musik?', 'Okay! Do you like music?'),
      l('Sehr gut! Wo wohnst du?', 'Very good! Where do you live?'),
      l('Schön! Was machst du am Wochenende?', 'Nice! What do you do at the weekend?'),
    ],
    intermediate: [
      l('Wirklich? Hat es dir gefallen? Warum?', 'Really? Did you like it? Why?'),
      l('Interessant! Was machst du dieses Wochenende?', 'Interesting! What are you doing this weekend?'),
      l('Verstehe. Wie lange lernst du schon Deutsch?', 'I see. How long have you been learning German?'),
    ],
    advanced: [
      l(
        'Das ist eine spannende Sichtweise. Wie bist du zu dieser Meinung gekommen?',
        'That is an interesting perspective. How did you come to that view?',
      ),
      l(
        'Verstehe. Wenn du eine Sache in deinem Alltag ändern könntest, welche wäre das?',
        'I see. If you could change one thing in your daily life, what would it be?',
      ),
      l(
        'Glaubst du, dass Technologie das Sprachenlernen tatsächlich erleichtert?',
        'Do you think technology actually makes language learning easier?',
      ),
    ],
  },
  suggestions: [
    'Ich war gestern im Kino.',
    'Ich habe nach Hause gegangen.',
    'Ich beabsichtige, mich demnächst in jenes Etablissement zu begeben, um die dortige Küche zu erkunden.',
    'Mir geht es gut, danke!',
  ],
};
