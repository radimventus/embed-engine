import type {
  CompatibilityEvaluation,
  CompatibilityRule,
  EvaluateCompatibilityInput,
  InitializeCompatibilityInput,
  RegisterCompatibilityRuleInput,
  RuntimeCompatibilityEvent,
  RuntimeCompatibilityIndexEntry,
  RuntimeCompatibilityPackage,
  RuntimeCompatibilityValidation,
} from '../../model';
import {
  createRuntimeCompatibilityManager,
  type RuntimeCompatibilityManager,
} from './runtime-compatibility-manager';

/**
 * Runtime Compatibility Manager API (EPIC-BLD-52).
 */
export type RuntimeCompatibilityApi = {
  evaluateCompatibility(
    packageId: string,
    input: EvaluateCompatibilityInput,
  ): CompatibilityEvaluation;
  publishCompatibility(packageId: string): RuntimeCompatibilityPackage;
  listCompatibilityRules(
    packageId?: string,
  ): readonly CompatibilityRule[];
  findCompatibility(
    packageId: string,
    sourceVersion: string,
  ): readonly CompatibilityRule[];
  validateCompatibility(packageId: string): RuntimeCompatibilityValidation;
  registerCompatibilityRule(
    packageId: string | null,
    input: RegisterCompatibilityRuleInput,
    init?: InitializeCompatibilityInput,
  ): RuntimeCompatibilityPackage;
  initialize(input: InitializeCompatibilityInput): RuntimeCompatibilityPackage;
  preview(packageId: string): RuntimeCompatibilityPackage | null;
  listPackages(): readonly RuntimeCompatibilityPackage[];
  listEvents(): readonly RuntimeCompatibilityEvent[];
  listIndex(): readonly RuntimeCompatibilityIndexEntry[];
  dispose(packageId: string): RuntimeCompatibilityPackage;
};

export function createRuntimeCompatibilityApi(
  manager?: RuntimeCompatibilityManager,
): RuntimeCompatibilityApi {
  const service = manager ?? createRuntimeCompatibilityManager();

  return {
    initialize(input) {
      return service.initialize(input);
    },
    registerCompatibilityRule(packageId, input, init) {
      if (packageId === null) {
        const created = service.initialize(
          init ?? {
            sessionId: 'runtime-session-demo',
            title: 'Builder Runtime Compatibility',
            rules: [input],
          },
        );
        if (
          created.matrix.rules.some(
            (rule) =>
              rule.sourceVersion === input.sourceVersion &&
              rule.targetVersion === input.targetVersion,
          )
        ) {
          return created;
        }
        return service.register(created.id, input);
      }
      return service.register(packageId, input);
    },
    evaluateCompatibility(packageId, input) {
      return service.evaluate(packageId, input);
    },
    publishCompatibility(packageId) {
      service.validate(packageId);
      return service.publish(packageId);
    },
    listCompatibilityRules(packageId) {
      return service.listRules(packageId);
    },
    findCompatibility(packageId, sourceVersion) {
      return service.find(packageId, sourceVersion);
    },
    validateCompatibility(packageId) {
      return service.validate(packageId);
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
