import type {
  ExportPolicy,
  ExportPolicyStatus,
  RegisterExportPolicyInput,
} from '../../model';

export type ExportPolicyStrategy = {
  readonly id: string;
  supports(input: RegisterExportPolicyInput): boolean;
  register(input: RegisterExportPolicyInput, createId: () => string): ExportPolicy;
  validate(policy: ExportPolicy): boolean;
};

export function createBasicExportPolicyStrategy(): ExportPolicyStrategy {
  return {
    id: 'basic-export-policy-strategy',

    supports(input) {
      return (
        input.name.trim().length > 0 &&
        input.conditions.length > 0 &&
        input.conditions.every((c) => c.trim().length > 0)
      );
    },

    register(input, createId) {
      const status: ExportPolicyStatus = input.status ?? 'Active';
      return {
        id: createId(),
        name: input.name.trim(),
        conditions: input.conditions.map((c) => c.trim()),
        status,
        metadata: {
          title: input.title?.trim() || input.name.trim(),
          notes: input.notes?.trim() || 'Registered export policy.',
        },
      };
    },

    validate(policy) {
      return policy.name.trim().length > 0 && policy.conditions.length > 0;
    },
  };
}

