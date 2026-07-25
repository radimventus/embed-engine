/**
 * PT-001 — Priority Selection Pipeline (MVP).
 *
 * Thin façade over Decision Session Runtime.
 * No parallel Decision Engine. No scoring. No AI.
 *
 * Public entry: `@embed-engine/runtime/priority-pipeline`
 * (keeps ED-DA-03: main `@embed-engine/runtime` does not export createDecisionSession).
 */

import type { HousePackage } from "@embed-engine/object-house";

import type { RuntimeClock } from "../clock";
import { createFixedClock } from "../clock";
import {
  createDecisionSessionRuntime,
  type DecisionSessionRuntime,
} from "../pipeline";
import type { PipelineError } from "../pipeline/validateCommand";

export type PriorityId = string;

/** MVP Priority Runtime State — ordered selection only. */
export type PriorityState = {
  readonly selectedPriorities: readonly PriorityId[];
};

/**
 * One user action → one recorded signal (PT-001).
 * Semantic only — never UI gesture names.
 */
export type PriorityPipelineSignal = {
  readonly id: string;
  readonly type: "PrioritySelected" | "PriorityRemoved";
  readonly priorityId: PriorityId;
  readonly at: number;
};

/**
 * MVP Decision Story — Experience truth for the priority lens (PT-001).
 * primary / secondary = order positions; no heuristics.
 */
export type PriorityPipelineDecisionStory = {
  readonly primaryPriority: PriorityId | null;
  readonly secondaryPriority: PriorityId | null;
  readonly selectedPriorities: readonly PriorityId[];
  readonly updatedAt: number;
};

export type PriorityPipelineResult =
  | {
      readonly ok: true;
      readonly story: PriorityPipelineDecisionStory;
      readonly signal: PriorityPipelineSignal | null;
    }
  | {
      readonly ok: false;
      readonly errors: readonly PipelineError[];
    };

export type CreateDecisionSessionOptions = {
  readonly housePackage: HousePackage;
  readonly clock?: RuntimeClock;
  readonly now?: number;
};

function buildStory(
  selectedPriorities: readonly PriorityId[],
  updatedAt: number,
): PriorityPipelineDecisionStory {
  return Object.freeze({
    primaryPriority: selectedPriorities[0] ?? null,
    secondaryPriority: selectedPriorities[1] ?? null,
    selectedPriorities: Object.freeze([...selectedPriorities]),
    updatedAt,
  });
}

/**
 * MVP Decision Session for the Priority → Signal → Story → Experience slice.
 */
export class PriorityDecisionSession {
  private readonly runtime: DecisionSessionRuntime;
  private readonly clock: RuntimeClock;
  private selectedPriorities: PriorityId[] = [];
  private signals: PriorityPipelineSignal[] = [];
  private story: PriorityPipelineDecisionStory;
  private signalSeq = 0;

  constructor(options: CreateDecisionSessionOptions) {
    this.clock = options.clock ?? createFixedClock(options.now ?? 0);
    this.runtime = createDecisionSessionRuntime({
      housePackage: options.housePackage,
      clock: this.clock,
      now: options.now,
    });
    this.story = buildStory([], this.clock.now());
  }

  /** Underlying certified Runtime — Experience reads ExperienceContext from here. */
  getRuntime(): DecisionSessionRuntime {
    return this.runtime;
  }

  getPriorityState(): PriorityState {
    return Object.freeze({
      selectedPriorities: Object.freeze([...this.selectedPriorities]),
    });
  }

  getSignals(): readonly PriorityPipelineSignal[] {
    return Object.freeze([...this.signals]);
  }

  /**
   * Record a semantic signal. Prefer selectPriority / removePriority —
   * those call this automatically (One User Action = One Signal).
   */
  recordSignal(
    signal: Omit<PriorityPipelineSignal, "id" | "at"> & {
      readonly id?: string;
      readonly at?: number;
    },
  ): PriorityPipelineSignal {
    const at = signal.at ?? this.clock.now();
    this.signalSeq += 1;
    const recorded: PriorityPipelineSignal = Object.freeze({
      id: signal.id ?? `priority-signal-${this.signalSeq}`,
      type: signal.type,
      priorityId: signal.priorityId,
      at,
    });
    this.signals = [...this.signals, recorded];
    return recorded;
  }

  selectPriority(priorityId: PriorityId): PriorityPipelineResult {
    if (typeof priorityId !== "string" || priorityId.length === 0) {
      return {
        ok: false,
        errors: [
          {
            code: "HP_INVALID_PRIORITY",
            message: "priorityId must be a non-empty string.",
            path: "priorityId",
          },
        ],
      };
    }

    if (this.selectedPriorities.includes(priorityId)) {
      return { ok: true, story: this.story, signal: null };
    }

    const next = [...this.selectedPriorities, priorityId];
    const result = this.runtime.dispatch({
      type: "ChangePriority",
      priorityIds: next,
    });

    if (!result.ok) {
      return { ok: false, errors: result.errors };
    }

    this.selectedPriorities = next;
    const signal = this.recordSignal({
      type: "PrioritySelected",
      priorityId,
    });
    this.story = this.buildDecisionStory();
    return { ok: true, story: this.story, signal };
  }

  removePriority(priorityId: PriorityId): PriorityPipelineResult {
    if (!this.selectedPriorities.includes(priorityId)) {
      return { ok: true, story: this.story, signal: null };
    }

    const next = this.selectedPriorities.filter((id) => id !== priorityId);
    const signal = this.recordSignal({
      type: "PriorityRemoved",
      priorityId,
    });

    if (next.length === 0) {
      // Certified Runtime rejects empty ChangePriority — local story clears; Runtime keeps last profile.
      this.selectedPriorities = [];
      this.story = buildStory([], this.clock.now());
      return { ok: true, story: this.story, signal };
    }

    const result = this.runtime.dispatch({
      type: "ChangePriority",
      priorityIds: next,
    });

    if (!result.ok) {
      return { ok: false, errors: result.errors };
    }

    this.selectedPriorities = next;
    this.story = this.buildDecisionStory();
    return { ok: true, story: this.story, signal };
  }

  /** Rebuild MVP Decision Story from PriorityState (order = truth). */
  buildDecisionStory(): PriorityPipelineDecisionStory {
    this.story = buildStory(this.selectedPriorities, this.clock.now());
    return this.story;
  }

  getDecisionStory(): PriorityPipelineDecisionStory {
    return this.story;
  }
}

/**
 * PT-001 factory — MVP Decision Session for Priority Selection Pipeline.
 */
export function createDecisionSession(
  options: CreateDecisionSessionOptions,
): PriorityDecisionSession {
  return new PriorityDecisionSession(options);
}

/**
 * Pure projection — UI may derive MVP story from ExperienceContext.priorityIds.
 */
export function projectPriorityPipelineStory(
  selectedPriorities: readonly PriorityId[],
  updatedAt: number,
): PriorityPipelineDecisionStory {
  return buildStory(selectedPriorities, updatedAt);
}
