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
  createRuntimeContractManager,
  type RuntimeContractManager,
} from './runtime-contract-manager';

/**
 * Runtime Contract Manager API (EPIC-BLD-53).
 */
export type RuntimeContractApi = {
  registerRuntimeContract(
    packageId: string | null,
    input: RegisterRuntimeContractInput,
    init?: InitializeContractInput,
  ): RuntimeContractPackage;
  publishRuntimeContract(packageId: string): RuntimeContractPackage;
  listRuntimeContracts(packageId?: string): readonly RuntimeContract[];
  findRuntimeContract(
    packageId: string,
    capability: string,
  ): readonly RuntimeContract[];
  validateRuntimeContract(packageId: string): RuntimeContractValidation;
  deprecateRuntimeContract(
    packageId: string,
    contractId: string,
  ): RuntimeContractPackage;
  initialize(input: InitializeContractInput): RuntimeContractPackage;
  preview(packageId: string): RuntimeContractPackage | null;
  listPackages(): readonly RuntimeContractPackage[];
  listEvents(): readonly RuntimeContractEvent[];
  listIndex(): readonly RuntimeContractIndexEntry[];
  dispose(packageId: string): RuntimeContractPackage;
};

export function createRuntimeContractApi(
  manager?: RuntimeContractManager,
): RuntimeContractApi {
  const service = manager ?? createRuntimeContractManager();

  return {
    initialize(input) {
      return service.initialize(input);
    },
    registerRuntimeContract(packageId, input, init) {
      if (packageId === null) {
        const created = service.initialize(
          init ?? {
            sessionId: 'runtime-session-demo',
            title: 'Builder Runtime Contracts',
            contracts: [input],
          },
        );
        if (
          created.contracts.some(
            (contract) =>
              contract.capability === input.capability &&
              contract.version === input.version,
          )
        ) {
          return created;
        }
        return service.register(created.id, input);
      }
      return service.register(packageId, input);
    },
    publishRuntimeContract(packageId) {
      service.validate(packageId);
      return service.publish(packageId);
    },
    listRuntimeContracts(packageId) {
      return service.listContracts(packageId);
    },
    findRuntimeContract(packageId, capability) {
      return service.find(packageId, capability);
    },
    validateRuntimeContract(packageId) {
      return service.validate(packageId);
    },
    deprecateRuntimeContract(packageId, contractId) {
      return service.deprecate(packageId, contractId);
    },
    preview(packageId) {
      return service.getPackage(packageId);
    },
    listPackages() {
      return service.listPackages();
    },
    listEvents() {
      return service.getEvents();
    },
    listIndex() {
      return service.getIndex();
    },
    dispose(packageId) {
      return service.dispose(packageId);
    },
  };
}
