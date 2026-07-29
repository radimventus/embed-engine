import type {
  RegisterPolicyInput,
  RuntimePolicy,
  RuntimePolicyEvent,
  RuntimePolicyIndexEntry,
  RuntimePolicyPackage,
  RuntimePolicyValidation,
  UpdatePolicyInput,
} from '../../model';
import {
  SEED_POLICIES,
  applyPolicyUpdate,
  createBasicPolicyRegistryStrategy,
  createRuntimePolicyValidator,
  type PolicyRegistryStrategy,
  type RuntimePolicyValidator,
} from './basic-policy-registry-strategy';
import {
  createRuntimePolicyIndex,
  type RuntimePolicyIndex,
} from './runtime-policy-index';

export type RuntimePolicyEngineOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: PolicyRegistryStrategy;
  readonly validator?: RuntimePolicyValidator;
  readonly index?: RuntimePolicyIndex;
  readonly seed?: boolean;
};

/**
 * RuntimePolicyEngine (EPIC-BLD-40).
 * SSOT for Policy definitions — no enforcement, no Runtime mutation.
 */
export type RuntimePolicyEngine = {
  initialize(title?: string): RuntimePolicyPackage;
  registerPolicy(input: RegisterPolicyInput): RuntimePolicyPackage;
  updatePolicy(
    policyId: string,
    patch: UpdatePolicyInput,
  ): RuntimePolicyPackage;
  publishPolicies(): RuntimePolicyPackage;
  listPolicies(): readonly RuntimePolicy[];
  dispose(): RuntimePolicyPackage;
  getPackage(): RuntimePolicyPackage | null;
  getEvents(): readonly RuntimePolicyEvent[];
  getIndex(): readonly RuntimePolicyIndexEntry[];
  validate(): RuntimePolicyValidation;
};

export function createRuntimePolicyEngine(
  options: RuntimePolicyEngineOptions = {},
): RuntimePolicyEngine {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicPolicyRegistryStrategy();
  const validator = options.validator ?? createRuntimePolicyValidator({ now });
  const index = options.index ?? createRuntimePolicyIndex();
  const shouldSeed = options.seed ?? true;

  let current: RuntimePolicyPackage | null = null;
  const events: RuntimePolicyEvent[] = [];

  const emit = (
    type: RuntimePolicyEvent['type'],
    packageId: string,
    policyId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('runtime-policy-event'),
      type,
      packageId,
      policyId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (): RuntimePolicyPackage => {
    if (current === null) {
      throw new Error('Policy package not initialized.');
    }
    return current;
  };

  const store = (pkg: RuntimePolicyPackage): RuntimePolicyPackage => {
    current = pkg;
    index.index(pkg.id, pkg);
    return pkg;
  };

  const buildInitial = (title?: string): RuntimePolicyPackage => {
    const stamp = now().toISOString();
    const registryId = createId('runtime-policy-registry');
    const policies: RuntimePolicy[] = shouldSeed
      ? SEED_POLICIES.map((seed) => ({
          ...seed,
          id: createId('runtime-policy'),
        }))
      : [];
    const pkg: RuntimePolicyPackage = {
      id: createId('runtime-policy-package'),
      version: '1.0.0',
      registry: {
        id: registryId,
        version: '1.0.0',
        policies,
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title: title?.trim() || 'Builder Runtime Policy Registry',
          notes: 'SSOT for platform Policy definitions.',
          status: 'Open',
        },
      },
      createdAt: stamp,
      updatedAt: stamp,
      metadata: {
        title: title?.trim() || 'Builder Runtime Policies',
        notes: 'Read-only Policy registry package.',
        status: 'Draft',
      },
      validation: null,
    };
    for (const policy of policies) {
      emit(
        'PolicyRegistered',
        pkg.id,
        policy.id,
        `Seeded policy ${policy.name} (${policy.metadata.code}).`,
      );
    }
    return store(pkg);
  };

  return {
    initialize(title) {
      if (current !== null && current.metadata.status !== 'Disposed') {
        return current;
      }
      return buildInitial(title);
    },

    registerPolicy(input) {
      const pkg = current ?? buildInitial();
      if (pkg.metadata.status === 'Disposed') {
        throw new Error('Cannot register policy on disposed package.');
      }
      if (!strategy.supports(input)) {
        throw new Error('Policy registry strategy does not support this input.');
      }
      const policy = strategy.register(input, createId);
      const next: RuntimePolicyPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        registry: {
          ...pkg.registry,
          policies: [...pkg.registry.policies, policy],
          updatedAt: now().toISOString(),
        },
      };
      store(next);
      emit(
        'PolicyRegistered',
        next.id,
        policy.id,
        `Registered policy ${policy.name}.`,
      );
      return next;
    },

    updatePolicy(policyId, patch) {
      const pkg = requirePackage();
      if (pkg.metadata.status === 'Disposed') {
        throw new Error('Cannot update policy on disposed package.');
      }
      const existing = pkg.registry.policies.find((item) => item.id === policyId);
      if (!existing) {
        throw new Error(`Policy not found: ${policyId}`);
      }
      const updated = applyPolicyUpdate(existing, patch);
      const next: RuntimePolicyPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        registry: {
          ...pkg.registry,
          policies: pkg.registry.policies.map((item) =>
            item.id === policyId ? updated : item,
          ),
          updatedAt: now().toISOString(),
        },
      };
      store(next);
      emit(
        'PolicyUpdated',
        next.id,
        updated.id,
        `Updated policy ${updated.name}.`,
      );
      return next;
    },

    publishPolicies() {
      const pkg = requirePackage();
      if (pkg.metadata.status === 'Disposed') {
        throw new Error('Cannot publish disposed policy package.');
      }
      const validation = pkg.validation ?? validator.validate(pkg);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid policy package.');
      }
      const registry = strategy.publish(pkg.registry, createId, now);
      const next: RuntimePolicyPackage = {
        ...pkg,
        version: bumpPackageVersion(pkg.version),
        registry,
        validation,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published Policy package for Governance.',
        },
      };
      store(next);
      emit(
        'PolicyPackagePublished',
        next.id,
        null,
        `Published policy package ${next.id} (registry v${registry.version}).`,
      );
      return next;
    },

    listPolicies() {
      return requirePackage().registry.policies;
    },

    dispose() {
      const pkg = requirePackage();
      const next: RuntimePolicyPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        registry: {
          ...pkg.registry,
          updatedAt: now().toISOString(),
          metadata: {
            ...pkg.registry.metadata,
            status: 'Disposed',
            notes: 'Disposed policy registry.',
          },
        },
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed policy package (read-only archive).',
        },
      };
      store(next);
      return next;
    },

    getPackage() {
      return current;
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },

    validate() {
      const pkg = requirePackage();
      const validation = validator.validate(pkg);
      const next: RuntimePolicyPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'PolicyRegistryValidated',
        next.id,
        null,
        validation.valid
          ? 'Policy registry validated.'
          : `Validation failed with ${validation.issues.length} issue(s).`,
      );
      return validation;
    },
  };
}

function bumpPackageVersion(version: string): string {
  const parts = version.split('.').map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return '1.0.1';
  }
  return `${parts[0]}.${parts[1]}.${(parts[2] ?? 0) + 1}`;
}
