import type { ExperienceEvidence } from "./Experience";
import type { PriorityId } from "./PrioritySelection";

/**
 * Hardcoded interpretation fragment for one Priority lens.
 * Not a rule engine.
 */
export type InterpretationRule = {
  readonly key: string;
  readonly title: string;
  readonly summary: string;
  readonly focus: readonly string[];
  readonly recommendations: readonly string[];
  readonly evidence: readonly ExperienceEvidence[];
};

function evidence(
  id: string,
  title: string,
  description: string,
): ExperienceEvidence {
  return Object.freeze({ id, title, description });
}

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
  evidence: Object.freeze([
    evidence(
      "family.bedrooms",
      "Four bedrooms",
      "Enough private rooms for a growing household without forced sharing.",
    ),
    evidence(
      "family.garden",
      "Safe private garden",
      "Enclosed outdoor space supports children and quiet evening use.",
    ),
    evidence(
      "family.bathrooms",
      "Two bathrooms",
      "Morning routines stay parallel instead of competing for one bath.",
    ),
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
  evidence: Object.freeze([
    evidence(
      "investment.opex",
      "Low operating costs",
      "Efficient systems protect yield against rising utility pressure.",
    ),
    evidence(
      "investment.rental",
      "Strong rental potential",
      "Layout and location support demand from long-stay tenants.",
    ),
    evidence(
      "investment.location",
      "Attractive location",
      "Site context supports liquidity if the holding period ends early.",
    ),
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
  evidence: Object.freeze([
    evidence(
      "design.materials",
      "Premium materials",
      "Finish quality carries the architectural intent through daily use.",
    ),
    evidence(
      "design.open-living",
      "Open living space",
      "Primary living volume reads as one composed spatial gesture.",
    ),
    evidence(
      "design.details",
      "Architectural details",
      "Edges, openings and transitions reinforce a deliberate design language.",
    ),
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
  evidence: Object.freeze([
    evidence(
      "sustainability.envelope",
      "Energy-efficient envelope",
      "Fabric performance reduces heat loss before active systems work harder.",
    ),
    evidence(
      "sustainability.heat-pump",
      "Heat pump",
      "Primary heating path is sized for efficient low-temperature operation.",
    ),
    evidence(
      "sustainability.solar",
      "Solar-ready roof",
      "Roof geometry leaves a clear path for future generation without rework.",
    ),
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
  evidence: Object.freeze([
    evidence(
      "baseline.select",
      "No lens selected yet",
      "Evidence appears once a priority opens an interpretation of this object.",
    ),
    evidence(
      "baseline.object-stable",
      "Object stays fixed",
      "Changing priorities changes interpretation only — never the object itself.",
    ),
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
