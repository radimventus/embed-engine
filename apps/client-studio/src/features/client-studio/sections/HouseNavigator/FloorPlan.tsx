import { useState } from 'react';

import { HOUSE_PACKAGE, useWalkthrough } from '../../../walkthrough';

import { FloorPlanLightbox } from './FloorPlanLightbox';
import { FloorPlanZoomControl } from './FloorPlanZoomControl';

type FloorPlanCanvasProps = {
  interactive: boolean;
  className?: string;
  preserveAspectRatio?: string;
};

function FloorPlanCanvas({
  interactive,
  className,
  preserveAspectRatio = 'xMaxYMid slice',
}: FloorPlanCanvasProps) {
  const { rooms, activeRoom, selectRoom } = useWalkthrough();
  const viewBox = HOUSE_PACKAGE.floorPlanViewBox;
  const canvasRooms = rooms.filter((room) => room.floorPlanRegion !== null);

  return (
    <svg
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      preserveAspectRatio={preserveAspectRatio}
      aria-label="Decision Canvas"
      className={className}
      role="img"
    >
      <image
        href={HOUSE_PACKAGE.floorPlanSrc}
        width={viewBox}
        height={viewBox}
        preserveAspectRatio={preserveAspectRatio}
      />
      {activeRoom !== null ? (
        <image
          key={activeRoom.id}
          href={activeRoom.decisionCanvasSrc}
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

        return (
          <rect
            key={room.id}
            x={x}
            y={y}
            width={width}
            height={height}
            aria-label={room.title}
            fill="transparent"
            stroke="none"
            className={interactive ? 'cursor-pointer' : undefined}
            onClick={interactive ? () => selectRoom(room.id) : undefined}
          />
        );
      })}
    </svg>
  );
}

export function FloorPlan() {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <div className="relative -ml-[30px] w-[calc(100%+30px)] min-w-0 max-w-none overflow-hidden">
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
