/**
 * PT-007A — AnalysisService (extraction entry).
 *
 * Internal capability: message → AnalysisResult.
 * No Memory write in PT-007A (merge belongs to a later slice).
 */

import type { ConversationAnalyzer } from "./ConversationAnalyzer";
import type { AnalysisRequest } from "./models/AnalysisRequest";
import type { AnalysisResult } from "./models/AnalysisResult";

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
}

export function createAnalysisService(
  analyzer: ConversationAnalyzer,
): AnalysisService {
  return new AnalysisService({ analyzer });
}
