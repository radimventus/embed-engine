import { useCallback, useRef } from 'react';

import {
  THUMBNAIL_SLOT_COUNT,
  useActiveThumbnailScroll,
  useHorizontalWheelScroll,
  useThumbnailRailNavigation,
} from '../../../walkthrough/useThumbnailRailScroll';
import { useWalkthrough } from '../../../walkthrough';

const EMPTY_SLOT_CLASS =
  'aspect-video rounded-lg border border-embed-neutral-100 bg-embed-neutral-50/60';

const THUMB_BASE_CLASS =
  'aspect-video shrink-0 overflow-hidden rounded-lg border-2 transition-[border-color] duration-[125ms] ease-out';

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-embed-brand-navy/80">
      {direction === 'left' ? (
        <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
      ) : (
        <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z" />
      )}
    </svg>
  );
}

export function ThumbnailRail() {
  const { activeRoomId, roomMediaItems, activeMediaIndex, isMediaActive, selectMediaIndex } =
    useWalkthrough();
  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef(new Map<number, HTMLButtonElement>());

  useHorizontalWheelScroll(scrollRef);
  useActiveThumbnailScroll(scrollRef, thumbRefs, activeMediaIndex, roomMediaItems.length);
  const { canScrollLeft, canScrollRight, scrollGroup } = useThumbnailRailNavigation(
    scrollRef,
    roomMediaItems.length,
  );

  const setThumbRef = useCallback((mediaIndex: number) => {
    return (element: HTMLButtonElement | null) => {
      if (element === null) {
        thumbRefs.current.delete(mediaIndex);
        return;
      }

      thumbRefs.current.set(mediaIndex, element);
    };
  }, []);

  if (activeRoomId === null) {
    return (
      <div className="grid min-w-0 shrink-0 grid-cols-4 items-stretch gap-section">
        {Array.from({ length: THUMBNAIL_SLOT_COUNT }, (_, index) => (
          <div key={index} className={EMPTY_SLOT_CLASS} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative min-w-0 shrink-0">
      {canScrollLeft ? (
        <button
          type="button"
          aria-label="Předchozí náhledy"
          className="absolute -left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-embed-neutral-200/80 bg-embed-white/75 shadow-sm backdrop-blur-[1px] transition-opacity duration-[125ms] ease-out hover:bg-embed-white/90"
          onClick={() => scrollGroup(-1)}
        >
          <ChevronIcon direction="left" />
        </button>
      ) : null}
      {canScrollRight ? (
        <button
          type="button"
          aria-label="Další náhledy"
          className="absolute -right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-embed-neutral-200/80 bg-embed-white/75 shadow-sm backdrop-blur-[1px] transition-opacity duration-[125ms] ease-out hover:bg-embed-white/90"
          onClick={() => scrollGroup(1)}
        >
          <ChevronIcon direction="right" />
        </button>
      ) : null}
      <div
        aria-hidden="true"
        className="pointer-events-none invisible grid grid-cols-4 gap-section select-none"
      >
        {Array.from({ length: THUMBNAIL_SLOT_COUNT }, (_, index) => (
          <div key={index} className="aspect-video" />
        ))}
      </div>
      <div
        ref={scrollRef}
        aria-label="Náhledy médií"
        className="absolute inset-0 overflow-x-auto overflow-y-hidden overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:thin] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-embed-neutral-300"
        role="region"
      >
        <div className="flex h-full gap-section">
          {roomMediaItems.map((item, mediaIndex) => {
            const active = isMediaActive(mediaIndex);

            return (
              <button
                key={mediaIndex}
                ref={setThumbRef(mediaIndex)}
                type="button"
                aria-label={item.kind === 'video' ? 'Video místnosti' : 'Fotografie'}
                aria-pressed={active}
                className={`${THUMB_BASE_CLASS} h-full ${
                  active
                    ? 'border-embed-brand-navy'
                    : 'border-embed-neutral-200 hover:border-embed-neutral-300'
                }`}
                onClick={() => selectMediaIndex(mediaIndex)}
              >
                {item.kind === 'video' ? (
                  <div className="relative h-full w-full bg-embed-neutral-100">
                    <img src={item.thumbnailSrc} alt="" className="h-full w-full object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-embed-brand-navy/20">
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-5 w-5 fill-embed-brand-navy"
                      >
                        <path d="M8 5.14v13.72L19 12 8 5.14z" />
                      </svg>
                    </span>
                  </div>
                ) : (
                  <img src={item.thumbnailSrc} alt="" className="h-full w-full object-cover" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
