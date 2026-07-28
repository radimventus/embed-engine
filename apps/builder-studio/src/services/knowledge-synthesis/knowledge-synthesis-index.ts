import type {
  KnowledgeEntry,
  KnowledgeSynthesisIndexEntry,
} from '../../model';

/**
 * KnowledgeIndex for Knowledge Synthesis (EPIC-BLD-27).
 */
export type KnowledgeSynthesisIndex = {
  index(
    knowledgeBaseId: string,
    entries: readonly KnowledgeEntry[],
  ): readonly KnowledgeSynthesisIndexEntry[];
  find(entryId: string): readonly KnowledgeSynthesisIndexEntry[];
  list(knowledgeBaseId?: string): readonly KnowledgeSynthesisIndexEntry[];
  rebuild(
    bases: readonly {
      readonly id: string;
      readonly entries: readonly KnowledgeEntry[];
    }[],
  ): readonly KnowledgeSynthesisIndexEntry[];
};

export function createKnowledgeSynthesisIndex(): KnowledgeSynthesisIndex {
  let entries: KnowledgeSynthesisIndexEntry[] = [];

  return {
    index(knowledgeBaseId, knowledgeEntries) {
      const next = knowledgeEntries.map((entry) => ({
        knowledgeBaseId,
        entryId: entry.id,
        title: entry.title,
        confidence: entry.confidence,
      }));
      entries = [
        ...entries.filter((item) => item.knowledgeBaseId !== knowledgeBaseId),
        ...next,
      ];
      return next;
    },

    find(entryId) {
      return entries.filter((item) => item.entryId === entryId);
    },

    list(knowledgeBaseId) {
      if (knowledgeBaseId === undefined) {
        return [...entries];
      }
      return entries.filter((item) => item.knowledgeBaseId === knowledgeBaseId);
    },

    rebuild(bases) {
      entries = [];
      for (const base of bases) {
        this.index(base.id, base.entries);
      }
      return [...entries];
    },
  };
}
