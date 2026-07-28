import type {
  ExtractPatternsInput,
  ExtractedPattern,
  PatternCollection,
} from '../../model';
import type { PatternExtractionEngine } from './pattern-extraction-engine';

/**
 * Public Pattern Extraction API (EPIC-BLD-24).
 */
export type PatternExtractionApi = {
  extractPatterns(input: ExtractPatternsInput): PatternCollection;
  previewPatterns(collectionId: string): PatternCollection | null;
  listPatterns(collectionId?: string): readonly ExtractedPattern[];
  validatePatterns(collectionId: string): PatternCollection;
};

export function createPatternExtractionApi(
  engine: PatternExtractionEngine,
): PatternExtractionApi {
  return {
    extractPatterns(input) {
      return engine.extract(input);
    },
    previewPatterns(collectionId) {
      return engine.preview(collectionId);
    },
    listPatterns(collectionId) {
      return engine.listPatterns(collectionId);
    },
    validatePatterns(collectionId) {
      return engine.validate(collectionId);
    },
  };
}
