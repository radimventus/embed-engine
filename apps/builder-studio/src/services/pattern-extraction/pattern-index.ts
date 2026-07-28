import type { ExtractedPattern, PatternIndexEntry } from '../../model';

/**
 * PatternIndex (EPIC-BLD-24).
 * Indexation only.
 */
export type PatternIndex = {
  index(
    collectionId: string,
    patterns: readonly ExtractedPattern[],
  ): readonly PatternIndexEntry[];
  find(patternId: string): readonly PatternIndexEntry[];
  list(collectionId?: string): readonly PatternIndexEntry[];
  rebuild(
    collections: readonly {
      readonly id: string;
      readonly patterns: readonly ExtractedPattern[];
    }[],
  ): readonly PatternIndexEntry[];
};

export function createPatternIndex(): PatternIndex {
  let entries: PatternIndexEntry[] = [];

  return {
    index(collectionId, patterns) {
      const next = patterns.map((pattern) => ({
        collectionId,
        patternId: pattern.id,
        name: pattern.name,
        confidence: pattern.confidence,
      }));
      entries = [
        ...entries.filter((item) => item.collectionId !== collectionId),
        ...next,
      ];
      return next;
    },

    find(patternId) {
      return entries.filter((item) => item.patternId === patternId);
    },

    list(collectionId) {
      if (collectionId === undefined) {
        return [...entries];
      }
      return entries.filter((item) => item.collectionId === collectionId);
    },

    rebuild(collections) {
      entries = [];
      for (const collection of collections) {
        this.index(collection.id, collection.patterns);
      }
      return [...entries];
    },
  };
}
