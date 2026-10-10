import { l, type ConversationScript } from './types';

export const es: ConversationScript = {
  translationLang: 'de',
  greeting: {
    basic: l('¡Hola! Soy {voice}. ¿Qué tal?', "Hallo! Ich bin {voice}. Wie geht's?"),
    intermediate: l('¡Hola! Soy {voice}. ¿Cómo estás hoy?', 'Hallo! Ich bin {voice}. Wie geht es dir heute?'),
    advanced: l(
      '¡Hola! Soy {voice}. Cuéntame, ¿qué te ha llamado la atención últimamente?',
      'Hallo! Ich bin {voice}. Erzähl mal, was ist dir in letzter Zeit aufgefallen?',
    ),
  },
  topics: [
    {
      id: 'cinema',
      pattern: /cine|película/i,
      lines: {
        basic: l('¡Genial! ¿Qué película?', 'Super! Welcher Film?'),
        intermediate: l('¡Qué bien! ¿Qué película viste?', 'Wie schön! Welchen Film hast du gesehen?'),
        advanced: l(
          '¡Estupendo! ¿Qué película viste y qué te pareció?',
          'Großartig! Welchen Film hast du gesehen und wie fandest du ihn?',
        ),
      },
    },
    {
      id: 'restaurant',
      pattern: /restaurante|establecimiento|comida|comí/i,
      lines: {
        basic: l('¡Qué rico! ¿Qué comiste?', 'Lecker! Was hast du gegessen?'),
        intermediate: l('¡Suena bien! ¿Qué pediste en el restaurante?', 'Klingt gut! Was hast du im Restaurant bestellt?'),
        advanced: l(
          '¡Qué bien! ¿Qué tipo de cocina prefieres y por qué?',
          'Wie schön! Welche Art von Küche bevorzugst du und warum?',
        ),
      },
    },
    {
      id: 'feeling',
      pattern: /\b(bien|genial|cansad[oa]|mal)\b/i,
      lines: {
        basic: l('¡Muy bien! ¿Qué hiciste ayer?', 'Sehr gut! Was hast du gestern gemacht?'),
        intermediate: l('¡Me alegro! ¿Qué hiciste ayer?', 'Das freut mich! Was hast du gestern gemacht?'),
        advanced: l(
          '¡Me alegro mucho! Cuéntame un poco cómo fue tu día de ayer.',
          'Das freut mich sehr! Erzähl mir ein bisschen, wie dein gestriger Tag war.',
        ),
      },
    },
  ],
  replies: {
    basic: [
      l('¡Vale! ¿Te gusta la música?', 'Okay! Magst du Musik?'),
      l('¡Muy bien! ¿Dónde vives?', 'Sehr gut! Wo wohnst du?'),
      l('¡Genial! ¿Qué haces el fin de semana?', 'Super! Was machst du am Wochenende?'),
    ],
    intermediate: [
      l('¿De verdad? ¿Te gustó? ¿Por qué?', 'Wirklich? Hat es dir gefallen? Warum?'),
      l('¡Interesante! ¿Qué vas a hacer este fin de semana?', 'Interessant! Was wirst du dieses Wochenende machen?'),
      l('Entiendo. ¿Desde cuándo aprendes español?', 'Verstehe. Seit wann lernst du Spanisch?'),
    ],
    advanced: [
      l(
        'Es un punto de vista interesante. ¿Qué te llevó a pensar así?',
        'Das ist eine interessante Sichtweise. Was hat dich dazu gebracht, so zu denken?',
      ),
      l(
        'Ya veo. Si pudieras cambiar una cosa de tu rutina diaria, ¿cuál sería?',
        'Verstehe. Wenn du eine Sache an deiner täglichen Routine ändern könntest, welche wäre das?',
      ),
      l(
        '¡Fascinante! ¿Crees que la tecnología realmente facilita el aprendizaje de idiomas?',
        'Faszinierend! Glaubst du, dass Technologie das Sprachenlernen wirklich erleichtert?',
      ),
    ],
  },
  suggestions: [
    'Ayer fui al cine.',
    'Yo soy cansado.',
    'Quisiera eventualmente dirigirme a dicho establecimiento con el fin de conocer su gastronomía.',
    '¡Estoy bien, gracias!',
  ],
};
