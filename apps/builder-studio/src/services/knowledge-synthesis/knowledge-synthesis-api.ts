import type {
  KnowledgeEntry,
  SynthesizeKnowledgeInput,
  SynthesizedKnowledgeBase,
} from '../../model';
import type { KnowledgeSynthesisEngine } from './knowledge-synthesis-engine';

/**
 * Public Knowledge Synthesis API (EPIC-BLD-27).
 */
export type KnowledgeSynthesisApi = {
  synthesizeKnowledge(input: SynthesizeKnowledgeInput): SynthesizedKnowledgeBase;
  publishKnowledge(knowledgeBaseId: string): SynthesizedKnowledgeBase;
  previewKnowledge(knowledgeBaseId: string): SynthesizedKnowledgeBase | null;
  listKnowledge(knowledgeBaseId?: string): readonly KnowledgeEntry[];
  validateKnowledge(knowledgeBaseId: string): SynthesizedKnowledgeBase;
};

export function createKnowledgeSynthesisApi(
  engine: KnowledgeSynthesisEngine,
): KnowledgeSynthesisApi {
  return {
    synthesizeKnowledge(input) {
      return engine.synthesize(input);
    },
    publishKnowledge(knowledgeBaseId) {
      return engine.publish(knowledgeBaseId);
    },
    previewKnowledge(knowledgeBaseId) {
      return engine.preview(knowledgeBaseId);
    },
    listKnowledge(knowledgeBaseId) {
      return engine.listKnowledge(knowledgeBaseId);
    },
    validateKnowledge(knowledgeBaseId) {
      return engine.validate(knowledgeBaseId);
    },
  };
}
