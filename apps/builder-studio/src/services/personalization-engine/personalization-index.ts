import type {
  PersonalizedContext,
  PersonalizationIndexEntry,
} from '../../model';

/**
 * PersonalizationIndex (EPIC-BLD-29).
 */
export type PersonalizationIndex = {
  index(
    packageId: string,
    context: PersonalizedContext,
  ): PersonalizationIndexEntry;
  find(contextId: string): readonly PersonalizationIndexEntry[];
  list(packageId?: string): readonly PersonalizationIndexEntry[];
  rebuild(
    packages: readonly {
      readonly id: string;
      readonly context: PersonalizedContext;
    }[],
  ): readonly PersonalizationIndexEntry[];
};

export function createPersonalizationIndex(): PersonalizationIndex {
  let entries: PersonalizationIndexEntry[] = [];

  return {
    index(packageId, context) {
      const next: PersonalizationIndexEntry = {
        packageId,
        contextId: context.id,
        sessionId: context.sessionId,
        confidence: context.confidence,
        entryCount: context.knowledgeEntries.length,
      };
      entries = [
        ...entries.filter((item) => item.packageId !== packageId),
        next,
      ];
      return next;
    },

    find(contextId) {
      return entries.filter((item) => item.contextId === contextId);
    },

    list(packageId) {
      if (packageId === undefined) {
        return [...entries];
      }
      return entries.filter((item) => item.packageId === packageId);
    },

    rebuild(packages) {
      entries = [];
      for (const item of packages) {
        this.index(item.id, item.context);
      }
      return [...entries];
    },
  };
}
