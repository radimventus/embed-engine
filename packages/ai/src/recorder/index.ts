/**
 * PT-012 — Conversation Recorder public surface.
 */

export type {
  ConversationRecord,
  ConversationExport,
} from "./models/ConversationRecord";

export {
  ConversationRecorder,
  createConversationRecorder,
  createDisabledConversationRecorder,
  type ConversationRecorderOptions,
} from "./ConversationRecorder";
