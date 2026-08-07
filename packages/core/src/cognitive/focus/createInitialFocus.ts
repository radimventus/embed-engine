import type { Focus } from "./Focus";

/**
 * Creates an empty immutable Focus.
 */
export function createInitialFocus(): Focus {
  return Object.freeze({});
}
