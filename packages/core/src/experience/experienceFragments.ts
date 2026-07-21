import type {
  Experience,
  ExperienceConcern,
  ExperienceConfidence,
  ExperienceEvidence,
} from "./Experience";
import type { ExperienceFragment } from "./ExperienceFragment";
import type { PriorityId } from "./PrioritySelection";

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

function fragment(
  id: string,
  appliesTo: readonly PriorityId[],
  build: () => Partial<Experience>,
): ExperienceFragment {
  return Object.freeze({ id, appliesTo, build });
}

/** Deterministic precedence when multiple mapped priorities are selected. */
export const FRAGMENT_LENS_ORDER: readonly PriorityId[] = Object.freeze([
  "layout",
  "investment",
  "design",
  "energy",
]);

export const LENS_KEY_BY_PRIORITY: Readonly<
  Partial<Record<PriorityId, string>>
> = Object.freeze({
  layout: "family",
  investment: "investment",
  design: "design",
  energy: "sustainability",
});

/**
 * Baseline fragments use empty appliesTo — selected when no mapped priority is active.
 */
export const EXPERIENCE_FRAGMENTS: readonly ExperienceFragment[] = Object.freeze([
  fragment("family.narrative", ["layout"], () =>
    Object.freeze({
      title: "Family living interpretation",
      summary:
        "This object is read through daily living: zones, privacy between rooms, and how the layout supports a household over time.",
      focus: Object.freeze(["layout", "privacy", "flexibility"]),
      recommendations: Object.freeze([
        "Walk the day and night zones in order",
        "Confirm household shape before layout commitment",
      ]),
    }),
  ),
  fragment("family.evidence", ["layout"], () =>
    Object.freeze({
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
    }),
  ),
  fragment("family.concerns", ["layout"], () =>
    Object.freeze({
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
    }),
  ),
  fragment("family.confidence", ["layout"], () =>
    Object.freeze({
      confidence: confidence(
        "high",
        92,
        "The property strongly matches the selected priorities.",
      ),
    }),
  ),

  fragment("investment.narrative", ["investment"], () =>
    Object.freeze({
      title: "Investment interpretation",
      summary:
        "This object is read through holding value: cost of ownership, long-term flexibility, and what preserves resale clarity.",
      focus: Object.freeze(["investment", "operating-costs", "quality"]),
      recommendations: Object.freeze([
        "Compare operating costs against investment thesis",
        "Check which layout choices lock or preserve value",
      ]),
    }),
  ),
  fragment("investment.evidence", ["investment"], () =>
    Object.freeze({
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
    }),
  ),
  fragment("investment.concerns", ["investment"], () =>
    Object.freeze({
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
    }),
  ),
  fragment("investment.confidence", ["investment"], () =>
    Object.freeze({
      confidence: confidence(
        "medium",
        76,
        "Most investment indicators are positive.",
      ),
    }),
  ),

  fragment("design.narrative", ["design"], () =>
    Object.freeze({
      title: "Design interpretation",
      summary:
        "This object is read through material and spatial expression: coherence of design language, quality of finish, and how the plot frames the form.",
      focus: Object.freeze(["design", "quality", "plot"]),
      recommendations: Object.freeze([
        "Review design coherence room by room",
        "Separate aesthetic preference from layout fit",
      ]),
    }),
  ),
  fragment("design.evidence", ["design"], () =>
    Object.freeze({
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
    }),
  ),
  fragment("design.concerns", ["design"], () =>
    Object.freeze({
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
    }),
  ),
  fragment("design.confidence", ["design"], () =>
    Object.freeze({
      confidence: confidence(
        "high",
        88,
        "Architectural quality consistently supports this interpretation.",
      ),
    }),
  ),

  fragment("sustainability.narrative", ["energy"], () =>
    Object.freeze({
      title: "Sustainability interpretation",
      summary:
        "This object is read through energy and upkeep: efficiency, operating load, and how maintenance shapes long-term living cost.",
      focus: Object.freeze(["energy", "operating-costs", "maintenance"]),
      recommendations: Object.freeze([
        "Inspect energy systems before emotional fit",
        "Weigh maintenance load against operating-cost savings",
      ]),
    }),
  ),
  fragment("sustainability.evidence", ["energy"], () =>
    Object.freeze({
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
    }),
  ),
  fragment("sustainability.concerns", ["energy"], () =>
    Object.freeze({
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
    }),
  ),
  fragment("sustainability.confidence", ["energy"], () =>
    Object.freeze({
      confidence: confidence(
        "medium",
        71,
        "Energy features are present but not comprehensive.",
      ),
    }),
  ),

  fragment("baseline.narrative", [], () =>
    Object.freeze({
      title: "Baseline object interpretation",
      summary:
        "Select priorities to open a decision lens. The object stays the same; only the interpretation changes.",
      focus: Object.freeze(["disposition", "layout"]),
      recommendations: Object.freeze([
        "Select at least one priority to open an interpretation",
      ]),
    }),
  ),
  fragment("baseline.evidence", [], () =>
    Object.freeze({
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
    }),
  ),
  fragment("baseline.concerns", [], () =>
    Object.freeze({
      concerns: Object.freeze([
        concern(
          "baseline.open-lens",
          "Interpretation not opened",
          "Concerns appear after a priority selects a decision lens on this object.",
          "low",
        ),
      ]),
    }),
  ),
  fragment("baseline.confidence", [], () =>
    Object.freeze({
      confidence: confidence(
        "low",
        40,
        "No priority lens is active yet; confidence rises after interpretation opens.",
      ),
    }),
  ),
]);

export function resolveActiveLens(
  selected: readonly PriorityId[],
): PriorityId | null {
  const selectedSet = new Set(selected);

  for (const priorityId of FRAGMENT_LENS_ORDER) {
    if (selectedSet.has(priorityId)) {
      return priorityId;
    }
  }

  return null;
}

export function selectExperienceFragments(
  activeLens: PriorityId | null,
): readonly ExperienceFragment[] {
  if (activeLens === null) {
    return EXPERIENCE_FRAGMENTS.filter(
      (entry) => entry.appliesTo.length === 0,
    );
  }

  return EXPERIENCE_FRAGMENTS.filter((entry) =>
    entry.appliesTo.includes(activeLens),
  );
}

export function mergeExperiencePartials(
  parts: readonly Partial<Experience>[],
): Omit<Experience, "id"> {
  let title: string | undefined;
  let summary: string | undefined;
  let focus: readonly string[] | undefined;
  let recommendations: readonly string[] | undefined;
  let evidence: Experience["evidence"] | undefined;
  let concerns: Experience["concerns"] | undefined;
  let confidence: Experience["confidence"] | undefined;

  for (const part of parts) {
    if (part.title !== undefined) title = part.title;
    if (part.summary !== undefined) summary = part.summary;
    if (part.focus !== undefined) focus = part.focus;
    if (part.recommendations !== undefined) {
      recommendations = part.recommendations;
    }
    if (part.evidence !== undefined) evidence = part.evidence;
    if (part.concerns !== undefined) concerns = part.concerns;
    if (part.confidence !== undefined) confidence = part.confidence;
  }

  if (
    title === undefined ||
    summary === undefined ||
    focus === undefined ||
    recommendations === undefined ||
    evidence === undefined ||
    concerns === undefined ||
    confidence === undefined
  ) {
    throw new Error("Experience fragments did not assemble a complete Experience");
  }

  return Object.freeze({
    title,
    summary,
    focus,
    recommendations,
    evidence,
    concerns,
    confidence,
  });
}
