import type { Project, WorkspaceIndexEntry } from '../model';

export type WorkspaceIndex = {
  index(projects: readonly Project[]): readonly WorkspaceIndexEntry[];
  find(projectId: string): WorkspaceIndexEntry | null;
  list(): readonly WorkspaceIndexEntry[];
  rebuild(projects: readonly Project[]): readonly WorkspaceIndexEntry[];
};

export function createWorkspaceIndex(): WorkspaceIndex {
  let entries: WorkspaceIndexEntry[] = [];

  return {
    index(projects) {
      entries = projects.map((project) => ({
        projectId: project.id,
        slug: project.slug,
        name: project.name,
        status: project.status,
        updatedAt: project.updatedAt,
      }));
      return [...entries];
    },

    find(projectId) {
      return entries.find((entry) => entry.projectId === projectId) ?? null;
    },

    list() {
      return [...entries];
    },

    rebuild(projects) {
      return this.index(projects);
    },
  };
}
