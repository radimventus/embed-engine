import { useCallback, useEffect, useRef, useState } from 'react';

import {
  SPATIAL_TERMINAL_MEDIA_TERMINAL_WIDTH_PX,
  SPATIAL_TERMINAL_THUMBNAIL_WIDTH_PX,
} from '../../chapter-layout';
import { createFrameScheduler } from '../../foundation/scheduleOnAnimationFrame';
import {
  THUMBNAIL_SLOT_COUNT,
  useHorizontalWheelScroll,
  useThumbnailRailNavigation,
} from '../../../walkthrough/useThumbnailRailScroll';
import { useWalkthrough } from '../../../walkthrough';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { firstPhotoTimelineIndexForRoom, roomIdForTimelineIndex } from '../../runtime/experienceHouseMedia';
import { SPATIAL_TERMINAL_MEDIA_THUMBNAIL_GAP_CLASS } from '../spatial-terminal-layout';

/** Gap between thumbnails inside the visible slot viewport. */
const THUMB_GAP_PX = 16;

/** Side control columns — keeps chevrons outside the visible thumbs (≥44px RCS-04). */
const CHEVRON_COLUMN_PX = 48;

/** Active border only — idle stays borderless (transparent keeps layout stable). */
const THUMB_BORDER_PX = 4;
/** White ring between gold border and thumb body (active); idle keeps transparent padding for stable size. */
const THUMB_INNER_WHITE_PX = 1;
const THUMB_RADIUS_PX = 8;
/** Inner media radius — outer radius minus border (keeps rounded clip under Delivery CSS). */
const THUMB_INNER_RADIUS_PX = Math.max(
  0,
  THUMB_RADIUS_PX - THUMB_BORDER_PX,
);
const THUMB_BORDER_ACTIVE = '#D4AF37';
const THUMB_BORDER_IDLE = 'transparent';
const THUMB_INNER_ACTIVE = '#FFFFFF';
const THUMB_INNER_IDLE = 'transparent';

const MAX_VIEWPORT_WIDTH_PX =
  SPATIAL_TERMINAL_MEDIA_TERMINAL_WIDTH_PX - CHEVRON_COLUMN_PX * 2;

const DESKTOP_FITTED_THUMB_WIDTH_PX = Math.floor(
  (Math.min(
    THUMBNAIL_SLOT_COUNT * SPATIAL_TERMINAL_THUMBNAIL_WIDTH_PX +
      (THUMBNAIL_SLOT_COUNT - 1) * THUMB_GAP_PX,
    MAX_VIEWPORT_WIDTH_PX,
  ) -
    (THUMBNAIL_SLOT_COUNT - 1) * THUMB_GAP_PX) /
    THUMBNAIL_SLOT_COUNT,
);

/** Desktop SSOT — viewport shows exactly four full thumbnails. */
const DESKTOP_VIEWPORT_WIDTH_PX =
  THUMBNAIL_SLOT_COUNT * DESKTOP_FITTED_THUMB_WIDTH_PX +
  (THUMBNAIL_SLOT_COUNT - 1) * THUMB_GAP_PX;

const DESKTOP_SLOT_STEP_PX = DESKTOP_FITTED_THUMB_WIDTH_PX + THUMB_GAP_PX;

/** Below this measured viewport width, show 3 larger thumbs (RCS-04). */
const MOBILE_VIEWPORT_MAX_PX = 767;
const MOBILE_VISIBLE_SLOTS = 3;

/** Same gold as SpatialZoomControl loupe (`#D4AF37`). */
const LOUPE_GOLD = '#D4AF37';

const THUMBNAIL_RAIL_ROW_CLASS = `box-border w-full min-w-0 shrink-0 ${SPATIAL_TERMINAL_MEDIA_THUMBNAIL_GAP_CLASS}`;
const THUMB_BASE_CLASS =
  'box-border h-full shrink-0 overflow-hidden transition-[border-color] duration-[125ms] ease-out touch-manipulation';

type RailLayout = {
  readonly viewportWidth: number;
  readonly thumbWidth: number;
  readonly slotStep: number;
  readonly visibleSlots: number;
};

function resolveRailLayout(viewportWidth: number): RailLayout {
  const width = Math.max(0, Math.floor(viewportWidth));
  if (width <= 0) {
    return {
      viewportWidth: DESKTOP_VIEWPORT_WIDTH_PX,
      thumbWidth: DESKTOP_FITTED_THUMB_WIDTH_PX,
      slotStep: DESKTOP_SLOT_STEP_PX,
      visibleSlots: THUMBNAIL_SLOT_COUNT,
    };
  }

  const mobilePortrait =
    typeof window !== 'undefined' && window.innerWidth <= MOBILE_VIEWPORT_MAX_PX;
  const visibleSlots = mobilePortrait
    ? MOBILE_VISIBLE_SLOTS
    : THUMBNAIL_SLOT_COUNT;
  const thumbWidth = Math.max(
    44,
    Math.floor((width - (visibleSlots - 1) * THUMB_GAP_PX) / visibleSlots),
  );
  return {
    viewportWidth: width,
    thumbWidth,
    slotStep: thumbWidth + THUMB_GAP_PX,
    visibleSlots,
  };
}

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
      className="flex h-11 w-9 shrink-0 cursor-pointer items-center justify-center touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2 desktop:h-20"
      style={{ width: CHEVRON_COLUMN_PX }}
      onClick={onClick}
    >
      <GoldChevronIcon direction={direction} />
    </button>
  );
}

function ChevronSpacer() {
  return (
    <div
      aria-hidden="true"
      className="h-11 w-9 shrink-0 desktop:h-20"
      style={{ width: CHEVRON_COLUMN_PX }}
    />
  );
}

/**
 * Video thumbnail — poster (or light metadata) only; click plays in MainMedia.
 * RCS-06 — avoid eager iframe/video loads across the rail on mobile.
 */
function VideoThumbnailPreview({
  src,
  poster,
}: {
  src: string;
  poster: string;
}) {
  const hasPoster = poster.length > 0;
  const wistia = isWistiaEmbedUrl(src);

  return (
    <div
      className="relative h-full w-full bg-embed-background-tertiary"
      style={{
        borderRadius: THUMB_INNER_RADIUS_PX,
        overflow: 'hidden',
      }}
    >
      {wistia ? (
        <iframe
          src={src}
          title=""
          tabIndex={-1}
          className="pointer-events-none h-full w-full border-0"
          allow="autoplay; fullscreen"
        />
      ) : hasPoster ? (
        <img
          src={poster}
          alt=""
          loading="lazy"
          decoding="async"
          className="pointer-events-none h-full w-full object-cover"
        />
      ) : (
        <video
          src={src}
          muted
          playsInline
          preload="none"
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
  const [layout, setLayout] = useState<RailLayout>(() =>
    resolveRailLayout(DESKTOP_VIEWPORT_WIDTH_PX),
  );

  /** Global Media Timeline — identical for every room; only activeIndex changes. */
  const mediaTimeline = gallery.thumbnails;
  const itemCount = mediaTimeline.length;
  const firstPhotoIndex = mediaTimeline.findIndex((item) => item.kind === 'photo');
  const firstPhotoSlot = firstPhotoIndex >= 0 ? firstPhotoIndex : 0;

  useHorizontalWheelScroll(scrollRef);
  const { canScrollLeft, canScrollRight, scrollGroup, scrollToSlot } =
    useThumbnailRailNavigation(
      scrollRef,
      itemCount,
      layout.slotStep,
      layout.visibleSlots,
    );

  useEffect(() => {
    const node = scrollRef.current;
    if (node === null || typeof ResizeObserver === 'undefined') {
      return;
    }

    const sync = () => {
      const next = resolveRailLayout(node.clientWidth);
      setLayout((previous) =>
        previous.viewportWidth === next.viewportWidth &&
        previous.thumbWidth === next.thumbWidth &&
        previous.slotStep === next.slotStep &&
        previous.visibleSlots === next.visibleSlots
          ? previous
          : next,
      );
    };
    sync();
    const frame = createFrameScheduler(sync);
    const observer = new ResizeObserver(() => {
      frame.schedule();
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      frame.cancel();
    };
  }, [itemCount]);

  /**
   * Slot-aligned rail anchors (always a full visible window — never mid-slot):
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
      scrollToSlot(mediaMode === 'video' ? 0 : firstPhotoSlot);
      return;
    }

    // Room menu / floorplan zone — compute from room, not stale index.
    if (roomChanged && activeRoomId !== null) {
      if (!indexChanged) {
        skipNextIndexScrollRef.current = true;
      }
      if (activeRoomId === 'exterior') {
        scrollToSlot(firstPhotoSlot);
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
    firstPhotoSlot,
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

  const trackWidthPx =
    itemCount * layout.thumbWidth + Math.max(0, itemCount - 1) * THUMB_GAP_PX;

  if (itemCount === 0) {
    return (
      <div
        className={THUMBNAIL_RAIL_ROW_CLASS}
        style={{ maxWidth: SPATIAL_TERMINAL_MEDIA_TERMINAL_WIDTH_PX }}
      >
        <div className="flex w-full items-center justify-center">
          <ChevronSpacer />
          <div
            className="flex h-20 min-w-0 flex-1 items-stretch mobile:h-20"
            style={{ gap: THUMB_GAP_PX }}
          >
            {Array.from({ length: layout.visibleSlots }, (_, index) => (
              <div
                key={index}
                className="min-h-11 flex-1 rounded-[8px] border border-embed-border-default bg-embed-background-tertiary/60"
              />
            ))}
          </div>
          <ChevronSpacer />
        </div>
      </div>
    );
  }

  return (
    <div
      className={THUMBNAIL_RAIL_ROW_CLASS}
      style={{ maxWidth: SPATIAL_TERMINAL_MEDIA_TERMINAL_WIDTH_PX }}
      data-media-rail-slots={layout.visibleSlots}
    >
      <div className="flex w-full items-center justify-center">
        {canScrollLeft ? (
          <RailChevron direction="left" onClick={() => scrollGroup(-1)} />
        ) : (
          <ChevronSpacer />
        )}
        <div
          ref={scrollRef}
          aria-label="Náhledy médií"
          className="h-20 min-w-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain mobile:h-20 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="region"
        >
          <div
            className="flex h-full transition-[width] duration-150 ease-out"
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
                    width: layout.thumbWidth,
                    minWidth: layout.thumbWidth,
                    borderWidth: THUMB_BORDER_PX,
                    borderStyle: 'solid',
                    // Inline beats Delivery `[data-embed-boundary] button { border-radius: 0 }`.
                    borderRadius: THUMB_RADIUS_PX,
                    overflow: 'hidden',
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
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                      style={{
                        borderRadius: THUMB_INNER_RADIUS_PX,
                      }}
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
