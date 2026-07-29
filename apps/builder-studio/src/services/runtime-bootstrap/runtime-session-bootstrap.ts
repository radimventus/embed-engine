import type {
  BuildRuntimeBootstrapInput,
  InitializeRuntimeBootstrapInput,
  RuntimeBootstrapEvent,
  RuntimeBootstrapIndexEntry,
  RuntimeBootstrapPackage,
  RuntimeBootstrapValidation,
  RuntimeSessionModel,
} from '../../model';
import {
  buildInitialRuntimeBootstrapPackage,
  createBasicRuntimeBootstrapStrategy,
  createRuntimeBootstrapValidator,
  type RuntimeBootstrapStrategy,
  type RuntimeBootstrapValidator,
} from './basic-runtime-bootstrap-strategy';
import {
  createRuntimeBootstrapIndex,
  type RuntimeBootstrapIndex,
} from './runtime-bootstrap-index';

export type RuntimeSessionBootstrapOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: RuntimeBootstrapStrategy;
  readonly validator?: RuntimeBootstrapValidator;
  readonly index?: RuntimeBootstrapIndex;
};

export type RuntimeSessionBootstrap = {
  initialize(input: InitializeRuntimeBootstrapInput): RuntimeBootstrapPackage;
  build(packageId: string, input: BuildRuntimeBootstrapInput): RuntimeBootstrapPackage;
  validate(packageId: string): RuntimeBootstrapValidation;
  publish(packageId: string): RuntimeBootstrapPackage;
  dispose(packageId: string): RuntimeBootstrapPackage;
  getPackage(packageId: string): RuntimeBootstrapPackage | null;
  listPackages(): readonly RuntimeBootstrapPackage[];
  listRuntimeBootstraps(): readonly RuntimeSessionModel[];
  findRuntimeBootstrap(publicationId: string): RuntimeSessionModel | null;
  getEvents(): readonly RuntimeBootstrapEvent[];
  getIndex(): readonly RuntimeBootstrapIndexEntry[];
};

export function createRuntimeSessionBootstrap(
  options: RuntimeSessionBootstrapOptions = {},
): RuntimeSessionBootstrap {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicRuntimeBootstrapStrategy();
  const validator =
    options.validator ?? createRuntimeBootstrapValidator({ now });
  const index = options.index ?? createRuntimeBootstrapIndex();

  const packages = new Map<string, RuntimeBootstrapPackage>();
  const events: RuntimeBootstrapEvent[] = [];

  const emit = (
    type: RuntimeBootstrapEvent['type'],
    packageId: string,
    runtimeSessionId: string | null,
    publicationId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('runtime-bootstrap-event'),
      type,
      packageId,
      runtimeSessionId,
      publicationId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): RuntimeBootstrapPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Runtime bootstrap package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: RuntimeBootstrapPackage): RuntimeBootstrapPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) {
        throw new Error('Runtime session bootstrap requires sessionId.');
      }
      let pkg = store(buildInitialRuntimeBootstrapPackage(input, createId, now));
      if (input.bootstrap !== undefined) {
        pkg = this.build(pkg.id, input.bootstrap);
      }
      return pkg;
    },

    build(packageId, input) {
      const pkg = requirePackage(packageId);
      if (pkg.metadata.status === 'Disposed') {
        throw new Error('Cannot build Runtime bootstrap in disposed package.');
      }
      if (!strategy.supports(input)) {
        throw new Error('Runtime bootstrap strategy does not support this input.');
      }
      const next: RuntimeBootstrapPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        runtimeSession: strategy.build(input, createId),
        validation: null,
        metadata: {
          ...pkg.metadata,
          title: input.title?.trim() || pkg.metadata.title,
          status: 'Active',
          notes: 'Built Runtime bootstrap package.',
        },
      };
      store(next);
      emit(
        'RuntimeBootstrapCreated',
        next.id,
        next.runtimeSession.id,
        next.runtimeSession.publicationId,
        `Built bootstrap for ${next.runtimeSession.publicationId}.`,
      );
      return next;
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const nextSession: RuntimeSessionModel = {
        ...pkg.runtimeSession,
        metadata: {
          ...pkg.runtimeSession.metadata,
          sessionState: validation.valid ? 'Validated' : 'Prepared',
        },
      };
      const next: RuntimeBootstrapPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        runtimeSession: nextSession,
        validation,
        metadata: {
          ...pkg.metadata,
          status: 'Active',
          notes: validation.valid
            ? 'Runtime bootstrap validated.'
            : 'Runtime bootstrap validation failed.',
        },
      };
      store(next);
      emit(
        validation.valid
          ? 'RuntimeBootstrapValidated'
          : 'RuntimeBootstrapFailed',
        next.id,
        next.runtimeSession.id,
        next.runtimeSession.publicationId,
        validation.valid
          ? `Validated runtime bootstrap ${next.runtimeSession.publicationId}.`
          : `Runtime bootstrap failed for ${next.runtimeSession.publicationId}.`,
      );
      return validation;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      const validation = pkg.validation ?? this.validate(packageId);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid Runtime bootstrap package.');
      }
      const next: RuntimeBootstrapPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        runtimeSession: strategy.publish(pkg.runtimeSession),
        validation,
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published Runtime bootstrap package.',
        },
      };
      store(next);
      emit(
        'RuntimeBootstrapPublished',
        next.id,
        next.runtimeSession.id,
        next.runtimeSession.publicationId,
        `Published runtime bootstrap ${next.runtimeSession.publicationId}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: RuntimeBootstrapPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed Runtime bootstrap package (read-only archive).',
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

    listRuntimeBootstraps() {
      return [...packages.values()].map((pkg) => pkg.runtimeSession);
    },

    findRuntimeBootstrap(publicationId) {
      return (
        [...packages.values()].find(
          (pkg) => pkg.runtimeSession.publicationId === publicationId,
        )?.runtimeSession ?? null
      );
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
