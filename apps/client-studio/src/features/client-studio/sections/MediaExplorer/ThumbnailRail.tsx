import { useCallback, useEffect, useRef } from 'react';

import {
  SPATIAL_TERMINAL_MEDIA_TERMINAL_WIDTH_PX,
  SPATIAL_TERMINAL_THUMBNAIL_WIDTH_PX,
} from '../../chapter-layout';
import {
  THUMBNAIL_SLOT_COUNT,
  useActiveThumbnailScroll,
  useHorizontalWheelScroll,
  useThumbnailRailNavigation,
} from '../../../walkthrough/useThumbnailRailScroll';
import { useWalkthrough } from '../../../walkthrough';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { SPATIAL_TERMINAL_MEDIA_THUMBNAIL_GAP_CLASS } from '../spatial-terminal-layout';

/** Gap between thumbnails inside the 4-slot viewport. */
const THUMB_GAP_PX = 16;

/** Side control columns — keeps chevrons outside the 4 visible thumbs. */
const CHEVRON_COLUMN_PX = 48;

const MAX_VIEWPORT_WIDTH_PX =
  SPATIAL_TERMINAL_MEDIA_TERMINAL_WIDTH_PX - CHEVRON_COLUMN_PX * 2;

const IDEAL_VIEWPORT_WIDTH_PX =
  THUMBNAIL_SLOT_COUNT * SPATIAL_TERMINAL_THUMBNAIL_WIDTH_PX +
  (THUMBNAIL_SLOT_COUNT - 1) * THUMB_GAP_PX;

const THUMBNAIL_VIEWPORT_WIDTH_PX = Math.min(IDEAL_VIEWPORT_WIDTH_PX, MAX_VIEWPORT_WIDTH_PX);

const THUMB_WIDTH_PX = Math.floor(
  (THUMBNAIL_VIEWPORT_WIDTH_PX - (THUMBNAIL_SLOT_COUNT - 1) * THUMB_GAP_PX) /
    THUMBNAIL_SLOT_COUNT,
);

const SLOT_STEP_PX = THUMB_WIDTH_PX + THUMB_GAP_PX;

/** Same gold as SpatialZoomControl loupe (`#D4AF37`). */
const LOUPE_GOLD = '#D4AF37';

/** Video is index 0 — FOTKY shifts the rail by one slot so the first photo leads. */
const PHOTO_MODE_SLOT_OFFSET = 1;

const THUMBNAIL_RAIL_ROW_CLASS = `box-border w-full min-w-0 shrink-0 ${SPATIAL_TERMINAL_MEDIA_THUMBNAIL_GAP_CLASS}`;

const THUMB_BASE_CLASS =
  'h-[80px] shrink-0 overflow-hidden rounded-[8px] border-2 transition-[border-color] duration-[125ms] ease-out';

function GoldChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      width={40}
      height={40}
      fill="none"
      stroke={LOUPE_GOLD}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === 'left' ? (
        <path d="M15 6l-6 6 6 6" />
      ) : (
        <path d="M9 6l6 6-6 6" />
      )}
    </svg>
  );
}

type RailChevronProps = {
  direction: 'left' | 'right';
  onClick: () => void;
};

function RailChevron({ direction, onClick }: RailChevronProps) {
  return (
    <button
      type="button"
      aria-label={direction === 'left' ? 'Předchozí náhledy' : 'Další náhledy'}
      className="flex shrink-0 cursor-pointer items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2"
      style={{ width: CHEVRON_COLUMN_PX, height: 80 }}
      onClick={onClick}
    >
      <GoldChevronIcon direction={direction} />
    </button>
  );
}

function ChevronSpacer() {
  return <div aria-hidden="true" className="shrink-0" style={{ width: CHEVRON_COLUMN_PX }} />;
}

export function ThumbnailRail() {
  const { experience } = useDecisionSessionRuntime();
  const gallery = experience.context.roomMedia;
  const {
    activeMediaIndex,
    mediaMode,
    isMediaActive,
    selectMediaIndex,
  } = useWalkthrough();
  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef(new Map<number, HTMLButtonElement>());

  const roomMediaItems = gallery.thumbnails;
  const activeRoomId = gallery.roomId;
  const itemCount = roomMediaItems.length;

  useHorizontalWheelScroll(scrollRef);
  useActiveThumbnailScroll(scrollRef, thumbRefs, activeMediaIndex, itemCount);
  const { canScrollLeft, canScrollRight, scrollGroup, scrollToSlot } = useThumbnailRailNavigation(
    scrollRef,
    itemCount,
    SLOT_STEP_PX,
  );

  /** VIDEO → slot 0 (video first left); FOTKY → shift one slot (video exits left). */
  useEffect(() => {
    if (itemCount === 0) {
      return;
    }

    if (mediaMode === 'video') {
      scrollToSlot(0, 'smooth');
      return;
    }

    scrollToSlot(PHOTO_MODE_SLOT_OFFSET, 'smooth');
  }, [activeRoomId, itemCount, mediaMode, scrollToSlot]);

  const setThumbRef = useCallback((mediaIndex: number) => {
    return (element: HTMLButtonElement | null) => {
      if (element === null) {
        thumbRefs.current.delete(mediaIndex);
        return;
      }

      thumbRefs.current.set(mediaIndex, element);
    };
  }, []);

  if (itemCount === 0) {
    return (
      <div
        className={THUMBNAIL_RAIL_ROW_CLASS}
        style={{ maxWidth: SPATIAL_TERMINAL_MEDIA_TERMINAL_WIDTH_PX }}
      >
        <div className="flex items-center justify-center">
          <ChevronSpacer />
          <div
            className="flex h-[80px] items-stretch"
            style={{ width: THUMBNAIL_VIEWPORT_WIDTH_PX, gap: THUMB_GAP_PX }}
          >
            {Array.from({ length: THUMBNAIL_SLOT_COUNT }, (_, index) => (
              <div
                key={index}
                className="rounded-[8px] border border-embed-border-default bg-embed-background-tertiary/60"
                style={{ width: THUMB_WIDTH_PX, height: 80 }}
              />
            ))}
          </div>
          <ChevronSpacer />
        </div>
      </div>
    );
  }

  const trackWidthPx = itemCount * THUMB_WIDTH_PX + Math.max(0, itemCount - 1) * THUMB_GAP_PX;

  return (
    <div
      className={THUMBNAIL_RAIL_ROW_CLASS}
      style={{ maxWidth: SPATIAL_TERMINAL_MEDIA_TERMINAL_WIDTH_PX }}
    >
      <div className="flex items-center justify-center">
        {canScrollLeft ? (
          <RailChevron direction="left" onClick={() => scrollGroup(-1)} />
        ) : (
          <ChevronSpacer />
        )}
        <div
          ref={scrollRef}
          aria-label="Náhledy médií"
          className="h-[80px] overflow-x-auto overflow-y-hidden overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="region"
          style={{ width: THUMBNAIL_VIEWPORT_WIDTH_PX }}
        >
          <div
            className="flex h-full"
            style={{
              gap: THUMB_GAP_PX,
              width: trackWidthPx,
              minWidth: trackWidthPx,
            }}
          >
            {roomMediaItems.map((item, mediaIndex) => {
              const active = isMediaActive(mediaIndex);

              return (
                <button
                  key={mediaIndex}
                  ref={setThumbRef(mediaIndex)}
                  type="button"
                  aria-label={item.kind === 'video' ? 'Video místnosti' : 'Fotografie'}
                  aria-pressed={active}
                  className={`${THUMB_BASE_CLASS} ${
                    active
                      ? 'border-embed-brand-gold'
                      : 'border-embed-border-default hover:border-embed-brand-gold/50'
                  }`}
                  style={{ width: THUMB_WIDTH_PX, minWidth: THUMB_WIDTH_PX }}
                  onClick={() => selectMediaIndex(mediaIndex)}
                >
                  {item.kind === 'video' ? (
                    <div className="relative h-full w-full bg-embed-background-tertiary">
                      <img src={item.thumbnailSrc} alt="" className="h-full w-full object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center bg-embed-foreground-primary/10">
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          className="h-5 w-5 fill-embed-foreground-primary"
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
        {canScrollRight ? (
          <RailChevron direction="right" onClick={() => scrollGroup(1)} />
        ) : (
          <ChevronSpacer />
        )}
      </div>
    </div>
  );
}
