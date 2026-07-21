/**
 * Demo-facing barrel so Vite can import engine + mock + renderer from one path.
 * Not a public package API surface beyond the demo.
 */

export {
  createPriorityRuntimeEngine,
  type PriorityEngineEvent,
  type PriorityRuntimeEngine,
} from "../../src/priority";
export {
  createGardenEngineEvents,
  createGardenJourneyRun,
} from "../../src/priority/mock";
export {
  renderPriorityJourney,
  type PriorityRenderModel,
} from "../../src/priority/html-renderer";
