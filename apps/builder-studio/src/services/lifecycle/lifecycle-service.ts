import type {
  BuilderProjectManifest,
  CreateProjectInput,
  LifecycleStatus,
  ProjectRecord,
  VersionInfo,
} from '../../model';
import { assertTransition } from './lifecycle-transitions';
import type { PlatformEventBus } from './platform-event-bus';

export type LifecycleService = {
  createProject(input: CreateProjectInput): ProjectRecord;
  changeStatus(projectId: string, status: LifecycleStatus): ProjectRecord;
  archive(projectId: string): ProjectRecord;
  restore(projectId: string): ProjectRecord;
  duplicate(projectId: string): ProjectRecord;
  delete(projectId: string): void;
  getManifest(projectId: string): BuilderProjectManifest | null;
  getVersionInfo(projectId: string): VersionInfo | null;
  syncBuildVersion(projectId: string, buildVersion: string): BuilderProjectManifest;
  syncPublishVersion(
    projectId: string,
    publishVersion: string,
  ): BuilderProjectManifest;
  syncRuntimeVersion(
    projectId: string,
    runtimeVersion: string,
  ): BuilderProjectManifest;
  listManifests(): readonly BuilderProjectManifest[];
};

type RegistryLike = {
  listProjects(): readonly ProjectRecord[];
  getProject(projectId: string): ProjectRecord | null;
  createProject(input: CreateProjectInput): ProjectRecord;
  archiveProject(projectId: string): ProjectRecord;
  deleteProject(projectId: string): void;
  /** Extended by lifecycle wiring */
  updateProject(projectId: string, patch: Partial<ProjectRecord>): ProjectRecord;
};

function nextProjectVersion(previous: string | null): string {
  if (previous === null || previous.trim().length === 0) {
    return '1.0.0';
  }
  const parts = previous.split('.').map(Number);
  const major = parts[0] ?? 1;
  const minor = parts[1] ?? 0;
  const patch = (parts[2] ?? 0) + 1;
  return `${major}.${minor}.${patch}`;
}

/**
 * LifecycleService (EPIC-BLD-06).
 * Orchestrates project lifecycle status & platform project manifest.
 * UI must not change status directly.
 */
export function createLifecycleService(options: {
  readonly registry: RegistryLike;
  readonly events: PlatformEventBus;
  readonly now?: () => Date;
}): LifecycleService {
  const now = options.now ?? (() => new Date());
  const manifests = new Map<string, BuilderProjectManifest>();

  const requireRecord = (projectId: string): ProjectRecord => {
    const record = options.registry.getProject(projectId);
    if (record === null) {
      throw new Error(`Project not found: ${projectId}`);
    }
    return record;
  };

  const requireManifest = (projectId: string): BuilderProjectManifest => {
    const manifest = manifests.get(projectId);
    if (manifest === undefined) {
      throw new Error(`Project manifest not found: ${projectId}`);
    }
    return manifest;
  };

  const writeManifest = (
    next: BuilderProjectManifest,
  ): BuilderProjectManifest => {
    manifests.set(next.projectId, next);
    return next;
  };

  const ensureManifestFromRecord = (
    record: ProjectRecord,
  ): BuilderProjectManifest => {
    const existing = manifests.get(record.projectId);
    if (existing !== undefined) {
      return existing;
    }
    const created: BuilderProjectManifest = {
      projectId: record.projectId,
      projectType: 'decision-experience',
      version: '1.0.0',
      status: record.status,
      owner: record.customer,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      buildVersion: null,
      publishVersion: null,
      runtimeVersion: null,
    };
    return writeManifest(created);
  };

  // Seed manifests for existing registry projects.
  for (const project of options.registry.listProjects()) {
    ensureManifestFromRecord(project);
  }

  const applyStatus = (
    projectId: string,
    status: LifecycleStatus,
  ): ProjectRecord => {
    const record = requireRecord(projectId);
    const manifest = ensureManifestFromRecord(record);
    assertTransition(manifest.status, status);
    const updatedAt = now().toISOString();
    const nextRecord = options.registry.updateProject(projectId, {
      status,
      updatedAt,
      lastSyncedAt: updatedAt,
    });
    writeManifest({
      ...manifest,
      status,
      updatedAt,
      owner: nextRecord.customer,
    });
    return nextRecord;
  };

  return {
    createProject(input) {
      const record = options.registry.createProject(input);
      const manifest = writeManifest({
        projectId: record.projectId,
        projectType: 'decision-experience',
        version: '1.0.0',
        status: 'Draft',
        owner: record.customer,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        buildVersion: null,
        publishVersion: null,
        runtimeVersion: null,
      });
      options.events.publish(
        'ProjectCreated',
        record.projectId,
        `Project ${manifest.projectId} created`,
      );
      return record;
    },

    changeStatus(projectId, status) {
      return applyStatus(projectId, status);
    },

    archive(projectId) {
      const record = applyStatus(projectId, 'Archived');
      options.events.publish(
        'ProjectArchived',
        projectId,
        `Project ${projectId} archived`,
      );
      return record;
    },

    restore(projectId) {
      return applyStatus(projectId, 'Draft');
    },

    duplicate(projectId) {
      const source = requireRecord(projectId);
      const sourceManifest = ensureManifestFromRecord(source);
      const copy = options.registry.createProject({
        name: `${source.name} Copy`,
        customer: source.customer,
      });
      writeManifest({
        projectId: copy.projectId,
        projectType: sourceManifest.projectType,
        version: '1.0.0',
        status: 'Draft',
        owner: copy.customer,
        createdAt: copy.createdAt,
        updatedAt: copy.updatedAt,
        buildVersion: null,
        publishVersion: null,
        runtimeVersion: null,
      });
      options.events.publish(
        'ProjectCreated',
        copy.projectId,
        `Project duplicated from ${projectId}`,
      );
      return copy;
    },

    delete(projectId) {
      options.registry.deleteProject(projectId);
      manifests.delete(projectId);
    },

    getManifest(projectId) {
      const record = options.registry.getProject(projectId);
      if (record === null) {
        return null;
      }
      return ensureManifestFromRecord(record);
    },

    getVersionInfo(projectId) {
      const manifest = this.getManifest(projectId);
      if (manifest === null) {
        return null;
      }
      return {
        project: manifest.version,
        build: manifest.buildVersion,
        publish: manifest.publishVersion,
        runtime: manifest.runtimeVersion,
      };
    },

    syncBuildVersion(projectId, buildVersion) {
      const manifest = requireManifest(projectId);
      if (manifest.status === 'Draft') {
        applyStatus(projectId, 'ReadyForBuild');
      }
      const current = requireManifest(projectId);
      if (
        current.status === 'ReadyForBuild' ||
        current.status === 'Built' ||
        current.status === 'ReadyForPublish' ||
        current.status === 'Published'
      ) {
        if (current.status !== 'Built') {
          applyStatus(projectId, 'Built');
        }
      }
      const afterStatus = requireManifest(projectId);
      const updatedAt = now().toISOString();
      options.registry.updateProject(projectId, { updatedAt });
      const next = writeManifest({
        ...afterStatus,
        buildVersion,
        version: nextProjectVersion(afterStatus.version),
        updatedAt,
      });
      options.events.publish(
        'BuildFinished',
        projectId,
        `Build ${buildVersion} finished`,
      );
      return next;
    },

    syncPublishVersion(projectId, publishVersion) {
      const manifest = requireManifest(projectId);
      if (manifest.status === 'Built') {
        applyStatus(projectId, 'ReadyForPublish');
      }
      applyStatus(projectId, 'Published');
      const afterStatus = requireManifest(projectId);
      const updatedAt = now().toISOString();
      const next = writeManifest({
        ...afterStatus,
        publishVersion,
        updatedAt,
      });
      options.events.publish(
        'PublishFinished',
        projectId,
        `Publish ${publishVersion} finished`,
      );
      return next;
    },

    syncRuntimeVersion(projectId, runtimeVersion) {
      const manifest = requireManifest(projectId);
      const updatedAt = now().toISOString();
      return writeManifest({
        ...manifest,
        runtimeVersion,
        updatedAt,
      });
    },

    listManifests() {
      return Array.from(manifests.values());
    },
  };
}
