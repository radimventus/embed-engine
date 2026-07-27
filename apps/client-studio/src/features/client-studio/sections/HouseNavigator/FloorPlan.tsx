import { useEffect, useState } from 'react';

import { useWalkthrough } from '../../../walkthrough';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { evidenceLog } from '../../runtime/runtimeEvidence';
import { useHouseNavigator } from './useHouseNavigator';
import { floorKey } from './houseNavigatorModel';

import { FloorPlanLightbox } from './FloorPlanLightbox';
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
  const { selectedFloor, isRoomActive, activeRoomId } = useHouseNavigator();
  const { selectRoom } = useWalkthrough();
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

        const { x, y, width, height } = region;
        const active = activeRoomId !== null && isRoomActive(room.id);
        const hovered = interactive && hoveredRoomId === room.id;

        return (
          <rect
            key={room.id}
            x={x}
            y={y}
            width={width}
            height={height}
            aria-label={room.title}
            fill={
              active
                ? FLOOR_ACTIVE_FILL
                : hovered
                  ? FLOOR_HOVER_FILL
                  : 'transparent'
            }
            stroke="none"
            className={
              interactive
                ? 'cursor-pointer touch-manipulation transition-[fill] duration-125 ease-out'
                : undefined
            }
            onClick={interactive ? () => selectRoom(room.id) : undefined}
            onPointerEnter={
              interactive
                ? () => {
                    setHoveredRoomId(room.id);
                  }
                : undefined
            }
            onPointerLeave={
              interactive
                ? () => {
                    setHoveredRoomId(null);
                  }
                : undefined
            }
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
  const { viewBoxWidth, viewBoxHeight } = experience.context.floorPlan;
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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

  return (
    <div className="relative flex w-full min-w-0 max-w-none shrink-0 flex-col">
      <div
        className="relative w-full min-w-0 max-w-none overflow-hidden rounded-[8px]"
        style={{ aspectRatio }}
        data-floorplan-aspect={aspectRatioNumber.toFixed(4)}
      >
        <FloorPlanCanvas interactive className="block h-full w-full" />
      </div>
      <div
        className="flex w-full shrink-0 justify-end"
        style={{ marginTop: LOUPE_BELOW_GAP_PX }}
      >
        <FloorPlanZoomControl onClick={() => setIsLightboxOpen(true)} />
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
