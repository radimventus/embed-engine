import type {
  IntelligencePattern,
  PatternCatalog,
  PatternIntelligenceInput,
} from '../../model';
import type { PatternIntelligenceEngine } from './pattern-intelligence-engine';

/**
 * Public Pattern Intelligence API (EPIC-BLD-25).
 */
export type PatternIntelligenceApi = {
  extractPatterns(input: PatternIntelligenceInput): PatternCatalog;
  publishPatterns(catalogId: string): PatternCatalog;
  previewPatterns(catalogId: string): PatternCatalog | null;
  listPatterns(catalogId?: string): readonly IntelligencePattern[];
  validatePatterns(catalogId: string): PatternCatalog;
};

export function createPatternIntelligenceApi(
  engine: PatternIntelligenceEngine,
): PatternIntelligenceApi {
  return {
    extractPatterns(input) {
      return engine.extract(input);
    },
    publishPatterns(catalogId) {
      return engine.publish(catalogId);
    },
    previewPatterns(catalogId) {
      return engine.preview(catalogId);
    },
    listPatterns(catalogId) {
      return engine.listPatterns(catalogId);
    },
    validatePatterns(catalogId) {
      return engine.validate(catalogId);
    },
  };
}
