import { useCallback, useEffect, useMemo, useState } from 'react';
import { Chat } from '../../components/Chat/Chat';
import type { ActivePanel } from '../../components/ChatMessage/ChatMessage';
import { ConversationPicker } from '../../components/ConversationPicker/ConversationPicker';
import { LinguaTranslate } from '../../components/LinguaTranslate/LinguaTranslate';
import { useLinguaTranslate } from '../../context/TranslateContext';
import { Header } from '../../components/Header/Header';
import { SettingsModal, type SettingsTab } from '../../components/SettingsModal/SettingsModal';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { Toast } from '../../components/Toast/Toast';
import { useAiSettings } from '../../context/AiSettingsContext';
import { getScript } from '../../data/conversations';
import { getLanguage } from '../../data/languages';
import { getVoice } from '../../data/voices';
import { useChat } from '../../hooks/useChat';
import { useSpeech } from '../../hooks/useSpeech';
import { useI18n } from '../../i18n';
import { PROVIDER_LABEL } from '../../services/ai/client';
import type { Analysis, ChatMessage, Settings, SidebarContent, Theme } from '../../types';
import './ChatPage.scss';

interface ChatPageProps {
  settings: Settings;
  theme: Theme;
  onToggleTheme: () => void;
  onSettingsChange: (settings: Settings) => void;
  onBackToStart: () => void;
}

export function ChatPage({ settings, theme, onToggleTheme, onSettingsChange, onBackToStart }: ChatPageProps) {
  const { t } = useI18n();
  const { ai, aiEnabled } = useAiSettings();
  const translator = useLinguaTranslate();
  const [sidebar, setSidebar] = useState<SidebarContent>({ type: 'empty' });
  const [settingsTab, setSettingsTab] = useState<SettingsTab | null>(null);

  const language = getLanguage(settings.language);
  const voice = getVoice(settings.voice);
  const script = getScript(settings.language);

  // Auto-Feedback: Bei einem Fehler öffnet sich die Korrektur sofort in der Sidebar
  const onAnalysis = useCallback(
    (messageId: string, analysis: Analysis) => {
      if (ai.autoFeedback && analysis.type === 'correction') setSidebar({ type: 'analysis', messageId });
    },
    [ai.autoFeedback],
  );

  const chat = useChat({
    settings,
    aiEnabled,
    t,
    onAnalysis,
  });
  const { messages, isTyping, freshAiId, sendMessage, requestTranslation } = chat;
  const speech = useSpeech();
  const { speak } = speech;

  // Jede neu erzeugte KI-Nachricht wird einmal automatisch vorgelesen
  // (gespeicherte Gespräche beim Öffnen nicht – die sind schon bekannt).
  useEffect(() => {
    if (!freshAiId || !ai.autoSpeak) return;
    const message = messages.find((m) => m.id === freshAiId);
    if (message) void speak(message.id, message.text, settings, { auto: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freshAiId]);

  const clearSidebar = useCallback(() => setSidebar({ type: 'empty' }), []);

  const handleTranslate = useCallback(
    (message: ChatMessage) => {
      setSidebar({ type: 'translation', messageId: message.id });
      void requestTranslation(message);
    },
    [requestTranslation],
  );

  const handleAnalyze = useCallback((message: ChatMessage) => {
    setSidebar({ type: 'analysis', messageId: message.id });
  }, []);

  const handleSpeak = useCallback(
    (message: ChatMessage) => void speech.speak(message.id, message.text, settings),
    [speech, settings],
  );

  const handleApplySettings = (next: Settings) => {
    if (next.language !== settings.language || next.nativeLanguage !== settings.nativeLanguage) {
      clearSidebar();
      speech.stop();
    }
    onSettingsChange(next);
    setSettingsTab(null);
  };

  const handleNewChat = () => {
    clearSidebar();
    speech.stop();
    void chat.startNew();
  };

  const handleOpenConversation = (id: string) => {
    clearSidebar();
    speech.stop();
    if (id === chat.conversationId) chat.hideChooser();
    else chat.openConversation(id);
  };

  const handleShowChats = () => {
    speech.stop();
    chat.showChooser();
  };

  const activeMessage = useMemo(
    () => (sidebar.type === 'empty' ? undefined : messages.find((m) => m.id === sidebar.messageId)),
    [sidebar, messages],
  );
  const activePanel: ActivePanel = sidebar.type === 'empty' ? null : sidebar.type;

  return (
    <div className="chat-page">
      <div className="chat-page__glow" aria-hidden="true" />

      <Header
        language={language}
        level={settings.level}
        theme={theme}
        live={aiEnabled}
        onToggleTheme={onToggleTheme}
        onOpenSettings={(tab) => setSettingsTab(tab ?? 'languages')}
        onNewChat={handleNewChat}
        onShowChats={handleShowChats}
        translateOpen={translator.mode === 'open'}
        onOpenTranslate={translator.open}
      />

      <div className="chat-page__main">
        {chat.choosing ? (
          <ConversationPicker
            language={language}
            conversations={chat.conversations}
            currentId={chat.conversationId}
            onContinue={handleOpenConversation}
            onNew={handleNewChat}
            onDelete={chat.removeConversation}
            onClose={chat.hideChooser}
          />
        ) : (
          <Chat
            messages={messages}
            isTyping={isTyping}
            language={language}
            level={settings.level}
            voice={voice}
            live={aiEnabled}
            providerName={PROVIDER_LABEL}
            suggestions={script.suggestions ?? []}
            speakingId={speech.speakingId}
            activeMessageId={activeMessage?.id ?? null}
            activePanel={activePanel}
            onSend={sendMessage}
            onSpeak={handleSpeak}
            onTranslate={handleTranslate}
            onAnalyze={handleAnalyze}
            onOpenAiSettings={() => setSettingsTab('ai')}
          />
        )}
        <Sidebar
          content={activeMessage ? sidebar : { type: 'empty' }}
          message={activeMessage}
          targetLanguage={language}
          live={aiEnabled}
          onClose={clearSidebar}
        />
      </div>

      {settingsTab && (
        <SettingsModal
          settings={settings}
          initialTab={settingsTab}
          onClose={() => setSettingsTab(null)}
          onApply={handleApplySettings}
          onBackToStart={() => {
            speech.stop();
            onBackToStart();
          }}
        />
      )}

      <LinguaTranslate />

      <Toast message={speech.notice} onClose={speech.clearNotice} />
    </div>
  );
}
