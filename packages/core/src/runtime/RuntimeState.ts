/**
 * Opaque Object Package bound to the Runtime.
 * Concrete shapes live in domain packages (e.g. object-house).
 * Core stays domain-agnostic.
 */
export type RuntimeObjectPackage = object;

/**
 * Opaque runtime event.
 * Domain modules define concrete event types later.
 */
export type RuntimeEvent = {
  readonly type: string;
};

export type RuntimeStatus =
  | "idle"
  | "loading"
  | "ready"
  | "destroyed";

/**
 * Single source of truth owned by Runtime.
 * Domain-agnostic. Intentionally minimal.
 */
export interface RuntimeState {
  readonly status: RuntimeStatus;
  readonly objectPackage?: RuntimeObjectPackage;
  readonly version: number;
}

export type RuntimeListener = (state: RuntimeState) => void;

export function createInitialRuntimeState(): RuntimeState {
  return {
    status: "idle",
    version: 0,
  };
}
