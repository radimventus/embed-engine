import type {
  AIContextPackage,
  BuildAIContextInput,
} from '../../model';
import type { AIContextBuilderService } from './ai-context-builder-service';

/**
 * Public AI Context API (EPIC-BLD-13).
 * Context composition only — no LLM.
 */
export type AIContextApi = {
  buildContext(input: BuildAIContextInput): AIContextPackage;
  previewContext(contextId?: string): AIContextPackage | null;
  refreshContext(input: BuildAIContextInput): AIContextPackage;
};

export function createAIContextApi(
  service: AIContextBuilderService,
): AIContextApi {
  return {
    buildContext(input) {
      return service.build(input);
    },
    previewContext(contextId) {
      return service.preview(contextId);
    },
    refreshContext(input) {
      return service.refresh(input);
    },
  };
}
