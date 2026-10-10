import { l, type ConversationScript } from './types';

export const pt: ConversationScript = {
  translationLang: 'de',
  greeting: {
    basic: l('Olá! Eu sou {voice}. Tudo bem?', 'Hallo! Ich bin {voice}. Alles gut?'),
    intermediate: l('Olá! Eu sou {voice}. Como você está hoje?', 'Hallo! Ich bin {voice}. Wie geht es dir heute?'),
    advanced: l(
      'Olá! Eu sou {voice}. Conte-me: o que tem ocupado os seus pensamentos ultimamente?',
      'Hallo! Ich bin {voice}. Erzähl mal: Was beschäftigt dich in letzter Zeit?',
    ),
  },
  replies: {
    basic: [
      l('Legal! Onde você mora?', 'Cool! Wo wohnst du?'),
      l('Muito bem! Você gosta de música?', 'Sehr gut! Magst du Musik?'),
      l('Que bom! O que você faz no fim de semana?', 'Wie schön! Was machst du am Wochenende?'),
    ],
    intermediate: [
      l('Que interessante! O que você fez ontem?', 'Wie interessant! Was hast du gestern gemacht?'),
      l('Entendi. Há quanto tempo você estuda português?', 'Verstanden. Wie lange lernst du schon Portugiesisch?'),
      l('Legal! Qual é a sua comida favorita e por quê?', 'Cool! Was ist dein Lieblingsessen und warum?'),
    ],
    advanced: [
      l(
        'Faz sentido. Na sua opinião, o que torna uma cidade agradável para se viver?',
        'Das ergibt Sinn. Was macht deiner Meinung nach eine Stadt lebenswert?',
      ),
      l(
        'Interessante! Se você pudesse morar em outro país, qual escolheria?',
        'Interessant! Wenn du in einem anderen Land leben könntest, welches würdest du wählen?',
      ),
      l(
        'Concordo em parte. Você acha que as redes sociais nos aproximam ou nos afastam?',
        'Ich stimme teilweise zu. Glaubst du, dass soziale Netzwerke uns näherbringen oder voneinander entfernen?',
      ),
    ],
  },
  suggestions: ['Ontem eu fui ao cinema.', 'Tudo bem, obrigado!'],
};
