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
};
