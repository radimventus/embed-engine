import type {
  ExperienceConcern,
  ExperienceConfidence,
  ExperienceEvidence,
} from "./Experience";
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
  readonly concerns: readonly ExperienceConcern[];
  readonly confidence: ExperienceConfidence;
};

function evidence(
  id: string,
  title: string,
  description: string,
): ExperienceEvidence {
  return Object.freeze({ id, title, description });
}

function concern(
  id: string,
  title: string,
  description: string,
  severity: ExperienceConcern["severity"],
): ExperienceConcern {
  return Object.freeze({ id, title, description, severity });
}

function confidence(
  level: ExperienceConfidence["level"],
  score: number,
  explanation: string,
): ExperienceConfidence {
  return Object.freeze({ level, score, explanation });
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
  concerns: Object.freeze([
    concern(
      "family.upper-floor",
      "Children's room on upper floor",
      "Night zone upstairs means stairs in every bedtime and night routine.",
      "medium",
    ),
    concern(
      "family.storage",
      "Smaller storage space",
      "Built-in storage is limited relative to a full family inventory.",
      "low",
    ),
  ]),
  confidence: confidence(
    "high",
    92,
    "The property strongly matches the selected priorities.",
  ),
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
  concerns: Object.freeze([
    concern(
      "investment.price",
      "Higher purchase price",
      "Entry cost sits above the local median and stretches initial capital.",
      "high",
    ),
    concern(
      "investment.roi",
      "Longer ROI",
      "Payback assumes a longer holding period before yield stabilizes.",
      "medium",
    ),
  ]),
  confidence: confidence(
    "medium",
    76,
    "Most investment indicators are positive.",
  ),
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
  concerns: Object.freeze([
    concern(
      "design.storage",
      "Minimal storage",
      "Visual clarity comes with fewer concealed storage surfaces.",
      "medium",
    ),
    concern(
      "design.glazing",
      "Large glazed surfaces require maintenance",
      "Expansive glass needs regular cleaning and seasonal performance checks.",
      "low",
    ),
  ]),
  confidence: confidence(
    "high",
    88,
    "Architectural quality consistently supports this interpretation.",
  ),
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
  concerns: Object.freeze([
    concern(
      "sustainability.solar-not-included",
      "Solar installation not included",
      "Generation capacity is prepared but panels are not part of the base scope.",
      "medium",
    ),
    concern(
      "sustainability.rainwater",
      "Rainwater system optional",
      "Water reuse depends on an optional package rather than a default install.",
      "low",
    ),
  ]),
  confidence: confidence(
    "medium",
    71,
    "Energy features are present but not comprehensive.",
  ),
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
  concerns: Object.freeze([
    concern(
      "baseline.open-lens",
      "Interpretation not opened",
      "Concerns appear after a priority selects a decision lens on this object.",
      "low",
    ),
  ]),
  confidence: confidence(
    "low",
    40,
    "No priority lens is active yet; confidence rises after interpretation opens.",
  ),
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
