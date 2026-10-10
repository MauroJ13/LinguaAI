import { useLinguaTranslate } from '../../context/TranslateContext';
import { MOBILE_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import { TranslateBubble, TranslateWindow } from './TranslateWindow';
import { TranslatePage } from './TranslatePage';
import './LinguaTranslate.scss';

/**
 * Einstiegspunkt von Lingua Translate in der Chat-Ansicht.
 * Desktop: verschiebbares Fenster bzw. minimierte Blase. Smartphone: eigene Vollbild-Seite.
 * Es existiert immer höchstens EINE Instanz – der Zustand kommt aus dem TranslateContext.
 */
export function LinguaTranslate() {
  const { mode } = useLinguaTranslate();
  const mobile = useMediaQuery(MOBILE_QUERY);

  if (mode === 'closed') return null;
  if (mobile) return mode === 'open' ? <TranslatePage /> : null;
  return mode === 'open' ? <TranslateWindow /> : <TranslateBubble />;
}
