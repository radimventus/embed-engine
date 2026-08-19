import {
  PRIORITY_CORPUS_V1_ENTRIES,
  PRIORITY_CORPUS_V1_SOURCE,
} from "./priorityCorpusV1.generated";
import type { CustomerFacingPriorityId } from "./czechRealization";
import { realizeCustomerFacingHouseIdentityText } from "./houseIdentity";

export const PRIORITY_CORPUS_V1_VERSION = "v1" as const;
export const PRIORITY_CORPUS_SIMILARITY_THRESHOLD = 0.1;

export const PRIORITY_CORPUS_SLIDER_STATES = Object.freeze([
  "A_DOMINANT",
  "B_DOMINANT",
  "C_DOMINANT",
  "AB_COALITION",
  "AC_COALITION",
  "BC_COALITION",
  "BALANCED",
] as const);

export type PriorityCorpusSliderState =
  (typeof PRIORITY_CORPUS_SLIDER_STATES)[number];

export type PriorityCorpusImportance = {
  readonly priorityId: string;
  readonly importance: number;
};

export type PriorityCorpusKey = {
  readonly dmpId: string;
  readonly sliderState: PriorityCorpusSliderState;
};

export type PriorityCorpusResolution = {
  readonly key: PriorityCorpusKey;
  readonly priorityA: CustomerFacingPriorityId;
  readonly priorityB: CustomerFacingPriorityId;
  readonly priorityC: CustomerFacingPriorityId;
  readonly text: string;
};

export type PriorityCorpusCoverage = {
  readonly dmpCount: number;
  readonly combinationCount: number;
  readonly sliderStateCount: number;
  readonly realizationCount: number;
  readonly duplicateKeys: number;
  readonly missingKeys: number;
};

const CANONICAL_PRIORITY_ORDER = Object.freeze([
  "plot",
  "layout",
  "privacy",
  "design",
  "energy",
  "operating-costs",
  "quality",
  "maintenance",
] as const);

const PRIORITY_ID_BY_CORPUS_LABEL: Readonly<
  Record<string, CustomerFacingPriorityId>
> = Object.freeze({
  Pozemek: "plot",
  Dispozice: "layout",
  Soukromí: "privacy",
  Design: "design",
  Energie: "energy",
  "Provozní náklady": "operating-costs",
  Kvalita: "quality",
  Údržba: "maintenance",
});

type CorpusEntry = {
  readonly dmpId: string;
  readonly priorityA: CustomerFacingPriorityId;
  readonly priorityB: CustomerFacingPriorityId;
  readonly priorityC: CustomerFacingPriorityId;
  readonly sliderState: PriorityCorpusSliderState;
  readonly text: string;
};

function canonicalPriorityIndex(priorityId: string): number {
  return CANONICAL_PRIORITY_ORDER.indexOf(
    priorityId as CustomerFacingPriorityId,
  );
}

function isSliderState(value: string): value is PriorityCorpusSliderState {
  return PRIORITY_CORPUS_SLIDER_STATES.includes(
    value as PriorityCorpusSliderState,
  );
}

function combinationKey(
  priorityA: CustomerFacingPriorityId,
  priorityB: CustomerFacingPriorityId,
  priorityC: CustomerFacingPriorityId,
): string {
  return `${priorityA}|${priorityB}|${priorityC}`;
}

function realizationKey(key: PriorityCorpusKey): string {
  return `${key.dmpId}|${key.sliderState}`;
}

const parsedEntries: readonly CorpusEntry[] = Object.freeze(
  PRIORITY_CORPUS_V1_ENTRIES.map((entry) => {
    const priorityA = PRIORITY_ID_BY_CORPUS_LABEL[entry.priorityA];
    const priorityB = PRIORITY_ID_BY_CORPUS_LABEL[entry.priorityB];
    const priorityC = PRIORITY_ID_BY_CORPUS_LABEL[entry.priorityC];
    if (
      priorityA === undefined ||
      priorityB === undefined ||
      priorityC === undefined ||
      !isSliderState(entry.sliderState) ||
      entry.text.trim().length === 0
    ) {
      throw new Error("Invalid frozen Priority Corpus v1 entry.");
    }

    return Object.freeze({
      dmpId: entry.dmpId,
      priorityA,
      priorityB,
      priorityC,
      sliderState: entry.sliderState,
      text: entry.text,
    });
  }),
);

const entriesByRealizationKey = new Map<string, CorpusEntry>();
const dmpByCombination = new Map<string, CorpusEntry>();
let duplicateKeys = 0;

for (const entry of parsedEntries) {
  const entryKey = realizationKey(entry);
  if (entriesByRealizationKey.has(entryKey)) {
    duplicateKeys += 1;
    continue;
  }
  entriesByRealizationKey.set(entryKey, entry);

  const dmpKey = combinationKey(
    entry.priorityA,
    entry.priorityB,
    entry.priorityC,
  );
  const existingDmp = dmpByCombination.get(dmpKey);
  if (existingDmp === undefined) {
    dmpByCombination.set(dmpKey, entry);
  } else if (existingDmp.dmpId !== entry.dmpId) {
    duplicateKeys += 1;
  }
}

const expectedRealizationCount =
  dmpByCombination.size * PRIORITY_CORPUS_SLIDER_STATES.length;
let missingKeys = 0;
for (const dmp of dmpByCombination.values()) {
  for (const sliderState of PRIORITY_CORPUS_SLIDER_STATES) {
    if (!entriesByRealizationKey.has(realizationKey({ dmpId: dmp.dmpId, sliderState }))) {
      missingKeys += 1;
    }
  }
}

export const PRIORITY_CORPUS_V1_COVERAGE: PriorityCorpusCoverage =
  Object.freeze({
    dmpCount: new Set(parsedEntries.map((entry) => entry.dmpId)).size,
    combinationCount: dmpByCombination.size,
    sliderStateCount: PRIORITY_CORPUS_SLIDER_STATES.length,
    realizationCount: parsedEntries.length,
    duplicateKeys,
    missingKeys:
      missingKeys + Math.max(0, expectedRealizationCount - parsedEntries.length),
  });

function isValidImportance(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function isClose(difference: number): boolean {
  return difference <= PRIORITY_CORPUS_SIMILARITY_THRESHOLD + Number.EPSILON;
}

function isSeparated(difference: number): boolean {
  return difference > PRIORITY_CORPUS_SIMILARITY_THRESHOLD + Number.EPSILON;
}

export function classifyPriorityCorpusSliderState(input: {
  readonly priorityAImportance: number;
  readonly priorityBImportance: number;
  readonly priorityCImportance: number;
}): PriorityCorpusSliderState | null {
  const values = [
    { role: "A" as const, importance: input.priorityAImportance },
    { role: "B" as const, importance: input.priorityBImportance },
    { role: "C" as const, importance: input.priorityCImportance },
  ];

  if (values.some((entry) => !isValidImportance(entry.importance))) {
    return null;
  }

  const sorted = [...values].sort(
    (left, right) => right.importance - left.importance,
  );
  const maxValue = sorted[0]!.importance;
  const minValue = sorted[2]!.importance;

  if (isClose(maxValue - minValue)) {
    return "BALANCED";
  }

  const highest = sorted[0]!;
  const second = sorted[1]!;
  const third = sorted[2]!;
  if (
    isClose(highest.importance - second.importance) &&
    isSeparated(second.importance - third.importance)
  ) {
    const pair = [highest.role, second.role].sort().join("");
    if (pair === "AB") return "AB_COALITION";
    if (pair === "AC") return "AC_COALITION";
    return "BC_COALITION";
  }

  return `${highest.role}_DOMINANT`;
}

/**
 * Resolves an exact frozen Priority Corpus v1 realization.
 * Invalid, incomplete, or unsupported input intentionally returns null.
 */
export function resolvePriorityCorpusV1(
  selected: readonly PriorityCorpusImportance[],
): PriorityCorpusResolution | null {
  if (selected.length < 3) {
    return null;
  }
  if (
    selected.some(
      (entry) =>
        canonicalPriorityIndex(entry.priorityId) < 0 ||
        !isValidImportance(entry.importance),
    )
  ) {
    return null;
  }
  if (new Set(selected.map((entry) => entry.priorityId)).size !== selected.length) {
    return null;
  }

  const topThree = [...selected]
    .sort((left, right) => {
      const importanceDelta = right.importance - left.importance;
      if (importanceDelta !== 0) return importanceDelta;
      return (
        canonicalPriorityIndex(left.priorityId) -
        canonicalPriorityIndex(right.priorityId)
      );
    })
    .slice(0, 3)
    .sort(
      (left, right) =>
        canonicalPriorityIndex(left.priorityId) -
        canonicalPriorityIndex(right.priorityId),
    );

  const [priorityA, priorityB, priorityC] = topThree;
  if (
    priorityA === undefined ||
    priorityB === undefined ||
    priorityC === undefined
  ) {
    return null;
  }

  const dmp = dmpByCombination.get(
    combinationKey(
      priorityA.priorityId as CustomerFacingPriorityId,
      priorityB.priorityId as CustomerFacingPriorityId,
      priorityC.priorityId as CustomerFacingPriorityId,
    ),
  );
  if (dmp === undefined) {
    return null;
  }

  const sliderState = classifyPriorityCorpusSliderState({
    priorityAImportance: priorityA.importance,
    priorityBImportance: priorityB.importance,
    priorityCImportance: priorityC.importance,
  });
  if (sliderState === null) {
    return null;
  }

  const key = Object.freeze({ dmpId: dmp.dmpId, sliderState });
  const entry = entriesByRealizationKey.get(realizationKey(key));
  if (entry === undefined) {
    return null;
  }

  return Object.freeze({
    key,
    priorityA: dmp.priorityA,
    priorityB: dmp.priorityB,
    priorityC: dmp.priorityC,
    text: realizeCustomerFacingHouseIdentityText(entry.text),
  });
}

export { PRIORITY_CORPUS_V1_SOURCE };
