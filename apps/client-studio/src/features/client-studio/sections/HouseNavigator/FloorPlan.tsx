import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { useHouseNavigator } from './useHouseNavigator';
import { floorKey } from './houseNavigatorModel';

import { FloorPlanLightbox } from './FloorPlanLightbox';
import { FloorPlanZoomControl } from './FloorPlanZoomControl';

/** Hover overlay — gold @ 25% (PT-TOUR-REDESIGN-01). */
const FLOOR_HOVER_FILL = '#f5b90040';
/** Selected room overlay — gold @ 50%. */
const FLOOR_ACTIVE_FILL = '#f5b9007f';

/** Loupe inset from the floor-plan’s right edge. */
const LOUPE_RIGHT_INSET_PX = 20;

type FloorPlanCanvasProps = {
  interactive: boolean;
  className?: string;
};

/**
 * Floor-plan canvas — renders projected `context.floorPlan` only (ED-DA-02 / CSCB-03).
 * Image + SVG overlays share one viewBox and identical preserveAspectRatio so
 * scale/position stay locked (PT-TOUR-01B / PT-TOUR-REDESIGN-01).
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
 * Floor plan display — expands into column gaps; vertical align A/B;
 * loupe anchored to the plan’s right edge (−20px).
 */
export function FloorPlan() {
  const { experience } = useDecisionSessionRuntime();
  const { viewBoxWidth, viewBoxHeight } = experience.context.floorPlan;
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const displayRef = useRef<HTMLDivElement>(null);
  const planRef = useRef<HTMLDivElement>(null);
  const [align, setAlign] = useState<'end' | 'center'>('center');

  const aspectRatio = `${viewBoxWidth} / ${viewBoxHeight}`;

  useLayoutEffect(() => {
    const display = displayRef.current;
    const plan = planRef.current;
    if (display === null || plan === null) {
      return;
    }

    const measure = () => {
      const displayHeight = display.clientHeight;
      const planHeight = plan.getBoundingClientRect().height;
      // Variant A: plan taller than display → bottom-align with display.
      // Variant B: plan shorter → center on display axis.
      setAlign(planHeight > displayHeight + 0.5 ? 'end' : 'center');
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(display);
    observer.observe(plan);
    return () => observer.disconnect();
  }, [aspectRatio]);

  useEffect(() => {
    // Re-measure after fonts / image decode.
    const id = window.requestAnimationFrame(() => {
      const display = displayRef.current;
      const plan = planRef.current;
      if (display === null || plan === null) {
        return;
      }
      const displayHeight = display.clientHeight;
      const planHeight = plan.getBoundingClientRect().height;
      setAlign(planHeight > displayHeight + 0.5 ? 'end' : 'center');
    });
    return () => window.cancelAnimationFrame(id);
  }, [aspectRatio]);

  return (
    <div
      ref={displayRef}
      className={`relative flex min-h-0 w-full min-w-0 max-w-none overflow-hidden mobile:items-center ${
        align === 'end' ? 'items-end' : 'items-center'
      }`}
    >
      <div
        ref={planRef}
        className="relative w-full min-w-0 max-w-none"
        style={{ aspectRatio }}
      >
        <FloorPlanCanvas interactive className="block h-full w-full" />
        <FloorPlanZoomControl
          className="absolute bottom-3 z-10"
          style={{ right: LOUPE_RIGHT_INSET_PX }}
          onClick={() => setIsLightboxOpen(true)}
        />
      </div>
      <FloorPlanLightbox isOpen={isLightboxOpen} onClose={() => setIsLightboxOpen(false)}>
        <FloorPlanCanvas interactive={false} className="block h-full w-full" />
      </FloorPlanLightbox>
    </div>
  );
}
