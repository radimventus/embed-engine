/**
 * Floor-plan viewport math (RCS-03).
 * Pure helpers — no DOM / Runtime. Desktop SSOT keeps scale 1 when unused.
 */

export const FLOOR_PLAN_MIN_SCALE = 1;
export const FLOOR_PLAN_MAX_SCALE = 4;
export const FLOOR_PLAN_TAP_SLOP_PX = 10;

export type FloorPlanTransform = {
  readonly scale: number;
  readonly x: number;
  readonly y: number;
};

export const FLOOR_PLAN_IDENTITY_TRANSFORM: FloorPlanTransform = {
  scale: 1,
  x: 0,
  y: 0,
};

export function clampFloorPlanScale(scale: number): number {
  return Math.min(
    FLOOR_PLAN_MAX_SCALE,
    Math.max(FLOOR_PLAN_MIN_SCALE, scale),
  );
}

/**
 * Keep the plan covering the viewport — no empty gutters when zoomed.
 */
export function clampFloorPlanPan(
  transform: FloorPlanTransform,
  viewportWidth: number,
  viewportHeight: number,
): FloorPlanTransform {
  const scale = clampFloorPlanScale(transform.scale);
  if (scale <= 1 || viewportWidth <= 0 || viewportHeight <= 0) {
    return { scale: 1, x: 0, y: 0 };
  }

  const maxX = ((scale - 1) * viewportWidth) / 2;
  const maxY = ((scale - 1) * viewportHeight) / 2;
  return {
    scale,
    x: Math.min(maxX, Math.max(-maxX, transform.x)),
    y: Math.min(maxY, Math.max(-maxY, transform.y)),
  };
}

export function distanceBetweenPoints(
  a: { readonly x: number; readonly y: number },
  b: { readonly x: number; readonly y: number },
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function midpointBetweenPoints(
  a: { readonly x: number; readonly y: number },
  b: { readonly x: number; readonly y: number },
): { x: number; y: number } {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

export function isFloorPlanTap(
  start: { readonly x: number; readonly y: number },
  end: { readonly x: number; readonly y: number },
  slopPx: number = FLOOR_PLAN_TAP_SLOP_PX,
): boolean {
  return distanceBetweenPoints(start, end) <= slopPx;
}
