import { useState } from 'react';

import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { useHouseNavigator } from './useHouseNavigator';
import { floorKey } from './houseNavigatorModel';

import { FloorPlanLightbox } from './FloorPlanLightbox';
import { FloorPlanZoomControl } from './FloorPlanZoomControl';

type FloorPlanCanvasProps = {
  interactive: boolean;
  className?: string;
};

/**
 * Floor-plan canvas — renders projected `context.floorPlan` only (ED-DA-02 / CSCB-03).
 * Image + SVG overlays share one viewBox and `xMidYMid meet` so the full plan is
 * visible (no horizontal crop) and overlays stay aligned (PT-TOUR-01B).
 */
function FloorPlanCanvas({ interactive, className }: FloorPlanCanvasProps) {
  const { experience } = useDecisionSessionRuntime();
  const { selectedFloor, selectRoom, isRoomActive, activeRoomId } =
    useHouseNavigator();
  const floorPlan = experience.context.floorPlan;
  const viewBoxWidth = floorPlan.viewBoxWidth;
  const viewBoxHeight = floorPlan.viewBoxHeight;
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);

  const canvasRooms = floorPlan.rooms.filter(
    (room) =>
      room.floorPlanRegion !== null && floorKey(room.floor) === selectedFloor,
  );

  const activeOverlayRoom =
    activeRoomId === null
      ? null
      : (canvasRooms.find((room) => room.id === activeRoomId) ?? null);

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      preserveAspectRatio="xMidYMid meet"
      aria-label={`Půdorys · patro ${selectedFloor}`}
      className={className}
      role="img"
    >
      <image
        href={floorPlan.src}
        width={viewBoxWidth}
        height={viewBoxHeight}
        preserveAspectRatio="xMidYMid meet"
      />
      {activeOverlayRoom !== null &&
      activeOverlayRoom.decisionCanvasSrc !== '' ? (
        <image
          key={activeOverlayRoom.id}
          href={activeOverlayRoom.decisionCanvasSrc}
          width={viewBoxWidth}
          height={viewBoxHeight}
          preserveAspectRatio="xMidYMid meet"
          className="transition-opacity duration-[125ms] ease-out"
        />
      ) : null}
      {canvasRooms.map((room) => {
        const region = room.floorPlanRegion;
        if (region === null) {
          return null;
        }

        const { x, y, width, height } = region;
        const active = isRoomActive(room.id);
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
                ? 'rgba(200, 161, 101, 0.28)'
                : hovered
                  ? 'rgba(0, 25, 48, 0.12)'
                  : 'transparent'
            }
            stroke={active ? 'rgba(200, 161, 101, 0.9)' : 'none'}
            strokeWidth={active ? Math.max(2, viewBoxWidth / 400) : 0}
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

export function FloorPlan() {
  const { experience } = useDecisionSessionRuntime();
  const { viewBoxWidth, viewBoxHeight } = experience.context.floorPlan;
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const aspectRatio = `${viewBoxWidth} / ${viewBoxHeight}`;

  return (
    <div className="relative -ml-[30px] flex w-[calc(100%+30px)] min-w-0 max-w-none items-center justify-center overflow-hidden mobile:ml-0 mobile:w-full">
      <div className="w-full min-w-0 max-w-none" style={{ aspectRatio }}>
        <FloorPlanCanvas
          interactive
          className="block h-full w-full"
        />
      </div>
      <FloorPlanZoomControl onClick={() => setIsLightboxOpen(true)} />
      <FloorPlanLightbox isOpen={isLightboxOpen} onClose={() => setIsLightboxOpen(false)}>
        <FloorPlanCanvas interactive={false} className="block h-full w-full" />
      </FloorPlanLightbox>
    </div>
  );
}
