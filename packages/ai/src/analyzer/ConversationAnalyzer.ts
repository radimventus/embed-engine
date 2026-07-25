/**
 * PT-007A — ConversationAnalyzer.
 *
 * Extracts structured AnalysisResult from one user message.
 * Does not answer the user. Does not write Memory. Does not touch Runtime/UI.
 */

import type { AnalyzerProvider } from "./providers/AnalyzerProvider";
import type { AnalysisRequest } from "./models/AnalysisRequest";
import type { AnalysisResult } from "./models/AnalysisResult";

export type ConversationAnalyzerOptions = {
  readonly provider: AnalyzerProvider;
};

export class ConversationAnalyzer {
  private readonly provider: AnalyzerProvider;

  constructor(options: ConversationAnalyzerOptions) {
    this.provider = options.provider;
  }

  analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    return this.provider.analyze(request);
  }
}

export function createConversationAnalyzer(
  provider: AnalyzerProvider,
): ConversationAnalyzer {
  return new ConversationAnalyzer({ provider });
}
