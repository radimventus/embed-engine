import { createInitialDecisionState } from "../cognitive/decision-state/createInitialDecisionState";
import { project } from "../cognitive/interpretation/project";
import { reduce } from "../cognitive/reducer/reduce";
import type { Signal } from "../cognitive/signals/Signal";
import type { DecisionStoryComposer } from "../decision-layer/composeDecisionStory";
import { EventDispatcher } from "./EventDispatcher";
import { ModuleRegistry } from "./ModuleRegistry";
import { StateManager } from "./StateManager";
import type {
  RuntimeEvent,
  RuntimeListener,
  RuntimeObjectPackage,
  RuntimeState,
  Unsubscribe,
} from "./RuntimeState";

function resolveObjectId(objectPackage: RuntimeObjectPackage | undefined): string {
  if (
    objectPackage !== undefined &&
    typeof objectPackage === "object" &&
    "objectId" in objectPackage &&
    typeof (objectPackage as { objectId: unknown }).objectId === "string"
  ) {
    return (objectPackage as { objectId: string }).objectId;
  }

  return "default";
}

export type KernelOptions = {
  readonly storyComposer?: DecisionStoryComposer;
};

/**
 * Internal orchestrator owned by Runtime.
 * Coordinates infrastructure, cognitive pipeline, and optional Decision Story composition.
 */
export class Kernel {
  private readonly eventDispatcher = new EventDispatcher();
  private readonly stateManager = new StateManager();
  private readonly moduleRegistry = new ModuleRegistry();
  private readonly storyComposer: DecisionStoryComposer | undefined;

  constructor(options: KernelOptions = {}) {
    this.storyComposer = options.storyComposer;
  }

  getState(): RuntimeState {
    return this.stateManager.getState();
  }

  subscribe(listener: RuntimeListener): Unsubscribe {
    return this.stateManager.subscribe(listener);
  }

  /**
   * idle|ready → loading → ready
   */
  async load(objectPackage: RuntimeObjectPackage): Promise<void> {
    const current = this.stateManager.getState();

    this.stateManager.advance({
      status: "loading",
      objectPackage: current.objectPackage,
    });

    void this.moduleRegistry.getAll();

    const decisionState = createInitialDecisionState(resolveObjectId(objectPackage));
    const interpretation = project(decisionState);

    this.stateManager.advance({
      status: "ready",
      objectPackage,
      decisionState,
      interpretation,
      decisionStory: null,
    });
  }

  async dispatch(event: RuntimeEvent): Promise<void> {
    await this.eventDispatcher.dispatch(event);

    if (event.type === "cognitive.signal" && "signal" in event) {
      this.applySignal((event as { signal: Signal }).signal);
    }
  }

  /**
   * Orchestrates Signal → reduce → DecisionState → project → Interpretation
   * → (optional) Decision Strategy → Decision Story.
   */
  applySignal(signal: Signal): void {
    const current = this.stateManager.getState();
    if (current.status === "destroyed") {
      throw new Error("Runtime has been destroyed");
    }

    const previous =
      current.decisionState ??
      createInitialDecisionState(resolveObjectId(current.objectPackage));
    const decisionState = reduce(previous, signal);
    const interpretation = project(decisionState);

    const decisionStory =
      this.storyComposer !== undefined
        ? this.storyComposer({
            interpretationActiveTopic: interpretation.activeTopic,
            focusQuestionId: decisionState.focus.questionId,
            focusRoomId: decisionState.focus.roomId,
            focusFloorId: decisionState.focus.floorId,
            focusMediaId: decisionState.focus.mediaId,
            signalType: signal.type,
            signalPayload: signal.payload,
            previous: current.decisionStory ?? null,
          })
        : (current.decisionStory ?? null);

    this.stateManager.replaceState({
      status: current.status === "idle" ? "ready" : current.status,
      objectPackage: current.objectPackage,
      version: current.version + 1,
      decisionState,
      interpretation,
      decisionStory,
    });
  }

  /**
   * * → destroyed
   */
  destroy(): void {
    const current = this.stateManager.getState();
    if (current.status === "destroyed") {
      return;
    }

    void this.moduleRegistry.getAll();

    this.stateManager.advance({
      status: "destroyed",
      objectPackage: current.objectPackage,
    });

    this.stateManager.clearListeners();
  }
}
