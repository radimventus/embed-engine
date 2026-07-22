import { useState } from 'react';

import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { useHouseNavigator } from './useHouseNavigator';
import { floorKey } from './houseNavigatorModel';

import { FloorPlanLightbox } from './FloorPlanLightbox';
import { FloorPlanZoomControl } from './FloorPlanZoomControl';

type FloorPlanCanvasProps = {
  interactive: boolean;
  className?: string;
  preserveAspectRatio?: string;
};

/**
 * Floor-plan canvas — renders projected `context.floorPlan` only (ED-DA-02 / CSCB-03).
 * Interaction dispatches SelectRoom via House Navigator; no catalog access.
 */
function FloorPlanCanvas({
  interactive,
  className,
  preserveAspectRatio = 'xMaxYMid slice',
}: FloorPlanCanvasProps) {
  const { experience } = useDecisionSessionRuntime();
  const { selectedFloor, selectRoom, isRoomActive, activeRoomId } =
    useHouseNavigator();
  const floorPlan = experience.context.floorPlan;
  const viewBox = floorPlan.viewBox;
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
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      preserveAspectRatio={preserveAspectRatio}
      aria-label={`Půdorys · patro ${selectedFloor}`}
      className={className}
      role="img"
    >
      <image
        href={floorPlan.src}
        width={viewBox}
        height={viewBox}
        preserveAspectRatio={preserveAspectRatio}
      />
      {activeOverlayRoom !== null &&
      activeOverlayRoom.decisionCanvasSrc !== '' ? (
        <image
          key={activeOverlayRoom.id}
          href={activeOverlayRoom.decisionCanvasSrc}
          width={viewBox}
          height={viewBox}
          preserveAspectRatio={preserveAspectRatio}
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
            strokeWidth={active ? 2 : 0}
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <div className="relative -ml-[30px] w-[calc(100%+30px)] min-w-0 max-w-none overflow-hidden mobile:ml-0 mobile:w-full">
      <div className="aspect-square w-full min-w-0 max-w-none">
        <FloorPlanCanvas interactive className="block h-full w-full" />
      </div>
      <FloorPlanZoomControl onClick={() => setIsLightboxOpen(true)} />
      <FloorPlanLightbox isOpen={isLightboxOpen} onClose={() => setIsLightboxOpen(false)}>
        <FloorPlanCanvas
          interactive={false}
          preserveAspectRatio="xMidYMid meet"
          className="block h-full w-full"
        />
      </FloorPlanLightbox>
    </div>
  );
}
