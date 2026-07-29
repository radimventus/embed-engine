import type {
  ExportSchema,
  RegisterExportSchemaInput,
} from '../../model';

export type ExportSchemaStrategy = {
  readonly id: string;
  supports(input: RegisterExportSchemaInput): boolean;
  register(input: RegisterExportSchemaInput, createId: () => string): ExportSchema;
  validate(schema: ExportSchema): boolean;
};

export function createBasicExportSchemaStrategy(): ExportSchemaStrategy {
  return {
    id: 'basic-export-schema-strategy',

    supports(input) {
      return (
        input.name.trim().length > 0 &&
        input.schemaVersion.trim().length > 0
      );
    },

    register(input, createId) {
      return {
        id: createId(),
        name: input.name.trim(),
        schemaVersion: input.schemaVersion.trim(),
        status: input.status ?? 'Active',
        metadata: {
          title: input.title?.trim() || input.name.trim(),
          notes: input.notes?.trim() || 'Registered export schema.',
        },
      };
    },

    validate(schema) {
      return (
        schema.name.trim().length > 0 &&
        schema.schemaVersion.trim().length > 0
      );
    },
  };
}
