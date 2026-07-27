import { useCallback, useEffect, useRef } from 'react';

import {
  SPATIAL_TERMINAL_MEDIA_TERMINAL_WIDTH_PX,
  SPATIAL_TERMINAL_THUMBNAIL_WIDTH_PX,
} from '../../chapter-layout';
import {
  THUMBNAIL_SLOT_COUNT,
  useHorizontalWheelScroll,
  useThumbnailRailNavigation,
} from '../../../walkthrough/useThumbnailRailScroll';
import { useWalkthrough } from '../../../walkthrough';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { firstPhotoTimelineIndexForRoom, roomIdForTimelineIndex } from '../../runtime/experienceHouseMedia';
import { SPATIAL_TERMINAL_MEDIA_THUMBNAIL_GAP_CLASS } from '../spatial-terminal-layout';

/** Gap between thumbnails inside the 4-slot viewport. */
const THUMB_GAP_PX = 16;

/** Side control columns — keeps chevrons outside the 4 visible thumbs. */
const CHEVRON_COLUMN_PX = 48;

/** First photo in the global timeline (video is #1). */
const FIRST_PHOTO_SLOT_INDEX = 1;

/** Active border only — idle stays borderless (transparent keeps layout stable). */
const THUMB_BORDER_PX = 4;
/** White ring between gold border and thumb body (active); idle keeps transparent padding for stable size. */
const THUMB_INNER_WHITE_PX = 1;
const THUMB_RADIUS_PX = 8;
const THUMB_BORDER_ACTIVE = '#D4AF37';
const THUMB_BORDER_IDLE = 'transparent';
const THUMB_INNER_ACTIVE = '#FFFFFF';
const THUMB_INNER_IDLE = 'transparent';

const MAX_VIEWPORT_WIDTH_PX =
  SPATIAL_TERMINAL_MEDIA_TERMINAL_WIDTH_PX - CHEVRON_COLUMN_PX * 2;

const FITTED_THUMB_WIDTH_PX = Math.floor(
  (Math.min(
    THUMBNAIL_SLOT_COUNT * SPATIAL_TERMINAL_THUMBNAIL_WIDTH_PX +
      (THUMBNAIL_SLOT_COUNT - 1) * THUMB_GAP_PX,
    MAX_VIEWPORT_WIDTH_PX,
  ) -
    (THUMBNAIL_SLOT_COUNT - 1) * THUMB_GAP_PX) /
    THUMBNAIL_SLOT_COUNT,
);

/** Viewport shows exactly four full thumbnails — no partial fifth. */
const THUMBNAIL_VIEWPORT_WIDTH_PX =
  THUMBNAIL_SLOT_COUNT * FITTED_THUMB_WIDTH_PX +
  (THUMBNAIL_SLOT_COUNT - 1) * THUMB_GAP_PX;

const SLOT_STEP_PX = FITTED_THUMB_WIDTH_PX + THUMB_GAP_PX;

/** Same gold as SpatialZoomControl loupe (`#D4AF37`). */
const LOUPE_GOLD = '#D4AF37';

const THUMBNAIL_RAIL_ROW_CLASS = `box-border w-full min-w-0 shrink-0 ${SPATIAL_TERMINAL_MEDIA_THUMBNAIL_GAP_CLASS}`;
const THUMB_BASE_CLASS =
  'box-border h-[80px] shrink-0 overflow-hidden transition-[border-color] duration-[125ms] ease-out';

function isWistiaEmbedUrl(url: string): boolean {
  return (
    url.includes('fast.wistia.net/embed') || url.includes('wistia.com/embed')
  );
}

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

/**
 * Video thumbnail — real video/iframe with a blocking overlay (no controls).
 * Click is handled by the parent button → plays in the main display.
 */
function VideoThumbnailPreview({
  src,
  poster,
}: {
  src: string;
  poster: string;
}) {
  const wistia = isWistiaEmbedUrl(src);

  return (
    <div className="relative h-full w-full bg-embed-background-tertiary">
      {wistia ? (
        <iframe
          src={src}
          title=""
          tabIndex={-1}
          className="pointer-events-none h-full w-full border-0"
          allow="autoplay; fullscreen"
        />
      ) : (
        <video
          src={src}
          poster={poster}
          muted
          playsInline
          preload="metadata"
          className="pointer-events-none h-full w-full object-cover"
        />
      )}
      <span
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-embed-foreground-primary/10"
      />
    </div>
  );
}

export function ThumbnailRail() {
  const { experience } = useDecisionSessionRuntime();
  const gallery = experience.context.roomMedia;
  const {
    activeMediaIndex,
    activeRoomId,
    isMediaActive,
    mediaMode,
    mediaModeEpoch,
    selectMediaIndex,
  } = useWalkthrough();
  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef(new Map<number, HTMLButtonElement>());
  const previousMediaModeEpochRef = useRef(mediaModeEpoch);
  const previousRoomIdRef = useRef(activeRoomId);
  const previousActiveIndexRef = useRef(activeMediaIndex);
  const skipNextIndexScrollRef = useRef(false);

  /** Global Media Timeline — identical for every room; only activeIndex changes. */
  const mediaTimeline = gallery.thumbnails;
  const itemCount = mediaTimeline.length;

  useHorizontalWheelScroll(scrollRef);
  const { canScrollLeft, canScrollRight, scrollGroup, scrollToSlot } =
    useThumbnailRailNavigation(scrollRef, itemCount, SLOT_STEP_PX);

  /**
   * Slot-aligned rail anchors (always 4 full thumbnails — never mid-slot):
   * - VIDEO / FOTKY toggles → video first / first photo first
   * - Exteriér → first photo first
   * - other rooms / floorplan → room's first photo in second slot
   * - thumb click → active thumb in second slot (video → first)
   */
  useEffect(() => {
    const modeEpochChanged =
      previousMediaModeEpochRef.current !== mediaModeEpoch;
    const roomChanged = previousRoomIdRef.current !== activeRoomId;
    const indexChanged = previousActiveIndexRef.current !== activeMediaIndex;
    previousMediaModeEpochRef.current = mediaModeEpoch;
    previousRoomIdRef.current = activeRoomId;
    previousActiveIndexRef.current = activeMediaIndex;

    if (itemCount === 0) {
      return;
    }

    // VIDEO / FOTKY — highest priority when user toggles the switch.
    if (modeEpochChanged) {
      if (!indexChanged) {
        skipNextIndexScrollRef.current = true;
      }
      scrollToSlot(mediaMode === 'video' ? 0 : FIRST_PHOTO_SLOT_INDEX);
      return;
    }

    // Room menu / floorplan zone — compute from room, not stale index.
    if (roomChanged && activeRoomId !== null) {
      if (!indexChanged) {
        skipNextIndexScrollRef.current = true;
      }
      if (activeRoomId === 'exterior') {
        scrollToSlot(FIRST_PHOTO_SLOT_INDEX);
        return;
      }
      const roomPhotoIndex = firstPhotoTimelineIndexForRoom(
        experience.house,
        activeRoomId,
      );
      const activeBelongsToRoom =
        roomIdForTimelineIndex(experience.house, activeMediaIndex) ===
        activeRoomId;
      const anchorIndex = activeBelongsToRoom
        ? activeMediaIndex
        : (roomPhotoIndex ?? activeMediaIndex);
      scrollToSlot(Math.max(0, anchorIndex - 1));
      return;
    }

    // Direct thumbnail click — keep active in second visible slot.
    if (indexChanged) {
      if (skipNextIndexScrollRef.current) {
        skipNextIndexScrollRef.current = false;
        return;
      }
      scrollToSlot(activeMediaIndex === 0 ? 0 : Math.max(0, activeMediaIndex - 1));
    }
  }, [
    activeMediaIndex,
    activeRoomId,
    experience.house,
    itemCount,
    mediaMode,
    mediaModeEpoch,
    scrollToSlot,
  ]);

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
                style={{ width: FITTED_THUMB_WIDTH_PX, height: 80 }}
              />
            ))}
          </div>
          <ChevronSpacer />
        </div>
      </div>
    );
  }

  const trackWidthPx =
    itemCount * FITTED_THUMB_WIDTH_PX + Math.max(0, itemCount - 1) * THUMB_GAP_PX;

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
            {mediaTimeline.map((item, mediaIndex) => {
              const active = isMediaActive(mediaIndex);

              return (
                <button
                  key={mediaIndex}
                  ref={setThumbRef(mediaIndex)}
                  type="button"
                  aria-label={item.kind === 'video' ? 'Video prohlídky' : 'Fotografie'}
                  aria-pressed={active}
                  className={THUMB_BASE_CLASS}
                  style={{
                    width: FITTED_THUMB_WIDTH_PX,
                    minWidth: FITTED_THUMB_WIDTH_PX,
                    borderWidth: THUMB_BORDER_PX,
                    borderStyle: 'solid',
                    borderRadius: THUMB_RADIUS_PX,
                    borderColor: active ? THUMB_BORDER_ACTIVE : THUMB_BORDER_IDLE,
                    // Padding + fill = white ring; inset box-shadow is covered by <img> and
                    // also reset by Delivery `[data-embed-boundary] button { box-shadow: none }`.
                    padding: THUMB_INNER_WHITE_PX,
                    backgroundColor: active ? THUMB_INNER_ACTIVE : THUMB_INNER_IDLE,
                    boxSizing: 'border-box',
                  }}
                  onClick={() => selectMediaIndex(mediaIndex)}
                >
                  {item.kind === 'video' ? (
                    <VideoThumbnailPreview
                      src={item.src}
                      poster={item.thumbnailSrc}
                    />
                  ) : (
                    <img
                      src={item.thumbnailSrc}
                      alt=""
                      className="h-full w-full object-cover"
                    />
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
