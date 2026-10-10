import { useEffect } from 'react';
import { CloseIcon } from '../Icons/Icons';
import './Toast.scss';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

/** Kleine, selbst verschwindende Hinweis-Meldung (z. B. zur Sprachausgabe). */
export function Toast({ message, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(id);
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <div className="toast" role="status" aria-live="polite" key={message}>
      <span className="toast__icon" aria-hidden="true">
        🔊
      </span>
      <span className="toast__text">{message}</span>
      <button type="button" className="toast__close" onClick={onClose} aria-label="×">
        <CloseIcon size={14} />
      </button>
    </div>
  );
}
