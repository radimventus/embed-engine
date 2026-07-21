export const LENS_ORDER = Object.freeze([
  "layout",
  "investment",
  "design",
  "energy",
] as const);

export type InterpretationLensId = (typeof LENS_ORDER)[number];

export type ResolvedLens = InterpretationLensId | null;

const LENS_KEY: Readonly<Record<InterpretationLensId, string>> = Object.freeze({
  layout: "family",
  investment: "investment",
  design: "design",
  energy: "sustainability",
});

/**
 * Deterministic active lens from selected priority ids.
 */
export function resolveLens(
  priorityIds: readonly string[],
): ResolvedLens {
  const selected = new Set(priorityIds);
  for (const lens of LENS_ORDER) {
    if (selected.has(lens)) {
      return lens;
    }
  }
  return null;
}

export function lensKeyFor(lens: ResolvedLens): string {
  return lens === null ? "baseline" : LENS_KEY[lens];
}
