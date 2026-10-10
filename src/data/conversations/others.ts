import { allTiers, l, type ConversationScript } from './types';

/**
 * Kompaktere Skripte für die übrigen Sprachen.
 * Für den Prototyp nutzen sie für alle Niveaus dieselben Sätze –
 * die echte KI-API übernimmt später die Niveau-Anpassung.
 */
function simple(greeting: [string, string], replies: [string, string][]): ConversationScript {
  return {
    translationLang: 'de',
    greeting: allTiers(l(greeting[0], greeting[1])),
    replies: allTiers(replies.map(([t, tr]) => l(t, tr))),
  };
}

export const ru = simple(['Привет! Меня зовут {voice}. Как дела?', "Hallo! Ich heiße {voice}. Wie geht's?"], [
  ['Отлично! Чем ты занимаешься в свободное время?', 'Super! Was machst du in deiner Freizeit?'],
  ['Интересно! А где ты живёшь?', 'Interessant! Und wo wohnst du?'],
  ['Здорово! Какую музыку ты любишь?', 'Toll! Welche Musik magst du?'],
  ['Понятно. Почему ты изучаешь русский язык?', 'Verstehe. Warum lernst du Russisch?'],
]);

export const hr = simple(['Zdravo! Ja sam {voice}. Kako si?', "Hallo! Ich bin {voice}. Wie geht's dir?"], [
  ['Super! Šta radiš u slobodno vrijeme?', 'Super! Was machst du in deiner Freizeit?'],
  ['Zanimljivo! Gdje živiš?', 'Interessant! Wo wohnst du?'],
  ['Odlično! Koju muziku voliš?', 'Toll! Welche Musik magst du?'],
  ['Razumijem. Zašto učiš ovaj jezik?', 'Verstehe. Warum lernst du diese Sprache?'],
]);

export const pl = simple(['Cześć! Mam na imię {voice}. Jak się masz?', 'Hallo! Ich heiße {voice}. Wie geht es dir?'], [
  ['Świetnie! Co robisz w wolnym czasie?', 'Super! Was machst du in deiner Freizeit?'],
  ['Ciekawe! Gdzie mieszkasz?', 'Interessant! Wo wohnst du?'],
  ['Super! Jakiej muzyki lubisz słuchać?', 'Super! Welche Musik hörst du gern?'],
  ['Rozumiem. Dlaczego uczysz się polskiego?', 'Verstehe. Warum lernst du Polnisch?'],
]);

export const nl = simple(['Hallo! Ik ben {voice}. Hoe gaat het met je?', 'Hallo! Ich bin {voice}. Wie geht es dir?'], [
  ['Leuk! Wat doe je graag in je vrije tijd?', 'Schön! Was machst du gern in deiner Freizeit?'],
  ['Interessant! Waar woon je?', 'Interessant! Wo wohnst du?'],
  ['Top! Naar welke muziek luister je graag?', 'Super! Welche Musik hörst du gern?'],
  ['Ik snap het. Waarom leer je Nederlands?', 'Verstehe. Warum lernst du Niederländisch?'],
]);

export const tr = simple(['Merhaba! Ben {voice}. Nasılsın?', 'Hallo! Ich bin {voice}. Wie geht es dir?'], [
  ['Harika! Boş zamanlarında ne yaparsın?', 'Toll! Was machst du in deiner Freizeit?'],
  ['İlginç! Nerede yaşıyorsun?', 'Interessant! Wo wohnst du?'],
  ['Süper! Ne tür müzik seversin?', 'Super! Welche Art von Musik magst du?'],
  ['Anlıyorum. Neden Türkçe öğreniyorsun?', 'Verstehe. Warum lernst du Türkisch?'],
]);

export const sv = simple(['Hej! Jag heter {voice}. Hur mår du?', 'Hallo! Ich heiße {voice}. Wie geht es dir?'], [
  ['Vad kul! Vad gör du på fritiden?', 'Wie schön! Was machst du in deiner Freizeit?'],
  ['Intressant! Var bor du?', 'Interessant! Wo wohnst du?'],
  ['Toppen! Vilken musik gillar du?', 'Super! Welche Musik magst du?'],
  ['Jag förstår. Varför lär du dig svenska?', 'Verstehe. Warum lernst du Schwedisch?'],
]);

export const ja = simple(['こんにちは！{voice}です。お元気ですか？', 'Hallo! Ich bin {voice}. Wie geht es dir?'], [
  ['いいですね！趣味は何ですか？', 'Schön! Was sind deine Hobbys?'],
  ['そうですか！どこに住んでいますか？', 'Ach so! Wo wohnst du?'],
  ['すごい！どんな音楽が好きですか？', 'Toll! Welche Musik magst du?'],
  ['なるほど。どうして日本語を勉強しているんですか？', 'Verstehe. Warum lernst du Japanisch?'],
]);

export const ko = simple(['안녕하세요! 저는 {voice} 선생님이에요. 잘 지내세요?', 'Hallo! Ich bin {voice}, deine Lehrkraft. Wie geht es dir?'], [
  ['좋아요! 취미가 뭐예요?', 'Schön! Was ist dein Hobby?'],
  ['그렇군요! 어디에 살아요?', 'Verstehe! Wo wohnst du?'],
  ['멋져요! 어떤 음악을 좋아해요?', 'Cool! Welche Musik magst du?'],
  ['알겠어요. 왜 한국어를 배워요?', 'Okay. Warum lernst du Koreanisch?'],
]);

export const zh = simple(['你好！我是{voice}。你今天怎么样？', 'Hallo! Ich bin {voice}. Wie geht es dir heute?'], [
  ['太好了！你平时喜欢做什么？', 'Super! Was machst du normalerweise gern?'],
  ['很有意思！你住在哪里？', 'Sehr interessant! Wo wohnst du?'],
  ['真棒！你喜欢什么音乐？', 'Toll! Welche Musik magst du?'],
  ['明白了。你为什么学中文？', 'Verstehe. Warum lernst du Chinesisch?'],
]);

export const el = simple(['Γεια σου! Με λένε {voice}. Τι κάνεις;', 'Hallo! Ich heiße {voice}. Wie geht es dir?'], [
  ['Τέλεια! Τι σου αρέσει να κάνεις στον ελεύθερο χρόνο σου;', 'Super! Was machst du gern in deiner Freizeit?'],
  ['Ενδιαφέρον! Πού μένεις;', 'Interessant! Wo wohnst du?'],
  ['Ωραία! Τι μουσική σου αρέσει;', 'Schön! Welche Musik magst du?'],
  ['Καταλαβαίνω. Γιατί μαθαίνεις ελληνικά;', 'Verstehe. Warum lernst du Griechisch?'],
]);

export const ar = simple(['مرحباً! أنا {voice}. كيف حالك؟', 'Hallo! Ich bin {voice}. Wie geht es dir?'], [
  ['رائع! ماذا تحب أن تفعل في وقت فراغك؟', 'Toll! Was machst du gern in deiner Freizeit?'],
  ['مثير للاهتمام! أين تسكن؟', 'Interessant! Wo wohnst du?'],
  ['جميل! ما نوع الموسيقى التي تحبها؟', 'Schön! Welche Art von Musik magst du?'],
  ['فهمت. لماذا تتعلم اللغة العربية؟', 'Verstehe. Warum lernst du Arabisch?'],
]);

export const hi = simple(['नमस्ते! मैं {voice} हूँ। आप कैसे हैं?', 'Hallo! Ich bin {voice}. Wie geht es dir?'], [
  ['बहुत अच्छा! आपको खाली समय में क्या करना पसंद है?', 'Sehr gut! Was machst du gern in deiner Freizeit?'],
  ['दिलचस्प! आप कहाँ रहते हैं?', 'Interessant! Wo wohnst du?'],
  ['वाह! आपको कौन-सा संगीत पसंद है?', 'Wow! Welche Musik magst du?'],
  ['अच्छा। आप हिंदी क्यों सीख रहे हैं?', 'Aha. Warum lernst du Hindi?'],
]);

export const la = simple(['Salve! {voice} sum. Quid agis?', 'Hallo! Ich bin {voice}. Wie geht es dir?'], [
  ['Optime! Quid libenter facis, cum otium habes?', 'Sehr gut! Was machst du gern, wenn du Freizeit hast?'],
  ['Bene! Ubi habitas?', 'Gut! Wo wohnst du?'],
  ['Pulchre! Quam musicam amas?', 'Schön! Welche Musik magst du?'],
  ['Intellego. Cur linguam Latinam discis?', 'Ich verstehe. Warum lernst du Latein?'],
]);

export const he = simple(['שלום! אני {voice}. מה שלומך?', 'Hallo! Ich bin {voice}. Wie geht es dir?'], [
  ['מצוין! מה אתה אוהב לעשות בזמן הפנוי?', 'Super! Was machst du gern in deiner Freizeit?'],
  ['מעניין! איפה אתה גר?', 'Interessant! Wo wohnst du?'],
  ['יופי! איזו מוזיקה אתה אוהב?', 'Toll! Welche Musik magst du?'],
  ['הבנתי. למה אתה לומד עברית?', 'Verstehe. Warum lernst du Hebräisch?'],
]);
