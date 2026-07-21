/**
 * Priority Domain Model §2.11 — ObjectAnchor.
 *
 * Conceptual place in the object that anchors a claim.
 *
 * Open Question DM-OQ-06 (Needs ADR): canonical objectAnchor ID schema and
 * binding to Object Package paths / media ids. Domain keeps conceptual shape only.
 */

export const OBJECT_ANCHOR_KINDS = [
  "room",
  "zone",
  "element",
  "relation",
  "medium",
] as const;

export type ObjectAnchorKind = (typeof OBJECT_ANCHOR_KINDS)[number];

export type ObjectAnchor = {
  readonly kind: ObjectAnchorKind;
  /**
   * Opaque anchor id until DM-OQ-06 / OQ-03 is closed by ADR.
   * Must not be treated as a frozen Object Package path schema.
   */
  readonly id: string;
};
