/**
 * PT-005 — Knowledge Context stub (RAG / knowledge packs later).
 */

export type KnowledgeEntry = {
  readonly id: string;
  readonly text: string;
  readonly modelConstraints?: readonly string[];
  readonly provenance?: { readonly sourceId: string; readonly kind: string; readonly label?: string; readonly editorialNotes?: readonly string[] };
};

export type KnowledgeContext = {
  readonly entries: readonly KnowledgeEntry[];
};

export function emptyKnowledgeContext(): KnowledgeContext {
  return Object.freeze({
    entries: Object.freeze([] as KnowledgeEntry[]),
  });
}
