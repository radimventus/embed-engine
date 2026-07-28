import type {
  PersonalizedDecisionContext,
  PersonalizationRuntimeIndexEntry,
} from '../../model';

/**
 * PersonalizationRuntimeIndex (EPIC-BLD-30).
 */
export type PersonalizationRuntimeIndex = {
  index(
    packageId: string,
    context: PersonalizedDecisionContext,
  ): PersonalizationRuntimeIndexEntry;
  find(contextId: string): readonly PersonalizationRuntimeIndexEntry[];
  list(packageId?: string): readonly PersonalizationRuntimeIndexEntry[];
  rebuild(
    packages: readonly {
      readonly id: string;
      readonly context: PersonalizedDecisionContext;
    }[],
  ): readonly PersonalizationRuntimeIndexEntry[];
};

export function createPersonalizationRuntimeIndex(): PersonalizationRuntimeIndex {
  let entries: PersonalizationRuntimeIndexEntry[] = [];

  return {
    index(packageId, context) {
      const next: PersonalizationRuntimeIndexEntry = {
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
