import type {
  ExportCapability,
  ExportCapabilityStatus,
  RegisterExportCapabilityInput,
} from '../../model';

export type ExportCapabilityStrategy = {
  readonly id: string;
  supports(input: RegisterExportCapabilityInput): boolean;
  register(
    input: RegisterExportCapabilityInput,
    createId: () => string,
  ): ExportCapability;
  validate(capability: ExportCapability): boolean;
};

export function createBasicExportCapabilityStrategy(): ExportCapabilityStrategy {
  return {
    id: 'basic-export-capability-strategy',

    supports(input) {
      return (
        input.name.trim().length > 0 &&
        input.description.trim().length > 0 &&
        input.supportedSchemaVersions.length > 0 &&
        input.supportedSchemaVersions.every((v) => v.trim().length > 0)
      );
    },

    register(input, createId) {
      const status: ExportCapabilityStatus = input.status ?? 'Active';
      return {
        id: createId(),
        name: input.name.trim(),
        description: input.description.trim(),
        supportedSchemaVersions: input.supportedSchemaVersions.map((v) =>
          v.trim(),
        ),
        status,
        metadata: {
          title: input.title?.trim() || input.name.trim(),
          notes: input.notes?.trim() || 'Registered export capability.',
        },
      };
    },

    validate(capability) {
      return (
        capability.name.trim().length > 0 &&
        capability.description.trim().length > 0 &&
        capability.supportedSchemaVersions.length > 0
      );
    },
  };
}

