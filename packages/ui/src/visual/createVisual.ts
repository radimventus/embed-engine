import { createCloseVisualElement, CLOSE_VISUAL_METRICS } from "./elements/close";
import type {
  CreateVisualOptions,
  VisualMetrics,
  VisualName,
} from "./types";

function assertNever(value: never): never {
  throw new Error(`Unknown visual: ${String(value)}`);
}

/**
 * Returns layout metrics for a registered platform visual.
 */
export function getVisualMetrics(name: VisualName): VisualMetrics {
  switch (name) {
    case "close":
      return CLOSE_VISUAL_METRICS;
    default:
      return assertNever(name);
  }
}

/**
 * Creates a platform visual element.
 * Callers must not depend on the concrete DOM shape beyond being an Element.
 */
export function createVisual(options: CreateVisualOptions): Element {
  switch (options.name) {
    case "close":
      return createCloseVisualElement();
    default:
      return assertNever(options.name);
  }
}

/**
 * Creates a platform visual and appends it to `parent`.
 */
export function appendVisual(
  parent: ParentNode,
  options: CreateVisualOptions,
): Element {
  const el = createVisual(options);
  parent.appendChild(el);
  return el;
}
