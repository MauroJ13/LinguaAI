import { useI18n } from '../../i18n';
import type { ChatMessage, Language, SidebarContent } from '../../types';
import { CloseIcon } from '../Icons/Icons';
import { CorrectionPanel } from './panels/CorrectionPanel';
import { EmptyPanel } from './panels/EmptyPanel';
import { LoadingPanel } from './panels/LoadingPanel';
import { OkPanel } from './panels/OkPanel';
import { TipPanel } from './panels/TipPanel';
import { TranslationPanel } from './panels/TranslationPanel';
import './Sidebar.scss';

interface SidebarProps {
  content: SidebarContent;
  /** Die Nachricht, auf die sich der Inhalt bezieht. */
  message?: ChatMessage;
  targetLanguage: Language;
  live: boolean;
  onClose: () => void;
}

function Panel({ content, message, targetLanguage, live }: Omit<SidebarProps, 'onClose'>) {
  const { t } = useI18n();
  if (content.type === 'empty' || !message) return <EmptyPanel />;

  if (content.type === 'translation') {
    return <TranslationPanel message={message} targetLanguage={targetLanguage} live={live} />;
  }

  if (message.analysisStatus === 'pending' || !message.analysis) {
    return <LoadingPanel icon="💡" label={message.analysisStatus === 'error' ? t('analysisFailed') : t('analyzing')} />;
  }

  const analysis = message.analysis;
  if (analysis.type === 'correction') return <CorrectionPanel content={analysis} rtl={targetLanguage.rtl} />;
  if (analysis.type === 'tip') return <TipPanel content={analysis} rtl={targetLanguage.rtl} />;
  return <OkPanel content={analysis} rtl={targetLanguage.rtl} />;
}

/**
 * Dynamische Lernhilfe. Es gibt immer genau eine Sidebar,
 * deren Inhalt bei jeder Aktion ersetzt wird.
 */
export function Sidebar(props: SidebarProps) {
  const { t } = useI18n();
  const { content, onClose, message } = props;
  const isOpen = content.type !== 'empty';
  const state = message?.analysisStatus ?? '';
  const panelKey = content.type === 'empty' ? 'empty' : `${content.type}-${content.messageId}-${state}`;

  return (
    <>
      <div className={`sidebar-backdrop${isOpen ? ' is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar${isOpen ? ' is-open' : ''}`} aria-label={t('learningAid')} aria-live="polite">
        <div className="sidebar__head">
          <span className="sidebar__eyebrow">{t('learningAid')}</span>
          {isOpen && (
            <button type="button" className="sidebar__close" onClick={onClose} aria-label={t('close')}>
              <CloseIcon size={16} />
            </button>
          )}
        </div>
        <div className="sidebar__body" key={panelKey}>
          <Panel {...props} />
        </div>
      </aside>
    </>
  );
}
