import { useCallback, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useI18n } from '../../i18n';
import { MicIcon, SendIcon } from '../Icons/Icons';
import './ChatInput.scss';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  /** BCP-47-Code der Lernsprache für die Spracheingabe. */
  speechLang: string;
  rtl?: boolean;
}

export function ChatInput({ onSend, disabled = false, speechLang, rtl }: ChatInputProps) {
  const { t } = useI18n();
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !disabled;

  const onRecognized = useCallback((text: string) => setValue(text), []);
  const mic = useSpeechRecognition(speechLang, onRecognized);

  // Textfeld wächst mit dem Inhalt
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const submit = () => {
    if (!canSend) return;
    if (mic.listening) mic.stop();
    onSend(value);
    setValue('');
    ref.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      className={`chat-input${mic.listening ? ' is-listening' : ''}`}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <button
        type="button"
        className={`chat-input__mic${mic.listening ? ' is-active' : ''}`}
        disabled={!mic.supported}
        onClick={() => (mic.listening ? mic.stop() : mic.start())}
        title={!mic.supported ? t('micUnsupported') : mic.listening ? t('micStop') : t('micStart')}
        aria-label={mic.listening ? t('micStop') : t('micStart')}
        aria-pressed={mic.listening}
      >
        <MicIcon size={19} />
      </button>
      <textarea
        ref={ref}
        className="chat-input__field"
        rows={1}
        value={value}
        placeholder={mic.listening ? t('listening') : t('placeholder')}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        aria-label={t('placeholder')}
        dir={rtl ? 'rtl' : 'auto'}
        lang={speechLang}
      />
      <button type="submit" className="chat-input__send" disabled={!canSend} aria-label={t('send')}>
        <SendIcon size={20} strokeWidth={2.2} />
      </button>
    </form>
  );
}
