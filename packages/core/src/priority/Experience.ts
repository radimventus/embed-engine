/**
 * Priority Domain Model §2.9 — Experience.
 *
 * Human communication / semantic presentation contract built from Interpretation.
 * Is not UI, HTML, PDF, or React (ADR-012 / Bible P08).
 *
 * Required fields (Blueprint §5): title, summary, focus, evidence, concerns,
 * confidence, recommendations, actions.
 *
 * Representation: existing Core Experience contract.
 */

export type {
  Experience,
  ExperienceAction,
  ExperienceConcern,
  ExperienceConfidence,
  ExperienceEvidence,
} from "../experience/Experience";
