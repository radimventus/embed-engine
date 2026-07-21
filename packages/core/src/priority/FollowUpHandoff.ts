/**
 * Priority Domain Model §2.14 — FollowUpHandoff.
 *
 * Recommended next Workspace module after Journey reading.
 * Lead/audit must not be the only pre-understanding path (Bible P06).
 */

export type FollowUpHandoff = {
  /** Machine id of the handoff target module. */
  readonly targetId: string;
  /** Presentation label for the handoff (Journey chrome / Follow-up copy). */
  readonly label: string;
};
