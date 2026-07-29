import type {
  ExportCompatibility,
  RegisterExportCompatibilityInput,
} from '../../model';

export type ExportCompatibilityStrategy = {
  readonly id: string;
  supports(input: RegisterExportCompatibilityInput): boolean;
  register(input: RegisterExportCompatibilityInput, createId: () => string): ExportCompatibility;
  validate(c: ExportCompatibility): boolean;
};

export function createBasicExportCompatibilityStrategy(): ExportCompatibilityStrategy {
  return {
    id: 'basic-export-compatibility-strategy',

    supports(input) {
      return (
        input.sourceSchemaVersion.trim().length > 0 &&
        input.targetSchemaVersion.trim().length > 0 &&
        ['FULL', 'BACKWARD', 'FORWARD', 'INCOMPATIBLE'].includes(input.compatibilityLevel)
      );
    },

    register(input, createId) {
      return {
        id: createId(),
        sourceSchemaVersion: input.sourceSchemaVersion.trim(),
        targetSchemaVersion: input.targetSchemaVersion.trim(),
        compatibilityLevel: input.compatibilityLevel,
        status: 'Active',
        metadata: {
          title: input.title?.trim() || `${input.sourceSchemaVersion} -> ${input.targetSchemaVersion}`,
          notes: input.notes?.trim() || `Compatibility: ${input.compatibilityLevel}.`,
        },
      };
    },

    validate(c) {
      return c.sourceSchemaVersion.trim().length > 0 && c.targetSchemaVersion.trim().length > 0;
    },
  };
}
