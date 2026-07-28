import type {
  GatewayAIContext,
  GatewayAIContextIndexEntry,
} from '../../model';

/**
 * AIContextIndex for AI Decision Gateway (EPIC-BLD-28).
 */
export type GatewayAIContextIndex = {
  index(
    packageId: string,
    knowledgeBaseId: string,
    context: GatewayAIContext,
  ): GatewayAIContextIndexEntry;
  find(contextId: string): readonly GatewayAIContextIndexEntry[];
  list(packageId?: string): readonly GatewayAIContextIndexEntry[];
  rebuild(
    packages: readonly {
      readonly id: string;
      readonly knowledgeBaseId: string;
      readonly context: GatewayAIContext;
    }[],
  ): readonly GatewayAIContextIndexEntry[];
};

export function createGatewayAIContextIndex(): GatewayAIContextIndex {
  let entries: GatewayAIContextIndexEntry[] = [];

  return {
    index(packageId, knowledgeBaseId, context) {
      const next: GatewayAIContextIndexEntry = {
        packageId,
        contextId: context.id,
        knowledgeBaseId,
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
        this.index(item.id, item.knowledgeBaseId, item.context);
      }
      return [...entries];
    },
  };
}
