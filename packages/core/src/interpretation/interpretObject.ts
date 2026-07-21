import {
  createInterpretation,
  type Interpretation,
} from "./Interpretation";

export type InterpretObjectInput = {
  readonly objectId: string;
  readonly priorityIds: readonly string[];
};

const LENS_ORDER = Object.freeze([
  "layout",
  "investment",
  "design",
  "energy",
] as const);

type LensId = (typeof LENS_ORDER)[number];

const LENS_KEY: Readonly<Record<LensId, string>> = Object.freeze({
  layout: "family",
  investment: "investment",
  design: "design",
  energy: "sustainability",
});

function resolveLens(priorityIds: readonly string[]): LensId | null {
  const selected = new Set(priorityIds);
  for (const lens of LENS_ORDER) {
    if (selected.has(lens)) {
      return lens;
    }
  }
  return null;
}

/**
 * Deterministic machine-readable meaning for one Object + PrioritySelection.
 * No presentation copy. Aligns matchScore with existing Experience confidence scores.
 */
export function interpretObject(input: InterpretObjectInput): Interpretation {
  const lens = resolveLens(input.priorityIds);
  const lensKey = lens === null ? "baseline" : LENS_KEY[lens];

  if (lens === "layout") {
    return createInterpretation({
      id: `interpretation.${input.objectId}.${lensKey}`,
      objectId: input.objectId,
      priorityIds: Object.freeze([...input.priorityIds]),
      strengths: Object.freeze([
        Object.freeze({ id: "s.bedrooms", code: "family.bedrooms", weight: 0.9 }),
        Object.freeze({ id: "s.garden", code: "family.garden", weight: 0.85 }),
        Object.freeze({ id: "s.bathrooms", code: "family.bathrooms", weight: 0.8 }),
      ]),
      frictions: Object.freeze([
        Object.freeze({
          id: "f.upper-floor",
          code: "family.upper-floor",
          weight: 0.45,
        }),
        Object.freeze({ id: "f.storage", code: "family.storage", weight: 0.3 }),
      ]),
      opportunities: Object.freeze([
        Object.freeze({
          id: "o.household",
          code: "family.household-fit",
          weight: 0.75,
        }),
      ]),
      tradeOffs: Object.freeze([
        Object.freeze({
          id: "t.privacy-open",
          code: "family.privacy-vs-openness",
          favors: "privacy",
          against: "open-plan",
        }),
      ]),
      confidenceInputs: Object.freeze([
        Object.freeze({
          id: "c.coverage",
          code: "priority.coverage",
          contribution: 0.92,
        }),
      ]),
      matchScore: 92,
      recommendedIntent: "explore-layout",
    });
  }

  if (lens === "investment") {
    return createInterpretation({
      id: `interpretation.${input.objectId}.${lensKey}`,
      objectId: input.objectId,
      priorityIds: Object.freeze([...input.priorityIds]),
      strengths: Object.freeze([
        Object.freeze({ id: "s.opex", code: "investment.opex", weight: 0.85 }),
        Object.freeze({
          id: "s.rental",
          code: "investment.rental",
          weight: 0.8,
        }),
        Object.freeze({
          id: "s.location",
          code: "investment.location",
          weight: 0.78,
        }),
      ]),
      frictions: Object.freeze([
        Object.freeze({ id: "f.price", code: "investment.price", weight: 0.7 }),
        Object.freeze({ id: "f.roi", code: "investment.roi", weight: 0.55 }),
      ]),
      opportunities: Object.freeze([
        Object.freeze({
          id: "o.yield",
          code: "investment.yield-stability",
          weight: 0.7,
        }),
      ]),
      tradeOffs: Object.freeze([
        Object.freeze({
          id: "t.entry-yield",
          code: "investment.entry-cost-vs-yield",
          favors: "yield",
          against: "entry-price",
        }),
      ]),
      confidenceInputs: Object.freeze([
        Object.freeze({
          id: "c.indicators",
          code: "investment.indicators",
          contribution: 0.76,
        }),
      ]),
      matchScore: 76,
      recommendedIntent: "calculate-roi",
    });
  }

  if (lens === "design") {
    return createInterpretation({
      id: `interpretation.${input.objectId}.${lensKey}`,
      objectId: input.objectId,
      priorityIds: Object.freeze([...input.priorityIds]),
      strengths: Object.freeze([
        Object.freeze({
          id: "s.materials",
          code: "design.materials",
          weight: 0.88,
        }),
        Object.freeze({
          id: "s.open-living",
          code: "design.open-living",
          weight: 0.84,
        }),
        Object.freeze({ id: "s.details", code: "design.details", weight: 0.82 }),
      ]),
      frictions: Object.freeze([
        Object.freeze({ id: "f.storage", code: "design.storage", weight: 0.5 }),
        Object.freeze({ id: "f.glazing", code: "design.glazing", weight: 0.35 }),
      ]),
      opportunities: Object.freeze([
        Object.freeze({
          id: "o.coherence",
          code: "design.coherence",
          weight: 0.8,
        }),
      ]),
      tradeOffs: Object.freeze([
        Object.freeze({
          id: "t.clarity-storage",
          code: "design.clarity-vs-storage",
          favors: "visual-clarity",
          against: "storage",
        }),
      ]),
      confidenceInputs: Object.freeze([
        Object.freeze({
          id: "c.quality",
          code: "design.architectural-quality",
          contribution: 0.88,
        }),
      ]),
      matchScore: 88,
      recommendedIntent: "explore-design",
    });
  }

  if (lens === "energy") {
    return createInterpretation({
      id: `interpretation.${input.objectId}.${lensKey}`,
      objectId: input.objectId,
      priorityIds: Object.freeze([...input.priorityIds]),
      strengths: Object.freeze([
        Object.freeze({
          id: "s.envelope",
          code: "sustainability.envelope",
          weight: 0.8,
        }),
        Object.freeze({
          id: "s.heat-pump",
          code: "sustainability.heat-pump",
          weight: 0.78,
        }),
        Object.freeze({
          id: "s.solar-ready",
          code: "sustainability.solar",
          weight: 0.7,
        }),
      ]),
      frictions: Object.freeze([
        Object.freeze({
          id: "f.solar",
          code: "sustainability.solar-not-included",
          weight: 0.5,
        }),
        Object.freeze({
          id: "f.rainwater",
          code: "sustainability.rainwater",
          weight: 0.3,
        }),
      ]),
      opportunities: Object.freeze([
        Object.freeze({
          id: "o.generation",
          code: "sustainability.future-generation",
          weight: 0.65,
        }),
      ]),
      tradeOffs: Object.freeze([
        Object.freeze({
          id: "t.scope-efficiency",
          code: "sustainability.scope-vs-efficiency",
          favors: "efficiency",
          against: "base-scope",
        }),
      ]),
      confidenceInputs: Object.freeze([
        Object.freeze({
          id: "c.energy",
          code: "sustainability.energy-features",
          contribution: 0.71,
        }),
      ]),
      matchScore: 71,
      recommendedIntent: "review-energy",
    });
  }

  return createInterpretation({
    id: `interpretation.${input.objectId}.baseline`,
    objectId: input.objectId,
    priorityIds: Object.freeze([...input.priorityIds]),
    strengths: Object.freeze([]),
    frictions: Object.freeze([
      Object.freeze({
        id: "f.open-lens",
        code: "baseline.open-lens",
        weight: 0.6,
      }),
    ]),
    opportunities: Object.freeze([
      Object.freeze({
        id: "o.select-priority",
        code: "baseline.select-priority",
        weight: 0.5,
      }),
    ]),
    tradeOffs: Object.freeze([]),
    confidenceInputs: Object.freeze([
      Object.freeze({
        id: "c.inactive",
        code: "baseline.inactive-lens",
        contribution: 0.4,
      }),
    ]),
    matchScore: 40,
    recommendedIntent: "select-priority",
  });
}
