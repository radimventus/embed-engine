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

/**
 * Snapshot owned by Runtime.
 * Empty in M1.1 — filled by later milestones.
 */
export interface RuntimeState {
  readonly loaded: boolean;
}

export type RuntimeListener = (state: RuntimeState) => void;
