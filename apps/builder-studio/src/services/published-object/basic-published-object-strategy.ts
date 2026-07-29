import type {
  InitializePublishedObjectRegistryInput,
  PublishedObject,
  PublishedObjectPackage,
  PublishedObjectValidation,
  PublishedObjectValidationIssue,
  RegisterPublishedObjectInput,
} from '../../model';

/**
 * PublishedObjectStrategy (EPIC-BLD-56).
 * Deterministic register / archive — no Object Package mutation.
 */
export type PublishedObjectStrategy = {
  readonly id: string;
  supports(input: RegisterPublishedObjectInput): boolean;
  register(
    input: RegisterPublishedObjectInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): PublishedObject;
  archive(object: PublishedObject): PublishedObject;
};

/**
 * BasicPublishedObjectStrategy — maps publication outputs into registry entries.
 */
export function createBasicPublishedObjectStrategy(): PublishedObjectStrategy {
  return {
    id: 'basic-published-object-strategy',

    supports(input) {
      return (
        input.objectId.trim().length > 0 &&
        input.version.trim().length > 0 &&
        input.manifest.id.trim().length > 0
      );
    },

    register(input, createId, now) {
      return {
        id: createId('published-object'),
        objectId: input.objectId,
        version: input.version,
        publicationVersion: input.publicationVersion?.trim() || input.version,
        status: input.status ?? 'Registered',
        manifest: { ...input.manifest },
        createdAt: now().toISOString(),
        metadata: {
          title: input.title?.trim() || input.objectId,
          notes:
            input.notes?.trim() ||
            'Published Object registry entry — evidence only.',
          sourcePublicationPackageId: input.sourcePublicationPackageId ?? null,
          sourceObjectPackageId: input.sourceObjectPackageId ?? null,
          checksum: input.checksum ?? null,
        },
      };
    },

    archive(object) {
      if (object.status === 'Archived') {
        return object;
      }
      return {
        ...object,
        status: 'Archived',
        metadata: {
          ...object.metadata,
          notes: 'Archived Published Object — registry evidence retained.',
        },
      };
    },
  };
}

/**
 * PublishedObjectValidator (EPIC-BLD-56).
 */
export type PublishedObjectValidator = {
  validate(pkg: PublishedObjectPackage): PublishedObjectValidation;
  validateObject(
    pkg: PublishedObjectPackage,
  ): readonly PublishedObjectValidationIssue[];
  validateManifest(
    pkg: PublishedObjectPackage,
  ): readonly PublishedObjectValidationIssue[];
  validateIntegrity(
    pkg: PublishedObjectPackage,
  ): readonly PublishedObjectValidationIssue[];
};

export function createPublishedObjectValidator(options?: {
  readonly now?: () => Date;
}): PublishedObjectValidator {
  const now = options?.now ?? (() => new Date());

  const validateObject = (
    pkg: PublishedObjectPackage,
  ): PublishedObjectValidationIssue[] => {
    const issues: PublishedObjectValidationIssue[] = [];
    const seen = new Set<string>();
    for (const object of pkg.catalog.objects) {
      if (!object.objectId.trim()) {
        issues.push({
          code: 'object-missing-id',
          severity: 'error',
          message: `Published Object ${object.id} missing objectId.`,
        });
      }
      if (!object.version.trim()) {
        issues.push({
          code: 'object-missing-version',
          severity: 'error',
          message: `Published Object ${object.id} missing version.`,
        });
      }
      if (!object.publicationVersion.trim()) {
        issues.push({
          code: 'object-missing-publication-version',
          severity: 'error',
          message: `Published Object ${object.id} missing publicationVersion.`,
        });
      }
      const key = `${object.objectId}:${object.version}:${object.publicationVersion}`;
      if (seen.has(key)) {
        issues.push({
          code: 'object-duplicate',
          severity: 'warning',
          message: `Duplicate Published Object for ${key}.`,
        });
      }
      seen.add(key);
    }
    return issues;
  };

  const validateManifest = (
    pkg: PublishedObjectPackage,
  ): PublishedObjectValidationIssue[] => {
    const issues: PublishedObjectValidationIssue[] = [];
    for (const object of pkg.catalog.objects) {
      if (!object.manifest.id.trim()) {
        issues.push({
          code: 'manifest-missing-id',
          severity: 'error',
          message: `Published Object ${object.id} missing manifest id.`,
        });
      }
      if (!object.manifest.objectVersion.trim()) {
        issues.push({
          code: 'manifest-missing-object-version',
          severity: 'error',
          message: `Published Object ${object.id} missing manifest.objectVersion.`,
        });
      }
      if (object.manifest.objectVersion !== object.version) {
        issues.push({
          code: 'manifest-version-mismatch',
          severity: 'warning',
          message: `Published Object ${object.id} manifest.objectVersion differs from version.`,
        });
      }
      if (!object.manifest.runtimeVersion.trim()) {
        issues.push({
          code: 'manifest-missing-runtime-version',
          severity: 'warning',
          message: `Published Object ${object.id} missing runtimeVersion.`,
        });
      }
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: PublishedObjectPackage,
  ): PublishedObjectValidationIssue[] => {
    const issues: PublishedObjectValidationIssue[] = [];
    if (!pkg.catalog.id.trim()) {
      issues.push({
        code: 'catalog-missing-id',
        severity: 'error',
        message: 'Published Object Catalog missing id.',
      });
    }
    if (pkg.metadata.sessionId !== pkg.catalog.metadata.sessionId) {
      issues.push({
        code: 'session-mismatch',
        severity: 'error',
        message: 'Package sessionId does not match catalog.sessionId.',
      });
    }
    if (pkg.catalog.objects.length === 0) {
      issues.push({
        code: 'catalog-empty',
        severity: 'warning',
        message: 'Published Object Catalog has no objects.',
      });
    }
    return issues;
  };

  return {
    validateObject,
    validateManifest,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validateObject(pkg),
        ...validateManifest(pkg),
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

export function buildInitialPublishedObjectCatalog(
  input: InitializePublishedObjectRegistryInput,
  createId: (prefix: string) => string,
  now: () => Date,
): PublishedObjectPackage['catalog'] {
  return {
    id: createId('published-object-catalog'),
    objects: [],
    generatedAt: now().toISOString(),
    metadata: {
      title:
        input.title?.trim() || `Published Objects ${input.sessionId}`,
      notes: 'Published Object Catalog — registry evidence only.',
      sessionId: input.sessionId,
    },
  };
}
