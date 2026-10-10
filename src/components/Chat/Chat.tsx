import { useAutoScroll } from '../../hooks/useAutoScroll';
import { useI18n } from '../../i18n';
import type { ChatMessage as ChatMessageType, Language, Level, Voice } from '../../types';
import { ChatInput } from '../ChatInput/ChatInput';
import { ChatMessage, type ActivePanel } from '../ChatMessage/ChatMessage';
import { ArrowDownIcon } from '../Icons/Icons';
import { TypingIndicator } from '../TypingIndicator/TypingIndicator';
import { VoiceAvatar } from '../VoiceAvatar/VoiceAvatar';
import './Chat.scss';

interface ChatProps {
  messages: ChatMessageType[];
  isTyping: boolean;
  language: Language;
  level: Level;
  voice: Voice;
  live: boolean;
  /** Name des KI-Anbieters für die Quellenangabe (Credits). */
  providerName: string;
  suggestions: string[];
  speakingId: string | null;
  activeMessageId: string | null;
  activePanel: ActivePanel;
  onSend: (text: string) => void;
  onSpeak: (message: ChatMessageType) => void;
  onTranslate: (message: ChatMessageType) => void;
  onAnalyze: (message: ChatMessageType) => void;
  onOpenAiSettings: () => void;
}

export function Chat({
  messages,
  isTyping,
  language,
  level,
  voice,
  live,
  providerName,
  suggestions,
  speakingId,
  activeMessageId,
  activePanel,
  onSend,
  onSpeak,
  onTranslate,
  onAnalyze,
  onOpenAiSettings,
}: ChatProps) {
  const { t, languageName } = useI18n();
  const { ref, isAtBottom, scrollToBottom } = useAutoScroll<HTMLDivElement>([messages.length, isTyping]);

  return (
    <section className="chat" aria-label="Chat">
      <div className="chat__scroll" ref={ref}>
        <div className="chat__inner">
          <header className="chat__intro">
            <VoiceAvatar voice={voice} size={64} />
            <h1 className="chat__title">
              {language.flag} {t('chatTitle', { language: languageName(language.code), voice: voice.name })}
            </h1>
            <p className="chat__subtitle">{t('chatSubtitle', { level })}</p>
            <ul className="chat__hints">
              <li>
                <span aria-hidden="true">🔁</span> {t('hintListen')}
              </li>
              <li>
                <span aria-hidden="true">🌐</span> {t('hintTranslate')}
              </li>
              <li>
                <span aria-hidden="true">💡</span> {t('hintFeedback')}
              </li>
            </ul>
            {!live && (
              <button type="button" className="chat__demo-banner" onClick={onOpenAiSettings}>
                <span className="chat__demo-dot" aria-hidden="true" />
                <span>
                  <strong>{t('modeDemo')}</strong> · {t('modeDemoHint')}
                </span>
              </button>
            )}
          </header>

          <div className="chat__messages" role="log" aria-live="polite" aria-relevant="additions">
            {messages.map((m) => (
              <ChatMessage
                key={m.id}
                message={m}
                voice={voice}
                targetRtl={language.rtl}
                isSpeaking={speakingId === m.id}
                activePanel={activeMessageId === m.id ? activePanel : null}
                onSpeak={onSpeak}
                onTranslate={onTranslate}
                onAnalyze={onAnalyze}
              />
            ))}
            {isTyping && <TypingIndicator voice={voice} />}
          </div>
        </div>
      </div>

      <div className="chat__composer">
        {!isAtBottom && (
          <button type="button" className="chat__jump" onClick={() => scrollToBottom()} aria-label="↓">
            <ArrowDownIcon size={16} />
          </button>
        )}

        {suggestions.length > 0 && (
          <div className="chat__suggestions">
            <span className="chat__suggestions-label">{t('tryIt')}</span>
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="suggestion"
                onClick={() => onSend(s)}
                disabled={isTyping}
                title={s}
                dir="auto"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <ChatInput onSend={onSend} disabled={isTyping} speechLang={language.speech[0]} rtl={language.rtl} />
        <p className="chat__footnote">
          <span className={`chat__mode chat__mode--${live ? 'live' : 'demo'}`}>
            <span aria-hidden="true" /> {live ? t('modeLive') : t('modeDemo')}
          </span>
          · {t('credits', { provider: providerName })} · {t('footnoteKeys')}
        </p>
      </div>
    </section>
  );
}
