import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export const THUMBNAIL_SLOT_COUNT = 4;
export const THUMBNAIL_GAP_PX = 16;

/** Apple-like rail motion — ~50% slower than TOUR-14 (TOUR-21). */
export const THUMBNAIL_SCROLL_DURATION_MS = 330;

const scrollAnimationIds = new WeakMap<HTMLElement, number>();

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function animateScrollLeft(
  container: HTMLElement,
  targetLeft: number,
  durationMs: number,
): void {
  const startLeft = container.scrollLeft;
  const delta = targetLeft - startLeft;
  if (Math.abs(delta) < 0.5 || durationMs <= 0) {
    container.scrollLeft = targetLeft;
    return;
  }

  const existing = scrollAnimationIds.get(container);
  if (existing !== undefined) {
    window.cancelAnimationFrame(existing);
  }

  const startTime = performance.now();

  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / durationMs);
    container.scrollLeft = startLeft + delta * easeInOutCubic(progress);
    if (progress < 1) {
      scrollAnimationIds.set(container, window.requestAnimationFrame(step));
      return;
    }
    scrollAnimationIds.delete(container);
  };

  scrollAnimationIds.set(container, window.requestAnimationFrame(step));
}

export function scrollThumbnailIntoView(
  container: HTMLElement,
  thumbnail: HTMLElement,
  durationMs: number = THUMBNAIL_SCROLL_DURATION_MS,
): void {
  const thumbnailStart = thumbnail.offsetLeft;
  const thumbnailEnd = thumbnailStart + thumbnail.offsetWidth;
  const viewportStart = container.scrollLeft;
  const viewportEnd = viewportStart + container.clientWidth;

  if (thumbnailStart < viewportStart) {
    animateScrollLeft(container, thumbnailStart, durationMs);
    return;
  }

  if (thumbnailEnd > viewportEnd) {
    animateScrollLeft(
      container,
      thumbnailEnd - container.clientWidth,
      durationMs,
    );
  }
}

export function useHorizontalWheelScroll(containerRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const container = containerRef.current;

    if (container === null) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      if (container.scrollWidth <= container.clientWidth) {
        return;
      }

      const dominantVertical = Math.abs(event.deltaY) > Math.abs(event.deltaX);

      if (dominantVertical) {
        event.preventDefault();
        container.scrollLeft += event.deltaY;
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, [containerRef]);
}

export function useActiveThumbnailScroll(
  containerRef: RefObject<HTMLElement | null>,
  thumbRefs: RefObject<Map<number, HTMLButtonElement>>,
  activeMediaIndex: number,
  itemCount: number,
): void {
  const previousIndexRef = useRef(activeMediaIndex);

  useEffect(() => {
    const container = containerRef.current;
    const thumbnail = thumbRefs.current.get(activeMediaIndex);

    if (container === null || thumbnail === undefined) {
      return;
    }

    const isInitial = previousIndexRef.current === activeMediaIndex;
    previousIndexRef.current = activeMediaIndex;

    scrollThumbnailIntoView(
      container,
      thumbnail,
      isInitial ? 0 : THUMBNAIL_SCROLL_DURATION_MS,
    );
  }, [activeMediaIndex, containerRef, itemCount, thumbRefs]);
}

/**
 * Slot-based rail navigation — one step = one thumbnail (+ gap).
 * Max offset keeps a full window of visibleSlotCount thumbs visible.
 */
export function useThumbnailRailNavigation(
  containerRef: RefObject<HTMLElement | null>,
  itemCount: number,
  slotStepPx: number,
  visibleSlotCount: number = THUMBNAIL_SLOT_COUNT,
): {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  scrollGroup: (direction: -1 | 1) => void;
  scrollToSlot: (slotIndex: number, behavior?: ScrollBehavior) => void;
} {
  const maxSlotOffset = Math.max(0, itemCount - visibleSlotCount);
  const [slotOffset, setSlotOffset] = useState(0);

  useEffect(() => {
    setSlotOffset(0);
    const container = containerRef.current;
    if (container !== null) {
      container.scrollLeft = 0;
    }
  }, [containerRef, itemCount, visibleSlotCount]);

  useEffect(() => {
    const container = containerRef.current;

    if (container === null || slotStepPx <= 0) {
      return;
    }

    const syncFromScroll = () => {
      const next = Math.round(container.scrollLeft / slotStepPx);
      setSlotOffset(Math.min(maxSlotOffset, Math.max(0, next)));
    };

    container.addEventListener('scroll', syncFromScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', syncFromScroll);
    };
  }, [containerRef, maxSlotOffset, slotStepPx]);

  const scrollToSlot = useCallback(
    (slotIndex: number, _behavior: ScrollBehavior = 'smooth') => {
      const container = containerRef.current;
      const next = Math.min(maxSlotOffset, Math.max(0, slotIndex));
      setSlotOffset(next);

      if (container === null) {
        return;
      }

      animateScrollLeft(container, next * slotStepPx, THUMBNAIL_SCROLL_DURATION_MS);
    },
    [containerRef, maxSlotOffset, slotStepPx],
  );

  const scrollGroup = useCallback(
    (direction: -1 | 1) => {
      scrollToSlot(slotOffset + direction);
    },
    [scrollToSlot, slotOffset],
  );

  return {
    canScrollLeft: slotOffset > 0,
    canScrollRight: slotOffset < maxSlotOffset,
    scrollGroup,
    scrollToSlot,
  };
}
