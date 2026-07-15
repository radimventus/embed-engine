import { CircularPlaceholder } from './CircularPlaceholder';
import { HOUSE_PACKAGE, useWalkthrough } from '../../../walkthrough';

const CANVAS_STROKE = {
  active: '#1A3A6C',
  inactive: '#E5E5E5',
} as const;

export function FloorPlan() {
  const { rooms, activeRoom, isRoomActive, selectRoom } = useWalkthrough();
  const viewBox = HOUSE_PACKAGE.floorPlanViewBox;
  const canvasRooms = rooms.filter((room) => room.floorPlanRegion !== null);

  return (
    <div className="relative w-full min-w-0 max-w-full overflow-hidden border border-embed-neutral-200/70 bg-embed-white">
      <div className="absolute bottom-section left-section z-10 opacity-40">
        <CircularPlaceholder />
      </div>
      <div className="mx-auto aspect-square w-full max-w-full min-w-0">
        <svg
          viewBox={`0 0 ${viewBox} ${viewBox}`}
          preserveAspectRatio="xMidYMid meet"
          aria-label="Decision Canvas"
          className="block h-full w-full"
          role="img"
        >
          <image
            href={HOUSE_PACKAGE.floorPlanSrc}
            width={viewBox}
            height={viewBox}
            preserveAspectRatio="xMidYMid meet"
          />
          {activeRoom !== null ? (
            <image
              key={activeRoom.id}
              href={activeRoom.decisionCanvasSrc}
              width={viewBox}
              height={viewBox}
              preserveAspectRatio="xMidYMid meet"
              className="transition-opacity duration-[125ms] ease-out"
            />
          ) : null}
          {canvasRooms.map((room) => {
            const active = isRoomActive(room.id);
            const region = room.floorPlanRegion;

            if (region === null) {
              return null;
            }

            const { x, y, width, height } = region;

            return (
              <rect
                key={room.id}
                x={x}
                y={y}
                width={width}
                height={height}
                aria-label={room.title}
                fill="transparent"
                stroke={active ? CANVAS_STROKE.active : CANVAS_STROKE.inactive}
                strokeWidth={active ? 1.25 : 0.75}
                className="cursor-pointer transition-[stroke] duration-[125ms] ease-out"
                onClick={() => selectRoom(room.id)}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
