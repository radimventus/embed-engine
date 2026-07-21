/**
 * Priority Domain Model §2.1 — ObjectRef.
 *
 * Stable reference to the object under decision.
 * Owns identity only in this domain; does not own facts or interpretation.
 */

export type ObjectRef = {
  readonly objectId: string;
};
