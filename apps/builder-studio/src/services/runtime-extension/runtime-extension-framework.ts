import type {
  InitializeExtensionInput,
  RegisterRuntimeExtensionInput,
  RuntimeExtension,
  RuntimeExtensionEvent,
  RuntimeExtensionIndexEntry,
  RuntimeExtensionPackage,
  RuntimeExtensionValidation,
} from '../../model';
import {
  buildInitialExtensionRegistry,
  createBasicRuntimeExtensionStrategy,
  createRuntimeExtensionValidator,
  type RuntimeExtensionStrategy,
  type RuntimeExtensionValidator,
} from './basic-runtime-extension-strategy';
import {
  createRuntimeExtensionIndex,
  type RuntimeExtensionIndex,
} from './runtime-extension-index';

export type RuntimeExtensionFrameworkOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: RuntimeExtensionStrategy;
  readonly validator?: RuntimeExtensionValidator;
  readonly index?: RuntimeExtensionIndex;
};

/**
 * RuntimeExtensionFramework (EPIC-BLD-54).
 * Extension registry management — no Runtime mutation or dynamic loading.
 */
export type RuntimeExtensionFramework = {
  initialize(input: InitializeExtensionInput): RuntimeExtensionPackage;
  register(
    packageId: string,
    input: RegisterRuntimeExtensionInput,
  ): RuntimeExtensionPackage;
  enable(packageId: string, extensionId: string): RuntimeExtensionPackage;
  disable(packageId: string, extensionId: string): RuntimeExtensionPackage;
  publish(packageId: string): RuntimeExtensionPackage;
  dispose(packageId: string): RuntimeExtensionPackage;
  getPackage(packageId: string): RuntimeExtensionPackage | null;
  listPackages(): readonly RuntimeExtensionPackage[];
  listExtensions(packageId?: string): readonly RuntimeExtension[];
  find(packageId: string, capability: string): readonly RuntimeExtension[];
  getEvents(): readonly RuntimeExtensionEvent[];
  getIndex(): readonly RuntimeExtensionIndexEntry[];
  validate(packageId: string): RuntimeExtensionValidation;
};

export function createRuntimeExtensionFramework(
  options: RuntimeExtensionFrameworkOptions = {},
): RuntimeExtensionFramework {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy =
    options.strategy ?? createBasicRuntimeExtensionStrategy();
  const validator =
    options.validator ?? createRuntimeExtensionValidator({ now });
  const index = options.index ?? createRuntimeExtensionIndex();

  const packages = new Map<string, RuntimeExtensionPackage>();
  const events: RuntimeExtensionEvent[] = [];

  const emit = (
    type: RuntimeExtensionEvent['type'],
    packageId: string,
    registryId: string | null,
    extensionId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('runtime-extension-event'),
      type,
      packageId,
      registryId,
      extensionId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): RuntimeExtensionPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Extension package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: RuntimeExtensionPackage): RuntimeExtensionPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const updateExtensions = (
    pkg: RuntimeExtensionPackage,
    extensions: readonly RuntimeExtension[],
  ): RuntimeExtensionPackage => ({
    ...pkg,
    updatedAt: now().toISOString(),
    registry: {
      ...pkg.registry,
      extensions,
      generatedAt: now().toISOString(),
    },
    validation: null,
  });

  const registerInto = (
    packageId: string,
    input: RegisterRuntimeExtensionInput,
  ): RuntimeExtensionPackage => {
    const pkg = requirePackage(packageId);
    if (pkg.metadata.status === 'Disposed') {
      throw new Error('Cannot register into disposed extension package.');
    }
    if (!strategy.supports(input)) {
      throw new Error('Extension strategy does not support this input.');
    }
    const extension = strategy.register(input, createId);
    const withoutDup = pkg.registry.extensions.filter(
      (item) =>
        !(
          item.name === extension.name &&
          item.capability === extension.capability &&
          item.version === extension.version
        ),
    );
    const next = updateExtensions(pkg, [...withoutDup, extension]);
    store(next);
    emit(
      'RuntimeExtensionRegistered',
      next.id,
      next.registry.id,
      extension.id,
      `Registered extension ${extension.name} v${extension.version}.`,
    );
    return next;
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) {
        throw new Error('Extension framework requires sessionId.');
      }
      const stamp = now().toISOString();
      const registry = buildInitialExtensionRegistry(input, createId, now);
      const pkg: RuntimeExtensionPackage = {
        id: createId('runtime-extension-package'),
        version: '1.0.0',
        registry,
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title: registry.metadata.title,
          sessionId: registry.metadata.sessionId,
          notes: 'Runtime Extension package — registry only.',
          status: 'Draft',
        },
        validation: null,
      };
      let current = store(pkg);
      for (const extension of input.extensions ?? []) {
        current = registerInto(current.id, extension);
      }
      return current;
    },

    register(packageId, input) {
      return registerInto(packageId, input);
    },

    enable(packageId, extensionId) {
      const pkg = requirePackage(packageId);
      const extension = pkg.registry.extensions.find(
        (item) => item.id === extensionId,
      );
      if (!extension) {
        throw new Error(`Extension not found: ${extensionId}`);
      }
      const enabled = strategy.enable(extension);
      const next = updateExtensions(
        pkg,
        pkg.registry.extensions.map((item) =>
          item.id === extensionId ? enabled : item,
        ),
      );
      store(next);
      emit(
        'RuntimeExtensionEnabled',
        next.id,
        next.registry.id,
        enabled.id,
        `Enabled extension ${enabled.name}.`,
      );
      return next;
    },

    disable(packageId, extensionId) {
      const pkg = requirePackage(packageId);
      const extension = pkg.registry.extensions.find(
        (item) => item.id === extensionId,
      );
      if (!extension) {
        throw new Error(`Extension not found: ${extensionId}`);
      }
      const disabled = strategy.disable(extension);
      const next = updateExtensions(
        pkg,
        pkg.registry.extensions.map((item) =>
          item.id === extensionId ? disabled : item,
        ),
      );
      store(next);
      emit(
        'RuntimeExtensionDisabled',
        next.id,
        next.registry.id,
        disabled.id,
        `Disabled extension ${disabled.name}.`,
      );
      return next;
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: RuntimeExtensionPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
      };
      store(next);
      return validation;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      const validation = pkg.validation ?? validator.validate(pkg);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid extension package.');
      }
      const extensions = pkg.registry.extensions.map((extension) =>
        extension.status === 'Disabled'
          ? extension
          : {
              ...extension,
              status: 'Published' as const,
            },
      );
      const next: RuntimeExtensionPackage = {
        ...updateExtensions(pkg, extensions),
        validation,
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published Runtime Extension Registry.',
        },
      };
      store(next);
      emit(
        'RuntimeExtensionPublished',
        next.id,
        next.registry.id,
        null,
        `Published extension package ${next.id}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: RuntimeExtensionPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed extension package (read-only archive).',
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

    listExtensions(packageId) {
      if (packageId === undefined) {
        return [...packages.values()].flatMap(
          (item) => item.registry.extensions,
        );
      }
      return requirePackage(packageId).registry.extensions;
    },

    find(packageId, capability) {
      return requirePackage(packageId).registry.extensions.filter(
        (extension) => extension.capability === capability,
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
