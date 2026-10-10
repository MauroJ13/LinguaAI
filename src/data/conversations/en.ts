import { l, type ConversationScript } from './types';

export const en: ConversationScript = {
  translationLang: 'de',
  greeting: {
    basic: l("Hi! I'm {voice}. How are you?", 'Hallo! Ich bin {voice}. Wie geht es dir?'),
    intermediate: l("Hello! I'm {voice}. How are you doing today?", 'Hallo! Ich bin {voice}. Wie geht es dir heute?'),
    advanced: l(
      "Hello and welcome! I'm {voice}. What's been on your mind lately?",
      'Hallo und willkommen! Ich bin {voice}. Was beschäftigt dich in letzter Zeit?',
    ),
  },
  topics: [
    {
      id: 'cinema',
      pattern: /cinema|movie|film/i,
      lines: {
        basic: l('Cool! What movie?', 'Cool! Welcher Film?'),
        intermediate: l('Oh, nice! Which movie did you watch?', 'Oh, schön! Welchen Film hast du gesehen?'),
        advanced: l(
          'Oh, brilliant! Which film did you see, and what did you make of it?',
          'Oh, großartig! Welchen Film hast du gesehen, und was hältst du davon?',
        ),
      },
    },
    {
      id: 'restaurant',
      pattern: /restaurant|establishment|dinner|lunch/i,
      lines: {
        basic: l('Yum! What did you eat?', 'Lecker! Was hast du gegessen?'),
        intermediate: l('Sounds great! What did you have?', 'Klingt super! Was hattest du?'),
        advanced: l(
          'Lovely! What kind of cuisine do you usually go for, and why?',
          'Schön! Welche Küche bevorzugst du normalerweise, und warum?',
        ),
      },
    },
    {
      id: 'work',
      pattern: /\b(work|job|office|school|university)\b/i,
      lines: {
        basic: l('Nice! Do you like it?', 'Schön! Magst du es?'),
        intermediate: l("How's it going? What do you do exactly?", 'Wie läuft es? Was machst du genau?'),
        advanced: l(
          'What motivates you most about what you do every day?',
          'Was motiviert dich am meisten an dem, was du jeden Tag machst?',
        ),
      },
    },
    {
      id: 'travel',
      pattern: /travel|holiday|vacation|trip|weekend/i,
      lines: {
        basic: l('Great! Do you like to travel?', 'Super! Reist du gern?'),
        intermediate: l(
          'Awesome! Where would you like to go on holiday?',
          'Toll! Wohin würdest du gern in den Urlaub fahren?',
        ),
        advanced: l(
          'Which trip has left the biggest impression on you so far?',
          'Welche Reise hat dich bisher am meisten beeindruckt?',
        ),
      },
    },
    {
      id: 'feeling',
      pattern: /\b(fine|good|great|ok|okay|tired|well)\b/i,
      lines: {
        basic: l('Great! What did you do yesterday?', 'Super! Was hast du gestern gemacht?'),
        intermediate: l('Glad to hear it! What did you do yesterday?', 'Freut mich zu hören! Was hast du gestern gemacht?'),
        advanced: l(
          'Glad to hear it! Tell me a bit about your day yesterday.',
          'Freut mich! Erzähl mir ein bisschen von deinem gestrigen Tag.',
        ),
      },
    },
  ],
  replies: {
    basic: [
      l('Okay! Do you like music?', 'Okay! Magst du Musik?'),
      l('Very good! Where do you live?', 'Sehr gut! Wo wohnst du?'),
      l('Nice! What do you do at the weekend?', 'Schön! Was machst du am Wochenende?'),
    ],
    intermediate: [
      l('Really? Did you enjoy it? Why?', 'Wirklich? Hat es dir gefallen? Warum?'),
      l('Interesting! What are you going to do this weekend?', 'Interessant! Was wirst du dieses Wochenende machen?'),
      l('I see. How long have you been learning English?', 'Verstehe. Wie lange lernst du schon Englisch?'),
      l("Cool! What's your favourite season, and why?", 'Cool! Was ist deine Lieblingsjahreszeit, und warum?'),
    ],
    advanced: [
      l(
        "That's an interesting perspective. What led you to think that way?",
        'Das ist eine interessante Sichtweise. Was hat dich zu dieser Denkweise gebracht?',
      ),
      l(
        'I see. If you could change one thing about your daily routine, what would it be?',
        'Verstehe. Wenn du eine Sache an deinem Alltag ändern könntest, was wäre das?',
      ),
      l(
        'Fascinating! Do you think technology genuinely makes language learning easier?',
        'Faszinierend! Glaubst du, dass Technologie das Sprachenlernen wirklich erleichtert?',
      ),
    ],
  },
  suggestions: [
    'I went to the cinema yesterday.',
    'Yesterday I goed to the restaurant.',
    'I would be inclined to venture into that establishment in order to sample their cuisine.',
    "I'm fine, thanks!",
  ],
};
