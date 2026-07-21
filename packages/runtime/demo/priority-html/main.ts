/**
 * Priority HTML demo — wires Runtime Engine + Garden fixture + HTML renderer.
 *
 * All stage transitions go through engine.dispatch(...).
 * Renderer only paints engine.getState().
 */

import {
  createGardenEngineEvents,
  createGardenJourneyRun,
  createPriorityRuntimeEngine,
  renderPriorityJourney,
  type PriorityEngineEvent,
} from "../../src/priority/demo-bridge";

const fixture = createGardenJourneyRun();
const engine = createPriorityRuntimeEngine(fixture.object.objectId);
const gardenEvents = createGardenEngineEvents();

let errorMessage: string | null = null;

function eventByType(
  type: PriorityEngineEvent["type"],
): PriorityEngineEvent | undefined {
  return gardenEvents.find((event) => event.type === type);
}

function dispatch(event: PriorityEngineEvent): void {
  const result = engine.dispatch(event);
  if (!result.ok) {
    errorMessage = `${result.error.code}: ${result.error.message}`;
    return;
  }
  errorMessage = null;
}

function paint(): void {
  const root = document.getElementById("app");
  if (!root) return;

  root.innerHTML = renderPriorityJourney({
    state: engine.getState(),
    fixture,
    errorMessage,
  });
}

function onAction(action: string, targetId: string | null): void {
  switch (action) {
    case "select-garden": {
      const event = eventByType("priority.selection.changed");
      if (event) dispatch(event);
      break;
    }
    case "confirm": {
      const event = eventByType("priority.confirmation.accepted");
      if (event) dispatch(event);
      break;
    }
    case "edit-selection": {
      dispatch({ type: "priority.confirmation.edit" });
      break;
    }
    case "complete-transition": {
      const event = eventByType("priority.transition.completed");
      if (event) dispatch(event);
      break;
    }
    case "ready-interpretation": {
      const event = eventByType("priority.interpretation.ready");
      if (event) dispatch(event);
      break;
    }
    case "ready-mapping": {
      const event = eventByType("priority.mapping.ready");
      if (event) dispatch(event);
      break;
    }
    case "select-followup": {
      if (!targetId) return;
      dispatch({
        type: "priority.followup.selected",
        targetId,
      });
      break;
    }
    case "reset": {
      engine.reset();
      errorMessage = null;
      break;
    }
    default:
      break;
  }

  paint();
}

document.getElementById("app")?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const button = target.closest("[data-action]");
  if (!(button instanceof HTMLElement)) return;

  onAction(
    button.dataset.action ?? "",
    button.dataset.targetId ?? null,
  );
});

paint();
