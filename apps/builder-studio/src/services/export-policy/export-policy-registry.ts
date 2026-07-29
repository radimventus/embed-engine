import type {
  ExportPolicy,
  ExportPolicyEvent,
  ExportPolicyEventType,
  ExportPolicyIndexEntry,
  ExportPolicyPackage,
  ExportPolicyValidation,
  InitializeExportPolicyRegistryInput,
  RegisterExportPolicyInput,
} from '../../model';
import {
  createBasicExportPolicyStrategy,
  type ExportPolicyStrategy,
} from './basic-export-policy-strategy';
import {
  createBasicExportPolicyValidator,
  type ExportPolicyValidator,
} from './basic-export-policy-validator';
import {
  createExportPolicyIndex,
  type ExportPolicyIndex,
} from './export-policy-index';

export type ExportPolicyRegistryOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: ExportPolicyStrategy;
  readonly validator?: ExportPolicyValidator;
  readonly index?: ExportPolicyIndex;
};

export type ExportPolicyRegistry = {
  initialize(input: InitializeExportPolicyRegistryInput): ExportPolicyPackage;
  register(packageId: string, input: RegisterExportPolicyInput): ExportPolicyPackage;
  find(policyName: string): readonly ExportPolicy[];
  list(): readonly ExportPolicy[];
  validate(packageId: string): ExportPolicyValidation;
  deprecate(packageId: string, policyId: string): ExportPolicyPackage;
  remove(packageId: string, policyId: string): ExportPolicyPackage;
  dispose(packageId: string): ExportPolicyPackage;
  getPackage(packageId: string): ExportPolicyPackage | null;
  listPackages(): readonly ExportPolicyPackage[];
  getEvents(): readonly ExportPolicyEvent[];
  getIndex(): readonly ExportPolicyIndexEntry[];
};

export function createExportPolicyRegistry(
  options: ExportPolicyRegistryOptions = {},
): ExportPolicyRegistry {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicExportPolicyStrategy();
  const validator = options.validator ?? createBasicExportPolicyValidator();
  const index = options.index ?? createExportPolicyIndex();

  const packages = new Map<string, ExportPolicyPackage>();
  const events: ExportPolicyEvent[] = [];

  const emit = (
    type: ExportPolicyEventType,
    packageId: string,
    policyId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('export-policy-event'),
      type,
      packageId,
      policyId,
      at: now().toISOString(),
      message,
    });
  };

  const req = (packageId: string): ExportPolicyPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Export policy package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: ExportPolicyPackage): ExportPolicyPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const buildInitialPackage = (
    input: InitializeExportPolicyRegistryInput,
  ): ExportPolicyPackage => {
    const stamp = now().toISOString();
    return {
      id: createId('export-policy-package'),
      version: '1.0.0',
      policies: [],
      createdAt: stamp,
      updatedAt: stamp,
      metadata: {
        title: input.title?.trim() || `Export Policies ${input.sessionId}`,
        sessionId: input.sessionId,
        notes: 'Export policy registry package.',
        status: 'Draft',
      },
      validation: null,
    };
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) {
        throw new Error('Export policy registry requires sessionId.');
      }
      let pkg = store(buildInitialPackage(input));
      if (input.policy) {
        pkg = this.register(pkg.id, input.policy);
      }
      return pkg;
    },

    register(packageId, input) {
      const pkg = req(packageId);
      if (!strategy.supports(input)) {
        throw new Error('Export policy strategy does not support this input.');
      }
      const policy = strategy.register(input, () => createId('export-policy'));
      const next: ExportPolicyPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        policies: [...pkg.policies, policy],
        validation: null,
        metadata: {
          ...pkg.metadata,
          status: 'Active',
          notes: `Registered policy "${policy.name}".`,
        },
      };
      store(next);
      emit(
        'ExportPolicyRegistered',
        next.id,
        policy.id,
        `Registered policy ${policy.name}.`,
      );
      return next;
    },

    find(policyName) {
      return [...packages.values()]
        .flatMap((p) => p.policies)
        .filter((p) => p.name === policyName);
    },

    list() {
      return [...packages.values()].flatMap((p) => p.policies);
    },

    validate(packageId) {
      const pkg = req(packageId);
      const validation = validator.validate(pkg.policies);
      const next: ExportPolicyPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        validation,
        metadata: {
          ...pkg.metadata,
          notes: validation.valid
            ? 'Export policy registry validated.'
            : 'Export policy registry validation failed.',
        },
      };
      store(next);
      emit(
        'ExportPolicyValidated',
        next.id,
        null,
        validation.valid ? 'Validated export policies.' : 'Invalid export policies.',
      );
      return validation;
    },

    deprecate(packageId, policyId) {
      const pkg = req(packageId);
      const next: ExportPolicyPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        policies: pkg.policies.map((policy) =>
          policy.id === policyId
            ? { ...policy, status: 'Deprecated' as const }
            : policy,
        ),
        validation: null,
      };
      store(next);
      emit('ExportPolicyDeprecated', next.id, policyId, `Deprecated policy ${policyId}.`);
      return next;
    },

    remove(packageId, policyId) {
      const pkg = req(packageId);
      const next: ExportPolicyPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        policies: pkg.policies.map((policy) =>
          policy.id === policyId
            ? { ...policy, status: 'Removed' as const }
            : policy,
        ),
        validation: null,
      };
      store(next);
      emit('ExportPolicyRemoved', next.id, policyId, `Removed policy ${policyId}.`);
      return next;
    },

    dispose(packageId) {
      const pkg = req(packageId);
      const next: ExportPolicyPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed export policy registry package.',
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

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}

