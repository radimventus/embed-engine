/**
 * PT-007 — ConversationAnalyzer.
 *
 * Decision Interpreter: extracts structured decision knowledge from a message.
 * Does not answer the user. Does not mutate Runtime or UI.
 */

import type { AnalyzerProvider } from "./providers/AnalyzerProvider";
import type {
  AnalysisRequest,
  AnalysisResult,
} from "./models/AnalysisRequest";

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
