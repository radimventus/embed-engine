/**
 * PT-007 — AnalysisService.
 *
 * Internal capability: analyze message → AnalysisResult → DecisionMemory.merge.
 * Decision Memory is the sole long-term recipient of analysis output.
 */

import {
  mergeDecisionMemory,
  type DecisionMemory,
} from "../prompt/models/DecisionMemory";
import type { ConversationAnalyzer } from "./ConversationAnalyzer";
import type {
  AnalysisRequest,
  AnalysisResult,
} from "./models/AnalysisRequest";

export type AnalyzeAndMergeResult = {
  readonly result: AnalysisResult;
  readonly memory: DecisionMemory;
};

export type AnalysisServiceOptions = {
  readonly analyzer: ConversationAnalyzer;
};

export class AnalysisService {
  private readonly analyzer: ConversationAnalyzer;

  constructor(options: AnalysisServiceOptions) {
    this.analyzer = options.analyzer;
  }

  /** Extract structured decision data only — never a user-facing reply. */
  analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    return this.analyzer.analyze(request);
  }

  /**
   * Analyze then merge into Decision Memory (append-only by key).
   */
  async analyzeAndMerge(
    request: AnalysisRequest,
    memory: DecisionMemory,
  ): Promise<AnalyzeAndMergeResult> {
    const result = await this.analyzer.analyze(request);
    const next = mergeDecisionMemory(memory, result);
    return Object.freeze({ result, memory: next });
  }
}

export function createAnalysisService(
  analyzer: ConversationAnalyzer,
): AnalysisService {
  return new AnalysisService({ analyzer });
}
