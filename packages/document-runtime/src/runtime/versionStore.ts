/**
 * PT-15 — Document versioning store (in-memory).
 */

import type { DocumentArtifact } from '../domain/types';

export type DocumentVersionStore = {
  readonly save: (artifact: DocumentArtifact) => DocumentArtifact;
  readonly listByProject: (projectId: string) => readonly DocumentArtifact[];
  readonly getById: (documentId: string) => DocumentArtifact | null;
  readonly updateStatus: (
    documentId: string,
    status: DocumentArtifact['status'],
  ) => DocumentArtifact | null;
  readonly nextVersion: (projectId: string, type: DocumentArtifact['type']) => number;
  readonly reset: () => void;
};

export function createDocumentVersionStore(): DocumentVersionStore {
  const byId = new Map<string, DocumentArtifact>();

  return {
    save(artifact) {
      byId.set(artifact.id, artifact);
      return artifact;
    },
    listByProject(projectId) {
      return [...byId.values()]
        .filter((item) => item.projectId === projectId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    getById(documentId) {
      return byId.get(documentId) ?? null;
    },
    updateStatus(documentId, status) {
      const current = byId.get(documentId);
      if (current === undefined) return null;
      const next = { ...current, status };
      byId.set(documentId, next);
      return next;
    },
    nextVersion(projectId, type) {
      let max = 0;
      for (const item of byId.values()) {
        if (item.projectId === projectId && item.type === type) {
          max = Math.max(max, item.version);
        }
      }
      return max + 1;
    },
    reset() {
      byId.clear();
    },
  };
}
