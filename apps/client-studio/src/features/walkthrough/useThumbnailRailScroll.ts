import { useEffect, useState, type RefObject } from 'react';

export const THUMBNAIL_SLOT_COUNT = 4;
export const THUMBNAIL_GAP_PX = 24;

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

export function scrollThumbnailGroup(
  container: HTMLElement,
  direction: -1 | 1,
): void {
  container.scrollLeft += direction * container.clientWidth;
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

export function useThumbnailRailNavigation(
  containerRef: RefObject<HTMLElement | null>,
  itemCount: number,
): {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  scrollGroup: (direction: -1 | 1) => void;
} {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const container = containerRef.current;

    if (container === null) {
      return;
    }

    const update = () => {
      const overflow = container.scrollWidth > container.clientWidth + 1;
      setCanScrollLeft(overflow && container.scrollLeft > 0);
      setCanScrollRight(
        overflow && container.scrollLeft + container.clientWidth < container.scrollWidth - 1,
      );
    };

    update();
    container.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(container);

    return () => {
      container.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [containerRef, itemCount]);

  const scrollGroup = (direction: -1 | 1) => {
    const container = containerRef.current;

    if (container === null) {
      return;
    }

    scrollThumbnailGroup(container, direction);
  };

  return { canScrollLeft, canScrollRight, scrollGroup };
}
