import type { DerivedHeuristic, HeuristicIndexEntry } from '../../model';

/**
 * HeuristicIndex (EPIC-BLD-26).
 */
export type HeuristicIndex = {
  index(
    catalogId: string,
    heuristics: readonly DerivedHeuristic[],
  ): readonly HeuristicIndexEntry[];
  find(heuristicId: string): readonly HeuristicIndexEntry[];
  list(catalogId?: string): readonly HeuristicIndexEntry[];
  rebuild(
    catalogs: readonly {
      readonly id: string;
      readonly heuristics: readonly DerivedHeuristic[];
    }[],
  ): readonly HeuristicIndexEntry[];
};

export function createHeuristicIndex(): HeuristicIndex {
  let entries: HeuristicIndexEntry[] = [];

  return {
    index(catalogId, heuristics) {
      const next = heuristics.map((heuristic) => ({
        catalogId,
        heuristicId: heuristic.id,
        name: heuristic.name,
        confidence: heuristic.confidence,
        priority: heuristic.priority,
      }));
      entries = [
        ...entries.filter((item) => item.catalogId !== catalogId),
        ...next,
      ];
      return next;
    },

    find(heuristicId) {
      return entries.filter((item) => item.heuristicId === heuristicId);
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
        this.index(catalog.id, catalog.heuristics);
      }
      return [...entries];
    },
  };
}
