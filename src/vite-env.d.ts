/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optionaler ElevenLabs-Schlüssel für natürliche Stimmen (siehe .env.example). */
  readonly VITE_ELEVENLABS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
