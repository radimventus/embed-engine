/**
 * PT-007A — AnalysisResult: structured extraction only.
 * No free-text blocks. No chat response fields.
 */

export type AnalysisValue = string | number | boolean;

export type Fact = {
  readonly key: string;
  readonly value: AnalysisValue;
};

export type Preference = {
  readonly key: string;
  readonly value: AnalysisValue;
};

export type Constraint = {
  readonly key: string;
  readonly value: AnalysisValue;
};

export type Goal = {
  readonly key: string;
  readonly value: AnalysisValue;
};

export type Concern = {
  readonly key: string;
  readonly value: AnalysisValue;
};

export type AcceptedOption = {
  readonly key: string;
  readonly value: AnalysisValue;
};

export type RejectedOption = {
  readonly key: string;
  readonly value: AnalysisValue;
};

export type AnalysisResult = {
  readonly facts: readonly Fact[];
  readonly preferences: readonly Preference[];
  readonly constraints: readonly Constraint[];
  readonly goals: readonly Goal[];
  readonly concerns: readonly Concern[];
  readonly acceptedOptions: readonly AcceptedOption[];
  readonly rejectedOptions: readonly RejectedOption[];
  /** 0..1 confidence in the extraction. */
  readonly confidence: number;
};

export function emptyAnalysisResult(confidence = 0): AnalysisResult {
  return Object.freeze({
    facts: Object.freeze([] as Fact[]),
    preferences: Object.freeze([] as Preference[]),
    constraints: Object.freeze([] as Constraint[]),
    goals: Object.freeze([] as Goal[]),
    concerns: Object.freeze([] as Concern[]),
    acceptedOptions: Object.freeze([] as AcceptedOption[]),
    rejectedOptions: Object.freeze([] as RejectedOption[]),
    confidence,
  });
}
