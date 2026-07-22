/**
 * Injectable Runtime clock (ED-DA-06).
 *
 * Runtime pipeline consumes only this abstraction — never Date.now() / new Date().
 * Adapters (Client Studio, tests, replay) inject the appropriate clock.
 */

export type RuntimeClock = {
  /** Epoch milliseconds. */
  readonly now: () => number;
};

/** Fixed time — tests, demos, reproducible Decision Sessions. */
export function createFixedClock(epochMs: number): RuntimeClock {
  return Object.freeze({
    now: () => epochMs,
  });
}

/**
 * Host system clock — for application adapters only.
 * Must not be constructed inside pipeline helpers; inject at the façade boundary.
 */
export function createSystemClock(): RuntimeClock {
  return Object.freeze({
    now: () => Date.now(),
  });
}

/**
 * Resolve a timestamp from an explicit `now` override or an injected clock.
 * Fails closed — never falls back to the system clock inside Runtime.
 */
export function resolveRuntimeTimestamp(input: {
  readonly now?: number;
  readonly clock?: RuntimeClock;
  readonly label: string;
}): number {
  if (input.now !== undefined) {
    return input.now;
  }
  if (input.clock !== undefined) {
    return input.clock.now();
  }
  throw new Error(
    `${input.label} requires an injectable clock or explicit now (ED-DA-06).`,
  );
}
