import { CircularPlaceholder } from './CircularPlaceholder';
import { HOUSE_PACKAGE, useWalkthrough } from '../../../walkthrough';

export function FloorPlan() {
  const { rooms, activeRoom, isRoomActive, selectRoom } = useWalkthrough();
  const viewBox = HOUSE_PACKAGE.floorPlanViewBox;
  const canvasRooms = rooms.filter((room) => room.floorPlanRegion !== null);

  return (
    <div className="relative mt-section flex aspect-square w-full max-w-full shrink-0 grow-0 items-center justify-center border border-embed-border-default bg-embed-status-warning/15">
      <div className="absolute bottom-section left-section">
        <CircularPlaceholder />
      </div>
      <svg
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        aria-label="Decision Canvas"
        className="h-full w-full"
        role="img"
      >
        <image href={HOUSE_PACKAGE.floorPlanSrc} width={viewBox} height={viewBox} />
        {activeRoom !== null ? (
          <image
            key={activeRoom.id}
            href={activeRoom.decisionCanvasSrc}
            width={viewBox}
            height={viewBox}
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
              className={`cursor-pointer transition-[stroke] duration-[125ms] ease-out ${
                active ? 'stroke-embed-brand-navy' : 'stroke-embed-border-default/60 hover:stroke-embed-border-default'
              }`}
              strokeWidth={active ? 2 : 1}
              onClick={() => selectRoom(room.id)}
            />
          );
        })}
      </svg>
    </div>
  );
}
