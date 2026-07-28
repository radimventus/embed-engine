import type {
  CreateProjectInput,
  LifecycleStatus,
  ProjectRecord,
} from '../model';
import { MOCK_PROJECTS } from './mock-data';

export type ProjectRegistry = {
  listProjects(): readonly ProjectRecord[];
  getProject(projectId: string): ProjectRecord | null;
  openProject(projectId: string): ProjectRecord;
  createProject(input: CreateProjectInput): ProjectRecord;
  updateProject(
    projectId: string,
    patch: Partial<
      Pick<
        ProjectRecord,
        'name' | 'customer' | 'status' | 'updatedAt' | 'lastSyncedAt' | 'syncStatus'
      >
    >,
  ): ProjectRecord;
  archiveProject(projectId: string): ProjectRecord;
  deleteProject(projectId: string): void;
};

function slugifyProjectName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.length > 0 ? slug : `project-${Date.now()}`;
}

function ensureUniqueProjectId(
  baseId: string,
  existing: ReadonlySet<string>,
): string {
  if (!existing.has(baseId)) {
    return baseId;
  }
  let suffix = 2;
  while (existing.has(`${baseId}-${suffix}`)) {
    suffix += 1;
  }
  return `${baseId}-${suffix}`;
}

/**
 * In-memory Project Registry (IMP-02 / EPIC-BLD-06).
 * Mock data only — no persistence, no API.
 */
export function createProjectRegistry(
  seed: readonly ProjectRecord[] = MOCK_PROJECTS,
): ProjectRegistry {
  const projects = new Map<string, ProjectRecord>(
    seed.map((project) => [project.projectId, { ...project }]),
  );

  return {
    listProjects(): readonly ProjectRecord[] {
      return Array.from(projects.values());
    },

    getProject(projectId: string): ProjectRecord | null {
      return projects.get(projectId) ?? null;
    },

    openProject(projectId: string): ProjectRecord {
      const project = projects.get(projectId);
      if (project === undefined) {
        throw new Error(`Project not found: ${projectId}`);
      }
      if (project.status === 'Archived') {
        throw new Error(`Archived project cannot be opened: ${projectId}`);
      }
      return project;
    },

    createProject(input: CreateProjectInput): ProjectRecord {
      const name = input.name.trim();
      if (name.length === 0) {
        throw new Error('Project name is required');
      }

      const now = new Date().toISOString();
      const projectId = ensureUniqueProjectId(
        slugifyProjectName(name),
        new Set(projects.keys()),
      );
      const record: ProjectRecord = {
        projectId,
        name,
        customer: input.customer?.trim() || 'AC Modular',
        status: 'Draft',
        createdAt: now,
        updatedAt: now,
        manifestPath: `/builder/projects/${projectId}/manifest.json`,
        lastSyncedAt: now,
        syncStatus: 'Synced',
      };
      projects.set(projectId, record);
      return record;
    },

    updateProject(projectId, patch) {
      const current = projects.get(projectId);
      if (current === undefined) {
        throw new Error(`Project not found: ${projectId}`);
      }
      const next: ProjectRecord = {
        ...current,
        ...patch,
        projectId: current.projectId,
        createdAt: current.createdAt,
        manifestPath: current.manifestPath,
      };
      projects.set(projectId, next);
      return next;
    },

    archiveProject(projectId: string): ProjectRecord {
      return this.updateProject(projectId, {
        status: 'Archived' satisfies LifecycleStatus,
        updatedAt: new Date().toISOString(),
      });
    },

    deleteProject(projectId: string): void {
      if (!projects.has(projectId)) {
        throw new Error(`Project not found: ${projectId}`);
      }
      projects.delete(projectId);
    },
  };
}
