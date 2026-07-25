/**
 * PT-012 — ConversationRecord: audit snapshot for one pipeline turn.
 *
 * Full content for debug / replay — not for anonymous analytics.
 * Recorder never mutates Runtime or Memory.
 */

import type { AnalysisResult } from "../../analyzer/models/AnalysisResult";
import type { ResolvedMemory } from "../../memory/models/ResolvedMemory";
import type { PromptPackage } from "../../prompt/models/PromptPackage";

export type ConversationRecord = {
  readonly sessionId: string;
  readonly messageId: string;
  readonly timestamp: number;
  readonly userMessage: string;
  readonly analysis: AnalysisResult | null;
  readonly resolvedMemory: ResolvedMemory | null;
  readonly promptPackage: PromptPackage | null;
  readonly provider: string | null;
  readonly model: string | null;
  readonly promptTokens: number | null;
  readonly completionTokens: number | null;
  readonly latency: number;
  readonly response: string | null;
  readonly error: string | null;
};

/** One conversation = one exportable JSON document. */
export type ConversationExport = {
  readonly sessionId: string;
  readonly conversationId: string;
  readonly exportedAt: number;
  readonly messageCount: number;
  readonly records: readonly ConversationRecord[];
};
