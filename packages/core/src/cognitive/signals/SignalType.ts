/**
 * MVP Signal type vocabulary.
 * Strongly typed identifiers only — no behavior.
 */
export const SignalType = {
  ROOM_VIEWED: "ROOM_VIEWED",
  MEDIA_OPENED: "MEDIA_OPENED",
  FLOOR_CHANGED: "FLOOR_CHANGED",
  QUESTION_OPENED: "QUESTION_OPENED",
} as const;

export type SignalType = (typeof SignalType)[keyof typeof SignalType];
