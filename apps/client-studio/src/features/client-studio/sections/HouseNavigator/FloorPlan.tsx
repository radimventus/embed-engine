import { useEffect, useRef, useState } from 'react';

import { useOptionalDecisionAnalytics } from '../../analytics';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { evidenceLog } from '../../runtime/runtimeEvidence';
import { useHouseNavigator } from './useHouseNavigator';
import { floorKey } from './houseNavigatorModel';

import { FloorPlanLightbox } from './FloorPlanLightbox';
import { FloorPlanViewport } from './FloorPlanViewport';
import { FloorPlanZoomControl } from './FloorPlanZoomControl';

/** Hover overlay — gold @ 25%. */
const FLOOR_HOVER_FILL = '#f5b90040';
/** Selected room overlay — gold @ 50%. */
const FLOOR_ACTIVE_FILL = '#f5b9007f';

/** Gap between floor-plan drawing and loupe. */
const LOUPE_BELOW_GAP_PX = 20;

type FloorPlanCanvasProps = {
  interactive: boolean;
  className?: string;
};

/**
 * Floor-plan canvas — Runtime floorplan raster + Runtime hotspot regions only.
 * Legacy SVG overlays are intentionally removed.
 */
function FloorPlanCanvas({ interactive, className }: FloorPlanCanvasProps) {
  const { experience } = useDecisionSessionRuntime();
  const { selectedFloor, isRoomActive, activeRoomId, selectRoom } =
    useHouseNavigator();
  const floorPlan = experience.context.floorPlan;
  const viewBoxWidth = floorPlan.viewBoxWidth;
  const viewBoxHeight = floorPlan.viewBoxHeight;
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);

  const canvasRooms = floorPlan.rooms.filter(
    (room) => room.floorPlanRegion !== null && floorKey(room.floor) === selectedFloor,
  );

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      preserveAspectRatio="xMidYMid meet"
      aria-label={`Půdorys · patro ${selectedFloor}`}
      className={className}
      role="img"
      data-floorplan-src={floorPlan.src}
      data-floor={selectedFloor}
    >
      <image
        key={floorPlan.src}
        href={floorPlan.src}
        width={viewBoxWidth}
        height={viewBoxHeight}
        preserveAspectRatio="xMidYMid meet"
      />
      {canvasRooms.map((room) => {
        const region = room.floorPlanRegion;
        if (region === null) {
          return null;
        }

        const active = activeRoomId !== null && isRoomActive(room.id);
        const hovered = interactive && hoveredRoomId === room.id;
        const fill = active
          ? FLOOR_ACTIVE_FILL
          : hovered
            ? FLOOR_HOVER_FILL
            : 'transparent';
        const interactionProps = interactive
          ? {
              className:
                'cursor-pointer touch-manipulation transition-[fill] duration-125 ease-out',
              onClick: () => selectRoom(room.id),
              onPointerDown: () => selectRoom(room.id),
              onPointerEnter: () => {
                setHoveredRoomId(room.id);
              },
              onPointerLeave: () => {
                setHoveredRoomId(null);
              },
            }
          : {};

        // HP-003: paint + hit-test the room polygon when present. BBox-only
        // rects falsely highlight overlapping axis-aligned bounds (e.g. vestibule
        // covering toilet / bathroom / wardrobe).
        if (region.polygon !== undefined && region.polygon.length >= 3) {
          const points = region.polygon.map(([x, y]) => `${x},${y}`).join(' ');
          return (
            <polygon
              key={room.id}
              points={points}
              data-room={room.id}
              aria-label={room.title}
              fill={fill}
              stroke="none"
              {...interactionProps}
            />
          );
        }

        const { x, y, width, height } = region;
        return (
          <rect
            key={room.id}
            x={x}
            y={y}
            width={width}
            height={height}
            data-room={room.id}
            aria-label={room.title}
            fill={fill}
            stroke="none"
            {...interactionProps}
          />
        );
      })}
    </svg>
  );
}

/**
 * Floor plan display — fills column width, keeps real aspect.
 * Rendered height drives Tour section height.
 */
export function FloorPlan() {
  const { experience } = useDecisionSessionRuntime();
  const analytics = useOptionalDecisionAnalytics();
  const { selectedFloor } = useHouseNavigator();
  const floorPlan = experience.context.floorPlan;
  const { viewBoxWidth, viewBoxHeight } = floorPlan;
  const floorPlanSrc = floorPlan.src;
  const selectedFloorKey = selectedFloor;
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const aspectRatioNumber =
    viewBoxHeight > 0 ? viewBoxWidth / viewBoxHeight : 1;
  const aspectRatio = `${viewBoxWidth} / ${viewBoxHeight}`;

  useEffect(() => {
    const floorPlan = experience.context.floorPlan;
    evidenceLog('5.ComponentEvidence.FloorPlan', {
      src: floorPlan.src,
      viewBoxWidth: floorPlan.viewBoxWidth,
      viewBoxHeight: floorPlan.viewBoxHeight,
      roomCount: floorPlan.rooms.length,
      firstRoom: floorPlan.rooms[0] ?? null,
      lastRoom: floorPlan.rooms[floorPlan.rooms.length - 1] ?? null,
      roomsWithRegions: floorPlan.rooms
        .filter((room) => room.floorPlanRegion !== null)
        .map((room) => room.id),
    });
  }, [experience.context.floorPlan]);

  useEffect(() => {
    const element = rootRef.current;
    if (element === null || typeof IntersectionObserver === 'undefined') {
      return;
    }
    let observed = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (observed) {
          return;
        }
        const visible = entries.some(
          (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.35,
        );
        if (!visible) {
          return;
        }
        observed = true;
        analytics?.experienceEvent({
          experienceEventType: 'floorplan.opened',
          surfaceId: 'walkthrough',
          payload: { floor: experience.context.navigation.currentFloor ?? null },
        });
        observer.disconnect();
      },
      { threshold: [0.35] },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [analytics, experience.context.navigation.currentFloor]);

  return (
    <div ref={rootRef} className="relative flex w-full min-w-0 max-w-none shrink-0 flex-col">
      <FloorPlanViewport
        aspectRatio={aspectRatio}
        resetKey={`${floorPlanSrc}:${selectedFloorKey}`}
      >
        <div
          className="h-full w-full"
          data-floorplan-aspect={aspectRatioNumber.toFixed(4)}
        >
          <FloorPlanCanvas interactive className="block h-full w-full" />
        </div>
      </FloorPlanViewport>
      <div
        className="flex w-full shrink-0 justify-end"
        style={{ marginTop: LOUPE_BELOW_GAP_PX }}
      >
        <FloorPlanZoomControl
          onClick={() => {
            analytics?.experienceEvent({
              experienceEventType: 'floorplan.zoomed',
              surfaceId: 'walkthrough',
              payload: { floor: experience.context.navigation.currentFloor ?? null },
            });
            setIsLightboxOpen(true);
          }}
        />
      </div>
      <FloorPlanLightbox
        aspectRatio={aspectRatioNumber}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      >
        <FloorPlanCanvas interactive={false} className="block h-full w-full" />
      </FloorPlanLightbox>
    </div>
  );
}
