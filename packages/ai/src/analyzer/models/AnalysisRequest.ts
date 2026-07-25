/**
 * PT-007A — AnalysisRequest.
 *
 * One user message (+ optional short window). No Runtime. No Experience.
 * Extraction only — no Memory write.
 */

import type { ChatMessage } from "../../models/ChatRequest";

export type AnalysisRequest = {
  /** Latest user message to interpret. */
  readonly message: string;
  /** Short conversation window (not long-term history). */
  readonly recentMessages?: readonly ChatMessage[];
};
