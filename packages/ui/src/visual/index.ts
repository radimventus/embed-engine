/**
 * Visual API — stable Platform ↔ UI boundary for shared visuals.
 * Non-UI packages must import from `@embed-engine/ui/visual` only
 * (not the React barrel).
 */

export type {
  CreateVisualOptions,
  VisualMetrics,
  VisualName,
} from "./types";
export { appendVisual, createVisual, getVisualMetrics } from "./createVisual";
