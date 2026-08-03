import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import {
  clampFloorPlanPan,
  clampFloorPlanScale,
  distanceBetweenPoints,
  FLOOR_PLAN_IDENTITY_TRANSFORM,
  FLOOR_PLAN_MAX_SCALE,
  FLOOR_PLAN_MIN_SCALE,
  isFloorPlanTap,
  midpointBetweenPoints,
  type FloorPlanTransform,
} from './floorPlanViewportMath';

type FloorPlanViewportProps = {
  readonly aspectRatio: string;
  readonly resetKey: string;
  readonly children: ReactNode;
};

type PointerSample = { readonly x: number; readonly y: number };

/**
 * Touch viewport for the floor-plan SVG (RCS-03).
 * Pinch-to-zoom + drag/pan. Tap still reaches hotspot SelectRoom handlers.
 * Desktop at identity transform looks identical to the prior SSOT shell.
 */
export function FloorPlanViewport({
  aspectRatio,
  resetKey,
  children,
}: FloorPlanViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<FloorPlanTransform>(
    FLOOR_PLAN_IDENTITY_TRANSFORM,
  );
  const transformRef = useRef(transform);
  const pointersRef = useRef(new Map<number, PointerSample>());
  const panOriginRef = useRef<{
    pointer: PointerSample;
    transform: FloorPlanTransform;
  } | null>(null);
  const pinchOriginRef = useRef<{
    distance: number;
    midpoint: PointerSample;
    transform: FloorPlanTransform;
  } | null>(null);
  const gestureMovedRef = useRef(false);
  const suppressClickRef = useRef(false);
  const primaryDownRef = useRef<PointerSample | null>(null);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  useEffect(() => {
    setTransform(FLOOR_PLAN_IDENTITY_TRANSFORM);
    pointersRef.current.clear();
    panOriginRef.current = null;
    pinchOriginRef.current = null;
    gestureMovedRef.current = false;
    suppressClickRef.current = false;
    primaryDownRef.current = null;
  }, [resetKey]);

  useEffect(() => {
    const node = viewportRef.current;
    if (node === null) {
      return;
    }
    const onClickCapture = (event: MouseEvent) => {
      if (!suppressClickRef.current) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      suppressClickRef.current = false;
    };
    node.addEventListener('click', onClickCapture, true);
    return () => {
      node.removeEventListener('click', onClickCapture, true);
    };
  }, []);

  const readViewportSize = useCallback(() => {
    const node = viewportRef.current;
    if (node === null) {
      return { width: 0, height: 0 };
    }
    const rect = node.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }, []);

  const commitTransform = useCallback(
    (next: FloorPlanTransform) => {
      const { width, height } = readViewportSize();
      const clamped = clampFloorPlanPan(next, width, height);
      transformRef.current = clamped;
      setTransform(clamped);
    },
    [readViewportSize],
  );

  const syncPointersFromEvent = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
  };

  const beginGestureFromPointers = () => {
    const points = [...pointersRef.current.values()];
    if (points.length >= 2) {
      const [a, b] = points;
      pinchOriginRef.current = {
        distance: Math.max(1, distanceBetweenPoints(a, b)),
        midpoint: midpointBetweenPoints(a, b),
        transform: transformRef.current,
      };
      panOriginRef.current = null;
      return;
    }
    if (points.length === 1) {
      pinchOriginRef.current = null;
      panOriginRef.current = {
        pointer: points[0],
        transform: transformRef.current,
      };
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    syncPointersFromEvent(event);
    if (pointersRef.current.size === 1) {
      primaryDownRef.current = { x: event.clientX, y: event.clientY };
      gestureMovedRef.current = false;
    } else {
      gestureMovedRef.current = true;
    }
    beginGestureFromPointers();
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) {
      return;
    }
    syncPointersFromEvent(event);
    const points = [...pointersRef.current.values()];

    if (points.length >= 2 && pinchOriginRef.current !== null) {
      const [a, b] = points;
      const distance = Math.max(1, distanceBetweenPoints(a, b));
      const origin = pinchOriginRef.current;
      const nextScale = clampFloorPlanScale(
        origin.transform.scale * (distance / origin.distance),
      );
      const scaleRatio = nextScale / origin.transform.scale;
      const mid = midpointBetweenPoints(a, b);
      const midDeltaX = mid.x - origin.midpoint.x;
      const midDeltaY = mid.y - origin.midpoint.y;
      commitTransform({
        scale: nextScale,
        x: origin.transform.x * scaleRatio + midDeltaX,
        y: origin.transform.y * scaleRatio + midDeltaY,
      });
      gestureMovedRef.current = true;
      return;
    }

    if (points.length === 1 && panOriginRef.current !== null) {
      if (transformRef.current.scale <= FLOOR_PLAN_MIN_SCALE) {
        return;
      }
      const point = points[0];
      const origin = panOriginRef.current;
      const dx = point.x - origin.pointer.x;
      const dy = point.y - origin.pointer.y;
      if (!isFloorPlanTap(origin.pointer, point)) {
        gestureMovedRef.current = true;
      }
      commitTransform({
        scale: origin.transform.scale,
        x: origin.transform.x + dx,
        y: origin.transform.y + dy,
      });
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const down = primaryDownRef.current;
    pointersRef.current.delete(event.pointerId);

    if (
      pointersRef.current.size === 0 &&
      gestureMovedRef.current &&
      down !== null &&
      !isFloorPlanTap(down, { x: event.clientX, y: event.clientY })
    ) {
      suppressClickRef.current = true;
    }

    if (pointersRef.current.size === 0) {
      panOriginRef.current = null;
      pinchOriginRef.current = null;
      primaryDownRef.current = null;
      gestureMovedRef.current = false;
      return;
    }

    beginGestureFromPointers();
  };

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    // Touchpads / trackpads on tablet — keep desktop SSOT free of accidental zoom
    // by requiring a modifier on fine pointers only when already zoomed, else allow pinch path.
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = -event.deltaY * 0.01;
      const nextScale = clampFloorPlanScale(transformRef.current.scale + delta);
      commitTransform({
        ...transformRef.current,
        scale: nextScale,
      });
    }
  };

  const zoomed = transform.scale > FLOOR_PLAN_MIN_SCALE + 0.01;

  return (
    <div
      ref={viewportRef}
      className="relative w-full min-w-0 max-w-none overflow-hidden rounded-[8px] touch-none"
      style={{ aspectRatio, touchAction: 'none' }}
      data-floorplan-viewport=""
      data-floorplan-scale={transform.scale.toFixed(2)}
      data-floorplan-zoomed={zoomed ? 'true' : 'false'}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
    >
      <div
        className="h-full w-full origin-center will-change-transform"
        style={{
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
        }}
        data-floorplan-transform=""
      >
        {children}
      </div>
      {zoomed ? (
        <button
          type="button"
          className="absolute bottom-3 left-3 z-10 min-h-11 min-w-11 rounded-[8px] border border-embed-border-default bg-[#FFFFFF]/95 px-3 text-xs font-semibold tracking-wide text-embed-foreground-primary touch-manipulation desktop:min-h-[42px] desktop:min-w-[42px]"
          aria-label="Obnovit měřítko půdorysu"
          data-testid="floorplan-reset-zoom"
          onClick={(event) => {
            event.stopPropagation();
            commitTransform(FLOOR_PLAN_IDENTITY_TRANSFORM);
          }}
        >
          1×
        </button>
      ) : null}
      <span className="sr-only">
        Měřítko půdorysu {Math.round(transform.scale * 100)} procent. Maximum{' '}
        {FLOOR_PLAN_MAX_SCALE * 100} procent.
      </span>
    </div>
  );
}
