import type {
  CollectManifestInput,
  RuntimeCapabilityDescriptor,
  RuntimeManifestEvent,
  RuntimeManifestIndexEntry,
  RuntimeManifestPackage,
  RuntimeManifestValidation,
} from '../../model';
import {
  createBasicRuntimeManifestStrategy,
  createRuntimeManifestValidator,
  type RuntimeManifestStrategy,
  type RuntimeManifestValidator,
} from './basic-runtime-manifest-strategy';
import {
  createRuntimeManifestIndex,
  type RuntimeManifestIndex,
} from './runtime-manifest-index';

export type RuntimeManifestEngineOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: RuntimeManifestStrategy;
  readonly validator?: RuntimeManifestValidator;
  readonly index?: RuntimeManifestIndex;
};

/**
 * RuntimeManifestEngine (EPIC-BLD-50).
 * Declarative manifest of published Runtime capabilities.
 */
export type RuntimeManifestEngine = {
  initialize(input: CollectManifestInput): RuntimeManifestPackage;
  collect(input: CollectManifestInput): CollectManifestInput;
  generate(input: CollectManifestInput): RuntimeManifestPackage;
  publish(packageId: string): RuntimeManifestPackage;
  dispose(packageId: string): RuntimeManifestPackage;
  getPackage(packageId: string): RuntimeManifestPackage | null;
  listPackages(): readonly RuntimeManifestPackage[];
  listCapabilities(packageId?: string): readonly RuntimeCapabilityDescriptor[];
  getEvents(): readonly RuntimeManifestEvent[];
  getIndex(): readonly RuntimeManifestIndexEntry[];
  validate(packageId: string): RuntimeManifestValidation;
};

export function createRuntimeManifestEngine(
  options: RuntimeManifestEngineOptions = {},
): RuntimeManifestEngine {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicRuntimeManifestStrategy();
  const validator =
    options.validator ?? createRuntimeManifestValidator({ now });
  const index = options.index ?? createRuntimeManifestIndex();

  const packages = new Map<string, RuntimeManifestPackage>();
  const events: RuntimeManifestEvent[] = [];

  const emit = (
    type: RuntimeManifestEvent['type'],
    packageId: string,
    manifestId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('runtime-manifest-event'),
      type,
      packageId,
      manifestId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): RuntimeManifestPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Manifest package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: RuntimeManifestPackage): RuntimeManifestPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const buildPackage = (
    input: CollectManifestInput,
  ): RuntimeManifestPackage => {
    if (!strategy.supports(input)) {
      throw new Error('Manifest strategy does not support this input.');
    }
    const collected = strategy.collect(input);
    const manifest = strategy.generate(collected, createId, now);
    const stamp = now().toISOString();
    const pkg: RuntimeManifestPackage = {
      id: createId('runtime-manifest-package'),
      version: '1.0.0',
      manifest,
      createdAt: stamp,
      updatedAt: stamp,
      metadata: {
        title: manifest.metadata.title,
        sessionId: manifest.metadata.sessionId,
        notes: 'Runtime Manifest package — declarative description only.',
        status: 'Draft',
      },
      validation: null,
    };
    store(pkg);
    emit(
      'RuntimeManifestGenerated',
      pkg.id,
      manifest.id,
      `Generated manifest ${manifest.id} with ${manifest.capabilities.length} capability(ies).`,
    );
    return pkg;
  };

  return {
    initialize(input) {
      return buildPackage(input);
    },

    collect(input) {
      return strategy.collect(input);
    },

    generate(input) {
      this.collect(input);
      return buildPackage(input);
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: RuntimeManifestPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'RuntimeManifestValidated',
        next.id,
        next.manifest.id,
        validation.valid
          ? 'Manifest package validated.'
          : `Validation failed with ${validation.issues.length} issue(s).`,
      );
      return validation;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      const validation = pkg.validation ?? validator.validate(pkg);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid manifest package.');
      }
      const next: RuntimeManifestPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published Runtime Manifest (declarative only).',
        },
      };
      store(next);
      emit(
        'RuntimeManifestPublished',
        next.id,
        next.manifest.id,
        `Published manifest package ${next.id}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: RuntimeManifestPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed manifest package (read-only archive).',
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

    listCapabilities(packageId) {
      if (packageId === undefined) {
        return [...packages.values()].flatMap(
          (item) => item.manifest.capabilities,
        );
      }
      return requirePackage(packageId).manifest.capabilities;
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
