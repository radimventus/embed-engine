import { useRef, type PointerEvent as ReactPointerEvent } from 'react';

const SWIPE_MIN_DISTANCE_PX = 48;

type MediaSwipeOptions = {
  readonly enabled: boolean;
  readonly itemCount: number;
  readonly activeIndex: number;
  readonly onSelectIndex: (index: number) => void;
};

/**
 * Horizontal swipe between Media Timeline items (RCS-04).
 * Uses Walkthrough selectMediaIndex — no Runtime / Decision changes.
 */
export function useMediaSwipeNavigation({
  enabled,
  itemCount,
  activeIndex,
  onSelectIndex,
}: MediaSwipeOptions) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!enabled || itemCount < 2) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    startRef.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const start = startRef.current;
    startRef.current = null;
    if (!enabled || start === null || itemCount < 2) {
      return;
    }

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_DISTANCE_PX || Math.abs(dx) <= Math.abs(dy)) {
      return;
    }

    if (dx < 0 && activeIndex < itemCount - 1) {
      onSelectIndex(activeIndex + 1);
      return;
    }
    if (dx > 0 && activeIndex > 0) {
      onSelectIndex(activeIndex - 1);
    }
  };

  const onPointerCancel = () => {
    startRef.current = null;
  };

  return {
    onPointerDown,
    onPointerUp,
    onPointerCancel,
  };
}
