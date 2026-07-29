import type {
  PublicationHistoryEntry,
  PublishedArtifact,
} from '../../model';

/**
 * Immutable publication history.
 * Each publication is a separate version entry — never mutated.
 */
export type PublicationHistory = {
  index(artifact: PublishedArtifact): readonly PublicationHistoryEntry[];
  find(publicationId: string): PublicationHistoryEntry | null;
  list(projectId?: string): readonly PublicationHistoryEntry[];
  findLatest(projectId: string): PublicationHistoryEntry | null;
  findByVersion(
    projectId: string,
    version: string,
  ): PublicationHistoryEntry | null;
  rebuild(
    artifacts: readonly PublishedArtifact[],
  ): readonly PublicationHistoryEntry[];
};

function toEntry(artifact: PublishedArtifact): PublicationHistoryEntry {
  return {
    publicationId: artifact.id,
    projectId: artifact.projectId,
    version: artifact.version,
    embedId: artifact.embedId,
    publishedAt: artifact.publishedAt,
    sessionId: artifact.metadata.sessionId,
  };
}

export function createPublicationHistory(): PublicationHistory {
  let entries: PublicationHistoryEntry[] = [];

  return {
    index(artifact) {
      if (entries.some((entry) => entry.publicationId === artifact.id)) {
        throw new Error(
          `Publication history is immutable; duplicate publication: ${artifact.id}`,
        );
      }
      const next = toEntry(artifact);
      entries = [...entries, next].sort((left, right) =>
        right.publishedAt.localeCompare(left.publishedAt),
      );
      return [next];
    },

    find(publicationId) {
      return (
        entries.find((entry) => entry.publicationId === publicationId) ?? null
      );
    },

    list(projectId) {
      if (projectId === undefined) return [...entries];
      return entries.filter((entry) => entry.projectId === projectId);
    },

    findLatest(projectId) {
      return (
        entries.find((entry) => entry.projectId === projectId) ?? null
      );
    },

    findByVersion(projectId, version) {
      return (
        entries.find(
          (entry) =>
            entry.projectId === projectId && entry.version === version,
        ) ?? null
      );
    },

    rebuild(artifacts) {
      entries = [];
      for (const artifact of artifacts) {
        this.index(artifact);
      }
      return [...entries];
    },
  };
}
