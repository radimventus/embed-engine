/**
 * Current user attention within the decision process.
 * Sub-aggregate of DecisionState — data only, no behavior.
 *
 * Fields mirror CAP-03 SignalType attention targets.
 * All optional: empty Focus means no attention is established yet.
 */
export type Focus = {
  readonly roomId?: string;
  readonly mediaId?: string;
  readonly floorId?: string;
  readonly questionId?: string;
};
