import type {
  ActiveProjectModel,
  CreateObjectInput,
  ObjectEvent,
  ObjectModuleId,
  ObjectPackage,
  UpdateObjectMetadataInput,
} from '../../model';
import { DEFAULT_OBJECT_MODULES } from './module-registry';
import {
  snapshotObjectContent,
  withContentSnapshot,
} from './object-content';

const MAX_HISTORY = 30;

export type ObjectService = {
  createObject(input: CreateObjectInput): ObjectPackage;
  loadObject(objectId: string): ObjectPackage | null;
  loadObjectByProject(projectId: string): ObjectPackage | null;
  updateObject(
    objectId: string,
    patch: UpdateObjectMetadataInput,
  ): ObjectPackage;
  saveObject(objectId: string): ObjectPackage;
  duplicateObject(objectId: string): ObjectPackage;
  archiveObject(objectId: string): ObjectPackage;
  assignModule(objectId: string, moduleId: ObjectModuleId): ObjectPackage;
  unassignModule(objectId: string, moduleId: ObjectModuleId): ObjectPackage;
  setModules(
    objectId: string,
    modules: readonly ObjectModuleId[],
  ): ObjectPackage;
  syncContentFromProject(
    objectId: string,
    project: ActiveProjectModel,
  ): ObjectPackage;
  listObjects(): readonly ObjectPackage[];
  getEvents(objectId?: string): readonly ObjectEvent[];
  getHistory(objectId?: string): readonly ObjectEvent[];
};

function nextVersion(previous: string): string {
  const parts = previous.split('.').map(Number);
  const major = parts[0] ?? 1;
  const minor = parts[1] ?? 0;
  const patch = (parts[2] ?? 0) + 1;
  return `${major}.${minor}.${patch}`;
}

function emptyContent(): {
  media: ObjectPackage['media'];
  layouts: ObjectPackage['layouts'];
  knowledge: ObjectPackage['knowledge'];
} {
  return {
    media: { hero: [], photographs: [], video: [] },
    layouts: { svg: [], floorplan: [], csvRooms: [], csvImages: [] },
    knowledge: [],
  };
}

/**
 * ObjectService (EPIC-BLD-08).
 * Application layer for Object Package authoring.
 * No Runtime / Build / Publish logic.
 */
export function createObjectService(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
}): ObjectService {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const objects = new Map<string, ObjectPackage>();
  const events: ObjectEvent[] = [];

  const pushEvent = (
    type: ObjectEvent['type'],
    objectId: string,
    projectId: string,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('object-event'),
      type,
      objectId,
      projectId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requireObject = (objectId: string): ObjectPackage => {
    const current = objects.get(objectId);
    if (current === undefined) {
      throw new Error(`ObjectPackage not found: ${objectId}`);
    }
    return current;
  };

  const write = (next: ObjectPackage): ObjectPackage => {
    objects.set(next.objectId, next);
    return next;
  };

  return {
    createObject(input) {
      const stamp = now().toISOString();
      const objectId = `object-${input.projectId}`;
      if (objects.has(objectId)) {
        return requireObject(objectId);
      }
      const content = emptyContent();
      const created: ObjectPackage = {
        objectId,
        projectId: input.projectId,
        metadata: {
          name: input.name.trim(),
          objectType: input.objectType ?? 'house',
          location: input.location?.trim() || 'Neuvedeno',
          status: 'Draft',
          description: input.description?.trim() || '',
          tags: [...(input.tags ?? [])],
        },
        media: content.media,
        layouts: content.layouts,
        knowledge: content.knowledge,
        modules: [...(input.modules ?? DEFAULT_OBJECT_MODULES)],
        tags: [...(input.tags ?? [])],
        version: '1.0.0',
        timestamps: { createdAt: stamp, updatedAt: stamp },
      };
      write(created);
      pushEvent(
        'ObjectCreated',
        created.objectId,
        created.projectId,
        `Object ${created.metadata.name} created`,
      );
      return created;
    },

    loadObject(objectId) {
      return objects.get(objectId) ?? null;
    },

    loadObjectByProject(projectId) {
      const canonical = objects.get(`object-${projectId}`);
      if (canonical !== undefined) {
        return canonical;
      }
      return (
        Array.from(objects.values()).find(
          (item) => item.projectId === projectId,
        ) ?? null
      );
    },

    updateObject(objectId, patch) {
      const current = requireObject(objectId);
      const updatedAt = now().toISOString();
      const next: ObjectPackage = {
        ...current,
        metadata: {
          name: patch.name?.trim() ?? current.metadata.name,
          objectType: patch.objectType ?? current.metadata.objectType,
          location: patch.location?.trim() ?? current.metadata.location,
          status: patch.status ?? current.metadata.status,
          description:
            patch.description !== undefined
              ? patch.description.trim()
              : current.metadata.description,
          tags:
            patch.tags !== undefined
              ? [...patch.tags]
              : current.metadata.tags,
        },
        tags:
          patch.tags !== undefined ? [...patch.tags] : current.tags,
        version: nextVersion(current.version),
        timestamps: {
          createdAt: current.timestamps.createdAt,
          updatedAt,
        },
      };
      write(next);
      pushEvent(
        'MetadataChanged',
        next.objectId,
        next.projectId,
        'Object metadata updated',
      );
      pushEvent(
        'ObjectUpdated',
        next.objectId,
        next.projectId,
        `Object updated to v${next.version}`,
      );
      return next;
    },

    saveObject(objectId) {
      const current = requireObject(objectId);
      const updatedAt = now().toISOString();
      const next: ObjectPackage = {
        ...current,
        version: nextVersion(current.version),
        timestamps: {
          createdAt: current.timestamps.createdAt,
          updatedAt,
        },
      };
      write(next);
      pushEvent(
        'ObjectUpdated',
        next.objectId,
        next.projectId,
        `Object saved as v${next.version}`,
      );
      return next;
    },

    duplicateObject(objectId) {
      const source = requireObject(objectId);
      const stamp = now().toISOString();
      const copyId = createId(`object-${source.projectId}-copy`);
      const copy: ObjectPackage = {
        ...source,
        objectId: copyId,
        metadata: {
          ...source.metadata,
          name: `${source.metadata.name} Copy`,
          status: 'Draft',
        },
        version: '1.0.0',
        timestamps: { createdAt: stamp, updatedAt: stamp },
      };
      write(copy);
      pushEvent(
        'ObjectCreated',
        copy.objectId,
        copy.projectId,
        `Object duplicated from ${objectId}`,
      );
      return copy;
    },

    archiveObject(objectId) {
      return this.updateObject(objectId, { status: 'Archived' });
    },

    assignModule(objectId, moduleId) {
      const current = requireObject(objectId);
      if (current.modules.includes(moduleId)) {
        return current;
      }
      const updatedAt = now().toISOString();
      const next: ObjectPackage = {
        ...current,
        modules: [...current.modules, moduleId],
        version: nextVersion(current.version),
        timestamps: {
          createdAt: current.timestamps.createdAt,
          updatedAt,
        },
      };
      write(next);
      pushEvent(
        'ModuleAssigned',
        next.objectId,
        next.projectId,
        `Module ${moduleId} assigned`,
      );
      pushEvent(
        'ObjectUpdated',
        next.objectId,
        next.projectId,
        `Object modules updated`,
      );
      return next;
    },

    unassignModule(objectId, moduleId) {
      const current = requireObject(objectId);
      const nextModules = current.modules.filter((id) => id !== moduleId);
      if (nextModules.length === current.modules.length) {
        return current;
      }
      const updatedAt = now().toISOString();
      const next: ObjectPackage = {
        ...current,
        modules: nextModules,
        version: nextVersion(current.version),
        timestamps: {
          createdAt: current.timestamps.createdAt,
          updatedAt,
        },
      };
      write(next);
      pushEvent(
        'ModuleAssigned',
        next.objectId,
        next.projectId,
        `Module ${moduleId} unassigned`,
      );
      pushEvent(
        'ObjectUpdated',
        next.objectId,
        next.projectId,
        `Object modules updated`,
      );
      return next;
    },

    setModules(objectId, modules) {
      const current = requireObject(objectId);
      const unique = Array.from(new Set(modules));
      const updatedAt = now().toISOString();
      const next: ObjectPackage = {
        ...current,
        modules: unique,
        version: nextVersion(current.version),
        timestamps: {
          createdAt: current.timestamps.createdAt,
          updatedAt,
        },
      };
      write(next);
      pushEvent(
        'ModuleAssigned',
        next.objectId,
        next.projectId,
        `Modules set (${unique.length})`,
      );
      pushEvent(
        'ObjectUpdated',
        next.objectId,
        next.projectId,
        `Object modules replaced`,
      );
      return next;
    },


    syncContentFromProject(objectId, project) {
      const current = requireObject(objectId);
      const snapshot = snapshotObjectContent(project);
      const updatedAt = now().toISOString();
      const next = withContentSnapshot(
        {
          ...current,
          timestamps: {
            createdAt: current.timestamps.createdAt,
            updatedAt,
          },
        },
        snapshot,
      );
      write(next);
      return next;
    },

    listObjects() {
      return Array.from(objects.values());
    },

    getEvents(objectId) {
      if (objectId === undefined) {
        return [...events];
      }
      return events.filter((item) => item.objectId === objectId);
    },

    getHistory(objectId) {
      return this.getEvents(objectId);
    },
  };
}
