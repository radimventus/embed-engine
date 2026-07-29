import type {
  ClientPublicationModel,
  ClientPublicationPackage,
  ClientPublicationValidation,
  ClientPublicationValidationIssue,
  InitializeClientPublicationInput,
  LoadClientPublicationInput,
} from '../../model';

export type ClientPublicationStrategy = {
  readonly id: string;
  supports(input: LoadClientPublicationInput): boolean;
  transform(
    input: LoadClientPublicationInput,
    createId: (prefix: string) => string,
  ): ClientPublicationModel;
  publish(model: ClientPublicationModel): ClientPublicationModel;
};

export function createBasicClientPublicationStrategy(): ClientPublicationStrategy {
  return {
    id: 'basic-client-publication-strategy',

    supports(input) {
      return (
        input.publicationId.trim().length > 0 &&
        input.objectId.trim().length > 0 &&
        input.version.trim().length > 0
      );
    },

    transform(input, createId) {
      return {
        id: createId('client-publication-model'),
        publicationId: input.publicationId,
        objectId: input.objectId,
        version: input.version,
        assets: input.assets ?? [
          {
            id: createId('client-publication-asset'),
            kind: 'hero',
            ref: `client://${input.objectId}/hero`,
            label: 'Hero asset',
          },
          {
            id: createId('client-publication-asset'),
            kind: 'gallery',
            ref: `client://${input.objectId}/gallery`,
            label: 'Gallery asset',
          },
        ],
        metadata: {
          title: input.title?.trim() || input.objectId,
          notes:
            input.notes?.trim() ||
            'Client publication adapter output — no Client Studio internals.',
          sourceCatalogPackageId: input.sourceCatalogPackageId ?? null,
          sourcePlatformEntryId: input.sourcePlatformEntryId ?? null,
          status: 'Transformed',
        },
      };
    },

    publish(model) {
      return {
        ...model,
        metadata: {
          ...model.metadata,
          notes: 'Published Client Publication Model — adapter output only.',
          status: 'Published',
        },
      };
    },
  };
}

export type ClientPublicationValidator = {
  validate(pkg: ClientPublicationPackage): ClientPublicationValidation;
  validatePublication(
    pkg: ClientPublicationPackage,
  ): readonly ClientPublicationValidationIssue[];
  validateAssets(
    pkg: ClientPublicationPackage,
  ): readonly ClientPublicationValidationIssue[];
  validateIntegrity(
    pkg: ClientPublicationPackage,
  ): readonly ClientPublicationValidationIssue[];
};

export function createClientPublicationValidator(options?: {
  readonly now?: () => Date;
}): ClientPublicationValidator {
  const now = options?.now ?? (() => new Date());

  const validatePublication = (
    pkg: ClientPublicationPackage,
  ): ClientPublicationValidationIssue[] => {
    const issues: ClientPublicationValidationIssue[] = [];
    const { publicationModel } = pkg;
    if (!publicationModel.publicationId.trim()) {
      issues.push({
        code: 'publication-missing-id',
        severity: 'error',
        message: 'Client publication missing publicationId.',
      });
    }
    if (!publicationModel.objectId.trim()) {
      issues.push({
        code: 'publication-missing-object-id',
        severity: 'error',
        message: 'Client publication missing objectId.',
      });
    }
    if (!publicationModel.version.trim()) {
      issues.push({
        code: 'publication-missing-version',
        severity: 'error',
        message: 'Client publication missing version.',
      });
    }
    return issues;
  };

  const validateAssets = (
    pkg: ClientPublicationPackage,
  ): ClientPublicationValidationIssue[] => {
    const issues: ClientPublicationValidationIssue[] = [];
    if (pkg.publicationModel.assets.length === 0) {
      issues.push({
        code: 'assets-empty',
        severity: 'warning',
        message: 'Client publication has no assets.',
      });
    }
    for (const asset of pkg.publicationModel.assets) {
      if (!asset.id.trim() || !asset.ref.trim()) {
        issues.push({
          code: 'asset-incomplete',
          severity: 'error',
          message: `Client asset ${asset.id || '(missing)'} incomplete.`,
        });
      }
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: ClientPublicationPackage,
  ): ClientPublicationValidationIssue[] => {
    const issues: ClientPublicationValidationIssue[] = [];
    if (!pkg.metadata.sessionId.trim()) {
      issues.push({
        code: 'session-missing',
        severity: 'error',
        message: 'Client publication package missing sessionId.',
      });
    }
    if (pkg.publicationModel.metadata.status === 'Published' && pkg.metadata.status !== 'Published') {
      issues.push({
        code: 'status-mismatch',
        severity: 'warning',
        message: 'Model is Published but package status is not Published.',
      });
    }
    return issues;
  };

  return {
    validatePublication,
    validateAssets,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validatePublication(pkg),
        ...validateAssets(pkg),
        ...validateIntegrity(pkg),
      ];
      return {
        valid: !issues.some((item) => item.severity === 'error'),
        issues,
        validatedAt: now().toISOString(),
      };
    },
  };
}

export function buildInitialClientPublicationPackage(
  input: InitializeClientPublicationInput,
  createId: (prefix: string) => string,
  now: () => Date,
): ClientPublicationPackage {
  const stamp = now().toISOString();
  return {
    id: createId('client-publication-package'),
    version: '1.0.0',
    publicationModel: {
      id: createId('client-publication-model'),
      publicationId: 'publication-pending',
      objectId: 'object-pending',
      version: '0.0.0',
      assets: [],
      metadata: {
        title: input.title?.trim() || `Client Publication ${input.sessionId}`,
        notes: 'Awaiting load.',
        sourceCatalogPackageId: null,
        sourcePlatformEntryId: null,
        status: 'Loaded',
      },
    },
    createdAt: stamp,
    updatedAt: stamp,
    metadata: {
      title: input.title?.trim() || `Client Publication ${input.sessionId}`,
      sessionId: input.sessionId,
      notes: 'Client Publication package — adapter only.',
      status: 'Draft',
    },
    validation: null,
  };
}
