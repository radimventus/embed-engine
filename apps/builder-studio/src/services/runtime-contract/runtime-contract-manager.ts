import type {
  InitializeContractInput,
  RegisterRuntimeContractInput,
  RuntimeContract,
  RuntimeContractEvent,
  RuntimeContractIndexEntry,
  RuntimeContractPackage,
  RuntimeContractValidation,
} from '../../model';
import {
  buildEmptyContractPackage,
  createBasicRuntimeContractStrategy,
  createRuntimeContractValidator,
  type RuntimeContractStrategy,
  type RuntimeContractValidator,
} from './basic-runtime-contract-strategy';
import {
  createRuntimeContractIndex,
  type RuntimeContractIndex,
} from './runtime-contract-index';

export type RuntimeContractManagerOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: RuntimeContractStrategy;
  readonly validator?: RuntimeContractValidator;
  readonly index?: RuntimeContractIndex;
};

/**
 * RuntimeContractManager (EPIC-BLD-53).
 * Public contract management — no Runtime mutation or API routing.
 */
export type RuntimeContractManager = {
  initialize(input: InitializeContractInput): RuntimeContractPackage;
  register(
    packageId: string,
    input: RegisterRuntimeContractInput,
  ): RuntimeContractPackage;
  publish(packageId: string): RuntimeContractPackage;
  validate(packageId: string): RuntimeContractValidation;
  dispose(packageId: string): RuntimeContractPackage;
  deprecate(
    packageId: string,
    contractId: string,
  ): RuntimeContractPackage;
  getPackage(packageId: string): RuntimeContractPackage | null;
  listPackages(): readonly RuntimeContractPackage[];
  listContracts(packageId?: string): readonly RuntimeContract[];
  find(
    packageId: string,
    capability: string,
  ): readonly RuntimeContract[];
  getEvents(): readonly RuntimeContractEvent[];
  getIndex(): readonly RuntimeContractIndexEntry[];
};

export function createRuntimeContractManager(
  options: RuntimeContractManagerOptions = {},
): RuntimeContractManager {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicRuntimeContractStrategy();
  const validator =
    options.validator ?? createRuntimeContractValidator({ now });
  const index = options.index ?? createRuntimeContractIndex();

  const packages = new Map<string, RuntimeContractPackage>();
  const events: RuntimeContractEvent[] = [];

  const emit = (
    type: RuntimeContractEvent['type'],
    packageId: string,
    contractId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('runtime-contract-event'),
      type,
      packageId,
      contractId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): RuntimeContractPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Contract package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: RuntimeContractPackage): RuntimeContractPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const registerInto = (
    packageId: string,
    input: RegisterRuntimeContractInput,
  ): RuntimeContractPackage => {
    const pkg = requirePackage(packageId);
    if (pkg.metadata.status === 'Disposed') {
      throw new Error('Cannot register into disposed contract package.');
    }
    if (!strategy.supports(input)) {
      throw new Error('Contract strategy does not support this input.');
    }
    const contract = strategy.register(input, createId);
    const withoutDup = pkg.contracts.filter(
      (item) =>
        !(
          item.capability === contract.capability &&
          item.version === contract.version
        ),
    );
    const next: RuntimeContractPackage = {
      ...pkg,
      updatedAt: now().toISOString(),
      contracts: [...withoutDup, contract],
      validation: null,
    };
    store(next);
    emit(
      'RuntimeContractRegistered',
      next.id,
      contract.id,
      `Registered contract ${contract.name} v${contract.version} for ${contract.capability}.`,
    );
    return next;
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) {
        throw new Error('Contract manager requires sessionId.');
      }
      let current = store(buildEmptyContractPackage(input, createId, now));
      for (const contract of input.contracts ?? []) {
        current = registerInto(current.id, contract);
      }
      return current;
    },

    register(packageId, input) {
      return registerInto(packageId, input);
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: RuntimeContractPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'RuntimeContractValidated',
        next.id,
        null,
        validation.valid
          ? 'Contract package validated.'
          : `Validation failed with ${validation.issues.length} issue(s).`,
      );
      return validation;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      const validation = pkg.validation ?? validator.validate(pkg);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid contract package.');
      }
      const published = strategy.publish(
        {
          ...pkg,
          validation,
        },
        now,
      );
      store(published);
      emit(
        'RuntimeContractPublished',
        published.id,
        null,
        `Published contract package ${published.id}.`,
      );
      return published;
    },

    deprecate(packageId, contractId) {
      const pkg = requirePackage(packageId);
      const exists = pkg.contracts.some((item) => item.id === contractId);
      if (!exists) {
        throw new Error(`Contract not found: ${contractId}`);
      }
      const next: RuntimeContractPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        contracts: pkg.contracts.map((contract) =>
          contract.id === contractId
            ? {
                ...contract,
                metadata: {
                  ...contract.metadata,
                  status: 'Deprecated',
                },
              }
            : contract,
        ),
        validation: null,
      };
      store(next);
      emit(
        'RuntimeContractDeprecated',
        next.id,
        contractId,
        `Deprecated contract ${contractId}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: RuntimeContractPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed contract package (read-only archive).',
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

    listContracts(packageId) {
      if (packageId === undefined) {
        return [...packages.values()].flatMap((item) => item.contracts);
      }
      return requirePackage(packageId).contracts;
    },

    find(packageId, capability) {
      return requirePackage(packageId).contracts.filter(
        (contract) => contract.capability === capability,
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
