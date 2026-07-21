/**
 * Supporting argument behind an interpreted Experience.
 * Domain artefact — not a UI model.
 */
export type ExperienceEvidence = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
};

/**
 * Attention point within an interpreted Experience.
 * Domain artefact — not a UI model.
 */
export type ExperienceConcern = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly severity: "low" | "medium" | "high";
};

/**
 * Interpreted representation of an Object.
 * Domain artefact — not a UI model.
 */
export type Experience = {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly focus: readonly string[];
  readonly recommendations: readonly string[];
  readonly evidence: readonly ExperienceEvidence[];
  readonly concerns: readonly ExperienceConcern[];
};
