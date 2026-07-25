/**
 * PT-009 — Memory update contracts.
 * Sole write path into Decision Memory is DecisionMemoryService.
 */

import type { AnalysisResult } from "../../analyzer/models/AnalysisResult";

export type MemoryUpdateRequest = {
  readonly analysis: AnalysisResult;
};

export type MemoryUpdateResult = {
  readonly added: number;
  readonly skipped: number;
  readonly duplicated: number;
};
