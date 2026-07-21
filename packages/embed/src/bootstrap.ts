/**
 * Bootstrap — wires Runtime Engine ↔ HTML Renderer inside a host element.
 * No Journey business logic; only dispatch + paint.
 */

import type { PriorityJourneyRun } from "@embed-engine/core/priority";
import {
  createPriorityRuntimeEngine,
  renderPriorityJourney,
  type PriorityEngineEvent,
} from "@embed-engine/runtime";
import { EMBED_STYLES } from "./styles";

export type EmbedSession = {
  readonly root: HTMLElement;
  readonly host: HTMLElement;
  readonly styleElement: HTMLStyleElement;
  dispose: () => void;
};

function eventByType(
  events: readonly PriorityEngineEvent[],
  type: PriorityEngineEvent["type"],
): PriorityEngineEvent | undefined {
  return events.find((event) => event.type === type);
}

/**
 * Attach Priority Experience into `host`. Returns a disposable session.
 */
export function bootstrapEmbed(
  host: HTMLElement,
  fixture: PriorityJourneyRun,
  engineEvents: readonly PriorityEngineEvent[],
): EmbedSession {
  const styleElement = document.createElement("style");
  styleElement.setAttribute("data-embed-engine", "priority-styles");
  styleElement.textContent = EMBED_STYLES;
  document.head.appendChild(styleElement);

  const root = document.createElement("div");
  root.className = "embed-root";
  root.setAttribute("data-embed-root", "");
  host.appendChild(root);

  const engine = createPriorityRuntimeEngine(fixture.object.objectId);
  let errorMessage: string | null = null;

  const paint = (): void => {
    root.innerHTML = renderPriorityJourney({
      state: engine.getState(),
      fixture,
      errorMessage,
    });
  };

  const dispatch = (event: PriorityEngineEvent): void => {
    const result = engine.dispatch(event);
    if (!result.ok) {
      errorMessage = `${result.error.code}: ${result.error.message}`;
      return;
    }
    errorMessage = null;
  };

  const onAction = (action: string, targetId: string | null): void => {
    switch (action) {
      case "select-garden": {
        const event = eventByType(engineEvents, "priority.selection.changed");
        if (event) dispatch(event);
        break;
      }
      case "confirm": {
        const event = eventByType(
          engineEvents,
          "priority.confirmation.accepted",
        );
        if (event) dispatch(event);
        break;
      }
      case "edit-selection": {
        dispatch({ type: "priority.confirmation.edit" });
        break;
      }
      case "complete-transition": {
        const event = eventByType(
          engineEvents,
          "priority.transition.completed",
        );
        if (event) dispatch(event);
        break;
      }
      case "ready-interpretation": {
        const event = eventByType(
          engineEvents,
          "priority.interpretation.ready",
        );
        if (event) dispatch(event);
        break;
      }
      case "ready-mapping": {
        const event = eventByType(engineEvents, "priority.mapping.ready");
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
  };

  const onClick = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest("[data-action]");
    if (!(button instanceof HTMLElement)) return;

    onAction(button.dataset.action ?? "", button.dataset.targetId ?? null);
  };

  root.addEventListener("click", onClick);
  paint();

  const dispose = (): void => {
    root.removeEventListener("click", onClick);
    root.remove();
    styleElement.remove();
  };

  return { root, host, styleElement, dispose };
}
