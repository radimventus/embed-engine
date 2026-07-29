import type {
  AppendAuditInput,
  RecordAuditInput,
  RuntimeAuditEvent,
  RuntimeAuditIndexEntry,
  RuntimeAuditPackage,
  RuntimeAuditTrail,
  RuntimeAuditValidation,
} from '../../model';
import {
  buildTrail,
  createBasicAuditRecordingStrategy,
  createRuntimeAuditValidator,
  type AuditRecordingStrategy,
  type RuntimeAuditValidator,
} from './basic-audit-recording-strategy';
import {
  createRuntimeAuditIndex,
  type RuntimeAuditIndex,
} from './runtime-audit-index';

export type RuntimeAuditEngineOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: AuditRecordingStrategy;
  readonly validator?: RuntimeAuditValidator;
  readonly index?: RuntimeAuditIndex;
};

/**
 * RuntimeAuditEngine (EPIC-BLD-38).
 * Passive Production Layer — immutable audit trail only.
 */
export type RuntimeAuditEngine = {
  initialize(input: RecordAuditInput): RuntimeAuditPackage;
  record(input: RecordAuditInput): RuntimeAuditPackage;
  append(input: AppendAuditInput): RuntimeAuditPackage;
  finalize(packageId: string): RuntimeAuditPackage;
  publish(packageId: string): RuntimeAuditPackage;
  dispose(packageId: string): RuntimeAuditPackage;
  getPackage(packageId: string): RuntimeAuditPackage | null;
  listPackages(): readonly RuntimeAuditPackage[];
  listTrails(): readonly RuntimeAuditTrail[];
  getEvents(): readonly RuntimeAuditEvent[];
  getIndex(): readonly RuntimeAuditIndexEntry[];
  analyze(packageId: string): RuntimeAuditValidation;
};

export function createRuntimeAuditEngine(
  options: RuntimeAuditEngineOptions = {},
): RuntimeAuditEngine {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicAuditRecordingStrategy();
  const validator = options.validator ?? createRuntimeAuditValidator({ now });
  const index = options.index ?? createRuntimeAuditIndex();

  const packages = new Map<string, RuntimeAuditPackage>();
  const events: RuntimeAuditEvent[] = [];

  const emit = (
    type: RuntimeAuditEvent['type'],
    packageId: string,
    trailId: string | null,
    recordId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('runtime-audit-event'),
      type,
      packageId,
      trailId,
      recordId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): RuntimeAuditPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Audit package not found: ${packageId}`);
    }
    return pkg;
  };

  const assertMutable = (pkg: RuntimeAuditPackage): void => {
    if (pkg.metadata.status === 'Disposed') {
      throw new Error(`Audit package disposed: ${pkg.id}`);
    }
    if (pkg.trail.metadata.status === 'Finalized') {
      throw new Error(`Audit trail finalized (immutable): ${pkg.trail.id}`);
    }
    if (pkg.metadata.status === 'Published') {
      throw new Error(`Audit package published (immutable): ${pkg.id}`);
    }
  };

  const store = (pkg: RuntimeAuditPackage): RuntimeAuditPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const buildPackage = (input: RecordAuditInput): RuntimeAuditPackage => {
    if (!strategy.supports(input)) {
      throw new Error('Audit recording strategy does not support this input.');
    }
    const records = strategy.record(input.sources, input.sessionId, createId);
    const trail = buildTrail(
      input.sessionId,
      records,
      createId,
      now,
      input.title,
    );
    const stamp = now().toISOString();
    const pkg: RuntimeAuditPackage = {
      id: createId('runtime-audit-package'),
      version: '1.0.0',
      trail,
      createdAt: stamp,
      updatedAt: stamp,
      metadata: {
        title: input.title?.trim() || `Runtime Audit ${input.sessionId}`,
        sessionId: input.sessionId,
        notes: 'Immutable Runtime Audit package.',
        status: 'Draft',
        immutable: true,
      },
      validation: null,
    };

    for (const record of records) {
      emit(
        'AuditRecordCreated',
        pkg.id,
        trail.id,
        record.id,
        `Recorded ${record.action} (${record.entity}).`,
      );
    }
    emit(
      'AuditTrailUpdated',
      pkg.id,
      trail.id,
      null,
      `Trail ${trail.id} updated with ${trail.records.length} record(s).`,
    );

    return store(pkg);
  };

  return {
    initialize(input) {
      return buildPackage(input);
    },

    record(input) {
      return buildPackage(input);
    },

    append(input) {
      const pkg = requirePackage(input.packageId);
      assertMutable(pkg);
      if (!strategy.supports({ sources: input.sources })) {
        throw new Error('Audit recording strategy does not support append.');
      }
      const nextRecords = strategy.record(
        input.sources,
        pkg.trail.sessionId,
        createId,
      );
      const merged = [...pkg.trail.records, ...nextRecords].sort((a, b) =>
        a.timestamp.localeCompare(b.timestamp),
      );
      const trail: RuntimeAuditTrail = {
        ...pkg.trail,
        records: merged,
        metadata: {
          ...pkg.trail.metadata,
          notes: 'Audit trail appended (prior records immutable).',
        },
      };
      const next: RuntimeAuditPackage = {
        ...pkg,
        trail,
        updatedAt: now().toISOString(),
      };
      for (const record of nextRecords) {
        emit(
          'AuditRecordCreated',
          next.id,
          trail.id,
          record.id,
          `Appended ${record.action} (${record.entity}).`,
        );
      }
      emit(
        'AuditTrailUpdated',
        next.id,
        trail.id,
        null,
        `Trail ${trail.id} now has ${trail.records.length} record(s).`,
      );
      return store(next);
    },

    finalize(packageId) {
      const pkg = requirePackage(packageId);
      assertMutable(pkg);
      const stamp = now().toISOString();
      const next: RuntimeAuditPackage = {
        ...pkg,
        trail: {
          ...pkg.trail,
          completedAt: stamp,
          metadata: {
            ...pkg.trail.metadata,
            status: 'Finalized',
            notes: 'Audit trail finalized — records immutable.',
          },
        },
        updatedAt: stamp,
      };
      emit(
        'AuditTrailUpdated',
        next.id,
        next.trail.id,
        null,
        `Trail ${next.trail.id} finalized.`,
      );
      return store(next);
    },

    analyze(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: RuntimeAuditPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'AuditValidated',
        next.id,
        next.trail.id,
        null,
        validation.valid
          ? 'Audit package validated.'
          : `Validation failed with ${validation.issues.length} issue(s).`,
      );
      return validation;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      if (pkg.metadata.status === 'Disposed') {
        throw new Error(`Audit package disposed: ${pkg.id}`);
      }
      let working = pkg;
      if (working.trail.metadata.status !== 'Finalized') {
        working = this.finalize(packageId);
      }
      const validation = working.validation ?? validator.validate(working);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid audit package.');
      }
      const next: RuntimeAuditPackage = {
        ...working,
        validation,
        updatedAt: now().toISOString(),
        metadata: {
          ...working.metadata,
          status: 'Published',
          notes: 'Published immutable audit package.',
          immutable: true,
        },
      };
      store(next);
      emit(
        'AuditPublished',
        next.id,
        next.trail.id,
        null,
        `Published audit package ${next.id}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: RuntimeAuditPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed audit package (read-only archive).',
          immutable: true,
        },
      };
      store(next);
      return next;
    },

    getPackage(packageId) {
      return packages.get(packageId) ?? null;
    },

    listPackages() {
      return [...packages.values()];
    },

    listTrails() {
      return [...packages.values()].map((item) => item.trail);
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
