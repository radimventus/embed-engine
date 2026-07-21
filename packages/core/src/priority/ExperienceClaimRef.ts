/**
 * Priority Domain Model §2.10 — ExperienceClaimRef.
 *
 * Reference to an Experience claim used in House Mapping
 * (evidence / concern / focus item, or equivalent).
 *
 * Open Question DM-OQ-05: canonical claim identity scheme
 * (stable ids vs ordinal paths into Experience fields) is not fixed in SSOT.
 * `claimId` is an opaque reference until ADR closes the scheme.
 */

export type ExperienceClaimRef = {
  /** Opaque claim reference — identity scheme TBD (DM-OQ-05). */
  readonly claimId: string;
};
