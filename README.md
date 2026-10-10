# LinguaAI

Moderne KI-Sprachlern-Webapp (Abschlussprojekt) – großer Chat, dynamische Lernhilfe-Sidebar,
echte KI-Antworten, Fehlerkorrektur passend zum Niveau und echte Sprachausgabe.

## Starten

```bash
npm install
npm run dev
```

Danach im Browser öffnen: <http://localhost:5173/> (am besten Chrome oder Safari).

## KI – funktioniert ohne Einrichtung

LinguaAI nutzt automatisch **kostenlose KI-Dienste ohne Anmeldung und ohne API-Schlüssel**:
[OVHcloud AI Endpoints](https://endpoints.ai.cloud.ovh.net) (Llama 3.3 70B, Mistral Small, gpt-oss u. a.)
und als Reserve [LLM7.io](https://llm7.io). Anonym erlaubt OVHcloud 2 Anfragen pro Minute **pro Modell** –
LinguaAI verteilt die Anfragen deshalb automatisch auf mehrere Modelle. Ist alles ausgelastet,
antwortet im Notfall der Demo-Modus.

## Stimme – liest jede Antwort automatisch vor

Jede neue KI-Nachricht wird **einmal automatisch vorgelesen** (abschaltbar unter Einstellungen → KI).
Mit 🔁 kann man sie jederzeit erneut hören.

- **Standard:** kostenlose Browser-Stimme (Web Speech API) – ohne Schlüssel, unbegrenzt.
- **Optional, natürlicher Klang:** [ElevenLabs](https://elevenlabs.io). ElevenLabs verlangt immer einen
  Schlüssel – den trägt nur der Entwickler **einmal** ein, die Nutzer sehen nichts davon:
  1. Kostenloses Konto auf <https://elevenlabs.io> (Gratis-Plan: ca. 10'000 Zeichen pro Monat, nur nicht-kommerziell)
  2. Profil → *API Keys* → *Create API Key* – nur die Berechtigung *Text to Speech* geben und ein Zeichen-Limit setzen
  3. `.env.example` kopieren, in `.env` umbenennen, Schlüssel bei `VITE_ELEVENLABS_API_KEY=` einfügen
  4. `npm run dev` neu starten

  Ist das Kontingent aufgebraucht oder die Sprache nicht verfügbar (Latein, Hebräisch),
  liest automatisch die Browser-Stimme vor.

> Hinweis: Ein Schlüssel in einer reinen Frontend-App ist im Browser einsehbar. Deshalb den
> ElevenLabs-Schlüssel nur mit Text-to-Speech-Berechtigung und Zeichen-Limit erstellen.

## Gespeichert im Browser

- Die gewählten Sprachen und das Niveau werden gemerkt → beim nächsten Öffnen geht es **direkt zur Lernsprache**.
- Gespräche werden **pro Sprache** gespeichert (bis zu 30). Gibt es schon Gespräche, kann man wählen:
  **letztes Gespräch fortsetzen**, ein **früheres** öffnen oder ein **neues Gespräch** starten.
  Jederzeit erreichbar über den Button „Gespräche“ oben; ↻ startet direkt ein neues Gespräch,
  „Zum Startbildschirm“ (Einstellungen → Sprachen) zeigt das Onboarding.

## Lingua Translate

Integrierter Übersetzer für alle 20 Sprachen – Button **„Lingua Translate“** oben in der Chat-Ansicht.

- Automatische Spracherkennung, Sprachen tauschen, Kopieren, Vorlesen (Ausgangstext und Übersetzung), Text löschen
- Übersetzt automatisch nach einer kurzen Tipp-Pause oder sofort mit **Strg/⌘ + Enter**
- **Desktop:** schwebendes Fenster über dem Chat – am Kopf verschiebbar (auch mit Pfeiltasten über den Griff),
  minimierbar zu einer verschiebbaren Blase, Positionen werden gemerkt; Esc minimiert
- **Smartphone:** eigene Vollbild-Seite mit Zurück-Button (auch die Zurück-Geste des Handys funktioniert),
  Sprachauswahl als Bottom-Sheet
- Text und Übersetzung bleiben beim Minimieren, Schließen und beim Wechsel zwischen Desktop und Mobile erhalten
- Übersetzt über dieselben kostenlosen KI-Dienste wie der Chat (OVHcloud AI Endpoints, LLM7.io) –
  **ohne API-Schlüssel**, es gibt also kein Geheimnis im Frontend

Code: `src/services/translate/` (Logik), `src/context/TranslateContext.tsx` (Zustand),
`src/components/LinguaTranslate/` (Fenster, Blase, mobile Seite, Sprachauswahl), `src/hooks/useDraggable.ts`.

## Funktionen

- **20 Sprachen**, jede kann als Muttersprache *und* als Lernsprache gewählt werden
  (inkl. 🇻🇦 Latein und 🇮🇱 Hebräisch). Die gesamte Oberfläche erscheint in der Muttersprache,
  Arabisch/Hebräisch von rechts nach links.
- Niveau A1–C2: Die KI schreibt strikt auf dem gewählten Niveau.
- 💡 Jede eigene Nachricht wird automatisch analysiert:
  - ✍️ **Korrektur** bei echten Fehlern (Grammatik, Wortwahl, falscher Wortschatz, falsche Sprache …)
  - 💡 **Merkhilfe**, wenn der Satz korrekt ist, aber nicht zum Niveau passt
  - ✅ **Passt**, wenn alles stimmt
  - Optional öffnet sich die Korrektur automatisch (Einstellungen → KI)
- 🌐 Übersetzung jeder KI-Nachricht in die Muttersprache
- 🔁 Echte Sprachausgabe, neue Antworten werden automatisch einmal vorgelesen:
  - Eine Lehrkraft: **Emma** (weibliche Stimme, Tempo passend zum Niveau)
  - **ElevenLabs** (optional, Schlüssel in `.env`): Stimme „Sarah“
  - **Browser-Stimme** (Standard/Rückfall, Web Speech API)
- 🎤 Spracheingabe in der Lernsprache (Chrome/Safari)
- Dark/Light-Mode, responsive, Mobile-Layout

> Latein: Kaum ein Gerät hat eine lateinische Browser-Stimme – dann wird eine italienische Stimme verwendet
> (klingt wie die Kirchenaussprache).

## Technik

React 18 · TypeScript · Vite · SCSS · React Hooks · OVHcloud AI Endpoints · LLM7.io · Web Speech API · optional ElevenLabs

## Struktur

```text
src/
├── components/        UI-Bausteine (Chat, ChatMessage, MessageActions, Sidebar, Selector-Komponenten, AiSettingsPanel …)
├── context/           AiSettingsContext (automatisches Vorlesen, Auto-Feedback)
├── data/              Sprachen, Niveaus, Stimmen, Demo-Gesprächsskripte
├── hooks/             useChat, useSpeech, useSpeechRecognition, useAutoScroll, useTheme
├── i18n/              Oberflächentexte in allen 20 Sprachen
├── pages/             OnboardingPage, ChatPage
├── services/
│   ├── ai/            Kostenlose KI-Dienste (OVHcloud, LLM7) & Prompts der KI-Lehrkraft
│   ├── speech/        Browser-Stimme & optionale ElevenLabs-Stimme
│   ├── storage.ts     Speicherung von Einstellungen & Gesprächen (localStorage)
│   ├── analyzer/      Regelbasierte Korrektur (Demo-Modus)
│   └── tutorEngine.ts Simulierte Antworten (Demo-Modus)
├── styles/            Design-Tokens & globale Styles
├── types/             TypeScript-Typen
└── utils/             Hilfsfunktionen (Wort-Diff, Formatierung)
```

## Credits / Quellen

- **KI (kostenlos, ohne Schlüssel):** [OVHcloud AI Endpoints](https://endpoints.ai.cloud.ovh.net) und [LLM7.io](https://llm7.io) –
  die Sprachmodelle (Meta Llama 3.3, Mistral, OpenAI gpt-oss, Qwen) werden über diese Dienste bereitgestellt.
- **Natürliche Stimmen (optional):** [ElevenLabs](https://elevenlabs.io) – Stimme „Sarah“
- **Browser-Stimme & Spracheingabe:** Web Speech API des Browsers
- **Schrift:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (SIL Open Font License), über Google Fonts
- **Flaggen:** Unicode-Emoji des Betriebssystems
