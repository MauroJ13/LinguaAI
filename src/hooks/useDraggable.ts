import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type { Point } from '../context/TranslateContext';

interface DraggableOptions {
  /** Gespeicherte Position (null = Standard). */
  position: Point | null;
  /** Standardposition, abhängig von Fenster- und Elementgröße. */
  getDefault: (size: { width: number; height: number }) => Point;
  /** Wird am Ende eines Zugs mit der neuen Position aufgerufen. */
  onCommit: (pos: Point) => void;
  /** Wie viel vom Element mindestens sichtbar bleiben muss (px). Standard: alles. */
  keepVisible?: number;
  /** Abstand zum Fensterrand (px). */
  margin?: number;
}

/** Ab dieser Strecke ist es ein Zug und kein Klick. */
const DRAG_THRESHOLD = 4;

/**
 * Schlanke, eigene Drag-and-drop-Lösung mit Pointer Events (Maus, Touch, Stift):
 *  – bewegt das Element per `transform` (flüssig, ohne Layout-Neuberechnung)
 *  – hält es immer innerhalb des sichtbaren Fensters, auch nach Größenänderungen
 *  – unterscheidet Klick und Zug (`wasDragged`), damit z. B. die Blase beim Ziehen nicht aufgeht
 *  – startet nur über den Griff (`handleProps`), nie aus Eingabefeldern oder Buttons heraus
 */
export function useDraggable<T extends HTMLElement>({
  position,
  getDefault,
  onCommit,
  keepVisible,
  margin = 12,
}: DraggableOptions) {
  const ref = useRef<T | null>(null);
  const [pos, setPos] = useState<Point | null>(position);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ id: number; startX: number; startY: number; origin: Point; moved: boolean } | null>(null);
  const draggedRef = useRef(false);
  const posRef = useRef<Point | null>(pos);
  posRef.current = pos;

  const clamp = useCallback(
    (p: Point): Point => {
      const el = ref.current;
      const w = el?.offsetWidth ?? 0;
      const h = el?.offsetHeight ?? 0;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const visW = keepVisible ? Math.min(keepVisible, w) : w;
      const visH = keepVisible ? Math.min(keepVisible, h) : h;
      const minX = keepVisible ? visW - w + margin : margin;
      const maxX = vw - visW - margin;
      const maxY = vh - visH - margin;
      return {
        x: Math.round(Math.min(Math.max(p.x, minX), Math.max(minX, maxX))),
        y: Math.round(Math.min(Math.max(p.y, margin), Math.max(margin, maxY))),
      };
    },
    [keepVisible, margin],
  );

  // Erste Platzierung (nach dem Messen) und bei Größenänderung des Browserfensters erneut einpassen
  useEffect(() => {
    const place = () => {
      const el = ref.current;
      if (!el) return;
      const base = posRef.current ?? getDefault({ width: el.offsetWidth, height: el.offsetHeight });
      setPos(clamp(base));
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
    // getDefault absichtlich nicht als Abhängigkeit (wird inline übergeben)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clamp]);

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0 || !posRef.current) return;
    // Nie aus Bedienelementen heraus ziehen
    if ((e.target as HTMLElement).closest('button:not([data-drag-handle]), input, textarea, select, a, [data-no-drag]')) {
      return;
    }
    drag.current = { id: e.pointerId, startX: e.clientX, startY: e.clientY, origin: posRef.current, moved: false };
    draggedRef.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!d.moved) {
      d.moved = true;
      setDragging(true);
    }
    e.preventDefault();
    setPos(clamp({ x: d.origin.x + dx, y: d.origin.y + dy }));
  };

  const end = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (d.moved) {
      draggedRef.current = true;
      setDragging(false);
      if (posRef.current) onCommit(posRef.current);
    }
  };

  /** Mit den Pfeiltasten verschieben (Barrierefreiheit). */
  const onKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
    const step = e.shiftKey ? 48 : 16;
    const delta: Record<string, Point> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    const d = delta[e.key];
    if (!d || !posRef.current) return;
    e.preventDefault();
    const next = clamp({ x: posRef.current.x + d.x, y: posRef.current.y + d.y });
    setPos(next);
    onCommit(next);
  };

  /** true, wenn der letzte Pointer-Vorgang ein Zug war (dann den Klick ignorieren). */
  const wasDragged = () => {
    const v = draggedRef.current;
    draggedRef.current = false;
    return v;
  };

  return {
    ref,
    dragging,
    style: pos
      ? { transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }
      : { transform: 'translate3d(-9999px, -9999px, 0)', visibility: 'hidden' as const },
    handleProps: { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end },
    onKeyDown,
    wasDragged,
  };
}
