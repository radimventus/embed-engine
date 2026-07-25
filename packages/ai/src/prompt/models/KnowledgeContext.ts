/**
 * PT-005 — Knowledge Context stub (RAG / knowledge packs later).
 */

export type KnowledgeEntry = {
  readonly id: string;
  readonly text: string;
};

export type KnowledgeContext = {
  readonly entries: readonly KnowledgeEntry[];
};

export function emptyKnowledgeContext(): KnowledgeContext {
  return Object.freeze({
    entries: Object.freeze([] as KnowledgeEntry[]),
  });
}
