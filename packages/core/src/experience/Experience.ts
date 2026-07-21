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
 * Confidence signal for an interpreted Experience.
 * Domain artefact — not a UI model.
 * score is an integer in the range 0–100.
 */
export type ExperienceConfidence = {
  readonly level: "low" | "medium" | "high";
  readonly score: number;
  readonly explanation: string;
};

/**
 * Guided next step within an interpreted Experience.
 * Domain artefact — not a UI model.
 */
export type ExperienceAction = {
  readonly id: string;
  readonly label: string;
  readonly type: "primary" | "secondary";
  readonly intent: "explore" | "compare" | "contact" | "calculate";
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
  readonly confidence: ExperienceConfidence;
  readonly actions: readonly ExperienceAction[];
};
