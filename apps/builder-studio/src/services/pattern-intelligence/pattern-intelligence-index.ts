import type {
  IntelligencePattern,
  PatternIntelligenceIndexEntry,
} from '../../model';

/**
 * PatternIndex for Pattern Intelligence (EPIC-BLD-25).
 */
export type PatternIntelligenceIndex = {
  index(
    catalogId: string,
    patterns: readonly IntelligencePattern[],
  ): readonly PatternIntelligenceIndexEntry[];
  find(patternId: string): readonly PatternIntelligenceIndexEntry[];
  list(catalogId?: string): readonly PatternIntelligenceIndexEntry[];
  rebuild(
    catalogs: readonly {
      readonly id: string;
      readonly patterns: readonly IntelligencePattern[];
    }[],
  ): readonly PatternIntelligenceIndexEntry[];
};

export function createPatternIntelligenceIndex(): PatternIntelligenceIndex {
  let entries: PatternIntelligenceIndexEntry[] = [];

  return {
    index(catalogId, patterns) {
      const next = patterns.map((pattern) => ({
        catalogId,
        patternId: pattern.id,
        name: pattern.name,
        type: pattern.type,
        confidence: pattern.confidence,
      }));
      entries = [
        ...entries.filter((item) => item.catalogId !== catalogId),
        ...next,
      ];
      return next;
    },

    find(patternId) {
      return entries.filter((item) => item.patternId === patternId);
    },

    list(catalogId) {
      if (catalogId === undefined) {
        return [...entries];
      }
      return entries.filter((item) => item.catalogId === catalogId);
    },

    rebuild(catalogs) {
      entries = [];
      for (const catalog of catalogs) {
        this.index(catalog.id, catalog.patterns);
      }
      return [...entries];
    },
  };
}
