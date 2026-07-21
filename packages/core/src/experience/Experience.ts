/**
 * Interpreted representation of an Object.
 * Domain artefact — not a UI model.
 */
export type Experience = {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly focus: readonly string[];
};
