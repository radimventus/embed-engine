import type { PriorityId } from "./PrioritySelection";

/**
 * Hardcoded interpretation fragment for one Priority lens.
 * Slice 3 — not a rule engine.
 */
export type InterpretationRule = {
  readonly key: string;
  readonly title: string;
  readonly summary: string;
  readonly focus: readonly string[];
  readonly recommendations: readonly string[];
};

const FAMILY_RULE: InterpretationRule = Object.freeze({
  key: "family",
  title: "Family living interpretation",
  summary:
    "This object is read through daily living: zones, privacy between rooms, and how the layout supports a household over time.",
  focus: Object.freeze(["layout", "privacy", "flexibility"]),
  recommendations: Object.freeze([
    "Walk the day and night zones in order",
    "Confirm household shape before layout commitment",
  ]),
});

const INVESTMENT_RULE: InterpretationRule = Object.freeze({
  key: "investment",
  title: "Investment interpretation",
  summary:
    "This object is read through holding value: cost of ownership, long-term flexibility, and what preserves resale clarity.",
  focus: Object.freeze(["investment", "operating-costs", "quality"]),
  recommendations: Object.freeze([
    "Compare operating costs against investment thesis",
    "Check which layout choices lock or preserve value",
  ]),
});

const DESIGN_RULE: InterpretationRule = Object.freeze({
  key: "design",
  title: "Design interpretation",
  summary:
    "This object is read through material and spatial expression: coherence of design language, quality of finish, and how the plot frames the form.",
  focus: Object.freeze(["design", "quality", "plot"]),
  recommendations: Object.freeze([
    "Review design coherence room by room",
    "Separate aesthetic preference from layout fit",
  ]),
});

const SUSTAINABILITY_RULE: InterpretationRule = Object.freeze({
  key: "sustainability",
  title: "Sustainability interpretation",
  summary:
    "This object is read through energy and upkeep: efficiency, operating load, and how maintenance shapes long-term living cost.",
  focus: Object.freeze(["energy", "operating-costs", "maintenance"]),
  recommendations: Object.freeze([
    "Inspect energy systems before emotional fit",
    "Weigh maintenance load against operating-cost savings",
  ]),
});

const DEFAULT_RULE: InterpretationRule = Object.freeze({
  key: "baseline",
  title: "Baseline object interpretation",
  summary:
    "Select priorities to open a decision lens. The object stays the same; only the interpretation changes.",
  focus: Object.freeze(["disposition", "layout"]),
  recommendations: Object.freeze([
    "Select at least one priority to open an interpretation",
  ]),
});

/**
 * Priority → interpretation mapping (hardcoded).
 * Keys reuse existing Priority Engine ids.
 */
const RULES_BY_PRIORITY: Partial<
  Record<PriorityId, InterpretationRule>
> = Object.freeze({
  layout: FAMILY_RULE,
  investment: INVESTMENT_RULE,
  design: DESIGN_RULE,
  energy: SUSTAINABILITY_RULE,
});

/** Deterministic precedence when multiple mapped priorities are selected. */
const RULE_ORDER: readonly PriorityId[] = Object.freeze([
  "layout",
  "investment",
  "design",
  "energy",
]);

/**
 * Resolve one interpretation rule from PrioritySelection.
 * Deterministic; no heuristics.
 */
export function resolveInterpretationRule(
  selected: readonly PriorityId[],
): InterpretationRule {
  const selectedSet = new Set(selected);

  for (const priorityId of RULE_ORDER) {
    if (selectedSet.has(priorityId)) {
      const rule = RULES_BY_PRIORITY[priorityId];
      if (rule !== undefined) {
        return rule;
      }
    }
  }

  for (const priorityId of selected) {
    const rule = RULES_BY_PRIORITY[priorityId];
    if (rule !== undefined) {
      return rule;
    }
  }

  return DEFAULT_RULE;
}
