import { useCallback, useEffect, useState, type RefObject } from 'react';

export const THUMBNAIL_SLOT_COUNT = 4;
export const THUMBNAIL_GAP_PX = 16;

export function scrollThumbnailIntoView(
  container: HTMLElement,
  thumbnail: HTMLElement,
): void {
  const thumbnailStart = thumbnail.offsetLeft;
  const thumbnailEnd = thumbnailStart + thumbnail.offsetWidth;
  const viewportStart = container.scrollLeft;
  const viewportEnd = viewportStart + container.clientWidth;

  if (thumbnailStart < viewportStart) {
    container.scrollLeft = thumbnailStart;
    return;
  }

  if (thumbnailEnd > viewportEnd) {
    container.scrollLeft = thumbnailEnd - container.clientWidth;
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
  useEffect(() => {
    const container = containerRef.current;
    const thumbnail = thumbRefs.current.get(activeMediaIndex);

    if (container === null || thumbnail === undefined) {
      return;
    }

    scrollThumbnailIntoView(container, thumbnail);
  }, [activeMediaIndex, containerRef, itemCount, thumbRefs]);
}

/**
 * Slot-based rail navigation — one step = one thumbnail (+ gap).
 * Max offset keeps a full window of THUMBNAIL_SLOT_COUNT thumbs visible.
 */
export function useThumbnailRailNavigation(
  containerRef: RefObject<HTMLElement | null>,
  itemCount: number,
  slotStepPx: number,
): {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  scrollGroup: (direction: -1 | 1) => void;
  scrollToSlot: (slotIndex: number, behavior?: ScrollBehavior) => void;
} {
  const maxSlotOffset = Math.max(0, itemCount - THUMBNAIL_SLOT_COUNT);
  const [slotOffset, setSlotOffset] = useState(0);

  useEffect(() => {
    setSlotOffset(0);
    const container = containerRef.current;
    if (container !== null) {
      container.scrollLeft = 0;
    }
  }, [containerRef, itemCount]);

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
    (slotIndex: number, behavior: ScrollBehavior = 'smooth') => {
      const container = containerRef.current;
      const next = Math.min(maxSlotOffset, Math.max(0, slotIndex));
      setSlotOffset(next);

      if (container === null) {
        return;
      }

      container.scrollTo({
        left: next * slotStepPx,
        behavior,
      });
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
