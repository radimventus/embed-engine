import type {
  AddLearningRecordRefInput,
  CreateLearningRecordsPackageInput,
  LearningPackageManagerEvent,
  LearningRecordsPackage,
} from '../../model';
import { createLearningIndex, type LearningIndex } from './learning-index';
import {
  createLearningPackageValidator,
  type LearningPackageValidator,
} from './learning-package-validator';

const MAX_HISTORY = 40;

export type LearningPackageManager = {
  createPackage(input?: CreateLearningRecordsPackageInput): LearningRecordsPackage;
  loadPackage(packageId: string): LearningRecordsPackage | null;
  savePackage(pkg: LearningRecordsPackage): LearningRecordsPackage;
  addRecord(input: AddLearningRecordRefInput): LearningRecordsPackage;
  removeRecord(packageId: string, recordId: string): LearningRecordsPackage;
  publishPackage(packageId: string): LearningRecordsPackage;
  validatePackage(packageId: string): LearningRecordsPackage;
  dispose(packageId: string): LearningRecordsPackage;
  listRecords(packageId: string): LearningRecordsPackage['records'];
  getIndex(): LearningIndex;
  getEvents(packageId?: string): readonly LearningPackageManagerEvent[];
  getHistory(packageId?: string): readonly LearningPackageManagerEvent[];
  list(): readonly LearningRecordsPackage[];
};

/**
 * LearningPackageManager (EPIC-BLD-23).
 * Storage and versioning of Learning Record references — no AI/patterns.
 */
export function createLearningPackageManager(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
  readonly index?: LearningIndex;
  readonly validator?: LearningPackageValidator;
}): LearningPackageManager {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const index = options?.index ?? createLearningIndex();
  const validator = options?.validator ?? createLearningPackageValidator({ now });
  const packages = new Map<string, LearningRecordsPackage>();
  const events: LearningPackageManagerEvent[] = [];

  const pushEvent = (
    type: LearningPackageManagerEvent['type'],
    packageId: string,
    recordId: string | null,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('lpm-event'),
      type,
      packageId,
      recordId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requirePackage = (packageId: string): LearningRecordsPackage => {
    const current = packages.get(packageId);
    if (current === undefined) {
      throw new Error(`LearningRecordsPackage not found: ${packageId}`);
    }
    return current;
  };

  const write = (next: LearningRecordsPackage): LearningRecordsPackage => {
    packages.set(next.id, next);
    index.index(next.id, next.records);
    return next;
  };

  const bumpVersion = (
    current: LearningRecordsPackage,
    change: string,
    author: string,
  ): LearningRecordsPackage => {
    const stamp = now().toISOString();
    const parts = current.version.split('.').map((part) => Number(part));
    const major = parts[0] ?? 0;
    const minor = parts[1] ?? 1;
    const patch = (parts[2] ?? 0) + 1;
    const version = `${major}.${minor}.${patch}`;
    return {
      ...current,
      version,
      updatedAt: stamp,
      versions: [
        ...current.versions,
        {
          version,
          createdAt: stamp,
          author,
          changes: [change],
          metadata: { notes: change },
        },
      ],
    };
  };

  return {
    createPackage(input) {
      const stamp = now().toISOString();
      const id = createId('learning-records-package');
      const version = '0.1.0';
      const created: LearningRecordsPackage = {
        id,
        name: input?.name?.trim() || 'Learning Package',
        version,
        createdAt: stamp,
        updatedAt: stamp,
        records: [],
        versions: [
          {
            version,
            createdAt: stamp,
            author: input?.author?.trim() || 'builder',
            changes: ['Package created'],
            metadata: { notes: 'Initial version' },
          },
        ],
        metadata: {
          title: input?.title?.trim() || 'Learning Package',
          description:
            input?.description?.trim() ||
            'Versioned Learning Record references — no patterns or AI.',
          status: 'Draft',
        },
        validation: null,
      };
      write(created);
      pushEvent(
        'LearningPackageCreated',
        created.id,
        null,
        `Created package ${created.name}`,
      );
      return created;
    },

    loadPackage(packageId) {
      return packages.get(packageId) ?? null;
    },

    savePackage(pkg) {
      const stamp = now().toISOString();
      const next: LearningRecordsPackage = {
        ...pkg,
        updatedAt: stamp,
      };
      return write(next);
    },

    addRecord(input) {
      const current = requirePackage(input.packageId);
      if (current.metadata.status === 'Disposed') {
        throw new Error(`Cannot add record to disposed package: ${input.packageId}`);
      }
      if (current.records.some((ref) => ref.recordId === input.recordId)) {
        return current;
      }
      const stamp = now().toISOString();
      const ref = {
        id: createId('learning-record-ref'),
        recordId: input.recordId,
        source: input.source?.trim() || 'learning-pipeline',
        timestamp: stamp,
        metadata: {
          note: input.note?.trim() || 'Learning Record reference',
        },
      };
      let next: LearningRecordsPackage = {
        ...current,
        records: [...current.records, ref],
        updatedAt: stamp,
      };
      next = bumpVersion(next, `Added record ${input.recordId}`, 'builder');
      write(next);
      pushEvent(
        'LearningRecordAdded',
        next.id,
        input.recordId,
        `Added record reference ${input.recordId}`,
      );
      return next;
    },

    removeRecord(packageId, recordId) {
      const current = requirePackage(packageId);
      if (current.metadata.status === 'Disposed') {
        throw new Error(`Cannot remove record from disposed package: ${packageId}`);
      }
      let next: LearningRecordsPackage = {
        ...current,
        records: current.records.filter((ref) => ref.recordId !== recordId),
        updatedAt: now().toISOString(),
      };
      next = bumpVersion(next, `Removed record ${recordId}`, 'builder');
      write(next);
      pushEvent(
        'LearningRecordRemoved',
        next.id,
        recordId,
        `Removed record reference ${recordId}`,
      );
      return next;
    },

    publishPackage(packageId) {
      const current = requirePackage(packageId);
      if (current.metadata.status === 'Disposed') {
        throw new Error(`Cannot publish disposed package: ${packageId}`);
      }
      const validation = validator.validate(current);
      let next: LearningRecordsPackage = {
        ...current,
        metadata: {
          ...current.metadata,
          status: validation.valid ? 'Published' : current.metadata.status,
        },
        validation,
        updatedAt: now().toISOString(),
      };
      if (validation.valid) {
        next = bumpVersion(next, 'Package published', 'builder');
      }
      write(next);
      pushEvent(
        'LearningPackageValidated',
        next.id,
        null,
        validation.valid
          ? 'Package validated'
          : `Validation failed (${validation.issues.length} issues)`,
      );
      if (validation.valid) {
        pushEvent(
          'LearningPackagePublished',
          next.id,
          null,
          `Published package ${next.name} @ ${next.version}`,
        );
      }
      return next;
    },

    validatePackage(packageId) {
      const current = requirePackage(packageId);
      const validation = validator.validate(current);
      const next: LearningRecordsPackage = {
        ...current,
        validation,
        updatedAt: now().toISOString(),
      };
      write(next);
      pushEvent(
        'LearningPackageValidated',
        next.id,
        null,
        validation.valid
          ? 'Package validated'
          : `Validation failed (${validation.issues.length} issues)`,
      );
      return next;
    },

    dispose(packageId) {
      const current = requirePackage(packageId);
      const next: LearningRecordsPackage = {
        ...current,
        metadata: {
          ...current.metadata,
          status: 'Disposed',
        },
        updatedAt: now().toISOString(),
      };
      write(next);
      return next;
    },

    listRecords(packageId) {
      return requirePackage(packageId).records;
    },

    getIndex() {
      return index;
    },

    getEvents(packageId) {
      if (packageId === undefined) {
        return [...events];
      }
      return events.filter((item) => item.packageId === packageId);
    },

    getHistory(packageId) {
      return this.getEvents(packageId);
    },

    list() {
      return Array.from(packages.values());
    },
  };
}
