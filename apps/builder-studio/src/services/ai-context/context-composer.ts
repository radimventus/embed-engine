import type { ContextFragment } from '../../model';

/**
 * ContextComposer (EPIC-BLD-13).
 * merge / sort / deduplicate only — no token optimization, no prompts.
 */
export type ContextComposer = {
  merge(fragments: readonly (ContextFragment | null)[]): ContextFragment[];
  sort(fragments: readonly ContextFragment[]): ContextFragment[];
  deduplicate(fragments: readonly ContextFragment[]): ContextFragment[];
  compose(
    fragments: readonly (ContextFragment | null)[],
  ): ContextFragment[];
};

export function createContextComposer(): ContextComposer {
  const merge = (
    fragments: readonly (ContextFragment | null)[],
  ): ContextFragment[] =>
    fragments.filter((item): item is ContextFragment => item !== null);

  const sort = (fragments: readonly ContextFragment[]): ContextFragment[] =>
    [...fragments].sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.type.localeCompare(b.type);
    });

  const deduplicate = (
    fragments: readonly ContextFragment[],
  ): ContextFragment[] => {
    const seen = new Set<string>();
    const result: ContextFragment[] = [];
    for (const fragment of fragments) {
      const key = `${fragment.type}:${fragment.id}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      result.push(fragment);
    }
    return result;
  };

  return {
    merge,
    sort,
    deduplicate,
    compose(fragments) {
      return sort(deduplicate(merge(fragments)));
    },
  };
}
