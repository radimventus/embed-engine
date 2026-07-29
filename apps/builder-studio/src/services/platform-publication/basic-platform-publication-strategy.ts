import type {
  InitializePlatformPublicationInput,
  PlatformPublicationEntry,
  PlatformPublicationPackage,
  PlatformPublicationValidation,
  PlatformPublicationValidationIssue,
  RegisterPlatformPublicationInput,
} from '../../model';

/**
 * PlatformPublicationStrategy (EPIC-BLD-57).
 * Deterministic register / refresh — no registry mutation.
 */
export type PlatformPublicationStrategy = {
  readonly id: string;
  supports(input: RegisterPlatformPublicationInput): boolean;
  register(
    input: RegisterPlatformPublicationInput,
    createId: (prefix: string) => string,
  ): PlatformPublicationEntry;
  refresh(
    entry: PlatformPublicationEntry,
    patch?: Partial<RegisterPlatformPublicationInput>,
  ): PlatformPublicationEntry;
};

/**
 * BasicPlatformPublicationStrategy — maps registry evidence into catalog entries.
 */
export function createBasicPlatformPublicationStrategy(): PlatformPublicationStrategy {
  return {
    id: 'basic-platform-publication-strategy',

    supports(input) {
      return (
        input.objectId.trim().length > 0 &&
        input.publicationVersion.trim().length > 0
      );
    },

    register(input, createId) {
      return {
        id: createId('platform-publication-entry'),
        objectId: input.objectId,
        publicationVersion: input.publicationVersion,
        status: input.status ?? 'Registered',
        category: input.category ?? 'general',
        visibility: input.visibility ?? 'public',
        metadata: {
          title: input.title?.trim() || input.objectId,
          notes:
            input.notes?.trim() ||
            'Platform catalog entry — public projection only.',
          sourcePublishedObjectId: input.sourcePublishedObjectId ?? null,
          objectVersion: input.objectVersion?.trim() || input.publicationVersion,
          runtimeVersion: input.runtimeVersion ?? null,
        },
      };
    },

    refresh(entry, patch = {}) {
      return {
        ...entry,
        publicationVersion:
          patch.publicationVersion?.trim() || entry.publicationVersion,
        status:
          patch.status ??
          (entry.status === 'Registered' ? 'Active' : entry.status),
        category: patch.category ?? entry.category,
        visibility: patch.visibility ?? entry.visibility,
        metadata: {
          ...entry.metadata,
          title: patch.title?.trim() || entry.metadata.title,
          notes:
            patch.notes?.trim() ||
            'Refreshed platform catalog entry — projection only.',
          sourcePublishedObjectId:
            patch.sourcePublishedObjectId !== undefined
              ? patch.sourcePublishedObjectId
              : entry.metadata.sourcePublishedObjectId,
          objectVersion:
            patch.objectVersion?.trim() || entry.metadata.objectVersion,
          runtimeVersion:
            patch.runtimeVersion !== undefined
              ? patch.runtimeVersion
              : entry.metadata.runtimeVersion,
        },
      };
    },
  };
}

/**
 * PlatformPublicationValidator (EPIC-BLD-57).
 */
export type PlatformPublicationValidator = {
  validate(pkg: PlatformPublicationPackage): PlatformPublicationValidation;
  validateEntry(
    pkg: PlatformPublicationPackage,
  ): readonly PlatformPublicationValidationIssue[];
  validateSnapshot(
    pkg: PlatformPublicationPackage,
  ): readonly PlatformPublicationValidationIssue[];
  validateIntegrity(
    pkg: PlatformPublicationPackage,
  ): readonly PlatformPublicationValidationIssue[];
};

export function createPlatformPublicationValidator(options?: {
  readonly now?: () => Date;
}): PlatformPublicationValidator {
  const now = options?.now ?? (() => new Date());

  const validateEntry = (
    pkg: PlatformPublicationPackage,
  ): PlatformPublicationValidationIssue[] => {
    const issues: PlatformPublicationValidationIssue[] = [];
    const seen = new Set<string>();
    for (const entry of pkg.snapshot.entries) {
      if (!entry.objectId.trim()) {
        issues.push({
          code: 'entry-missing-object-id',
          severity: 'error',
          message: `Catalog entry ${entry.id} missing objectId.`,
        });
      }
      if (!entry.publicationVersion.trim()) {
        issues.push({
          code: 'entry-missing-publication-version',
          severity: 'error',
          message: `Catalog entry ${entry.id} missing publicationVersion.`,
        });
      }
      const key = `${entry.objectId}:${entry.publicationVersion}`;
      if (seen.has(key)) {
        issues.push({
          code: 'entry-duplicate',
          severity: 'warning',
          message: `Duplicate catalog entry for ${key}.`,
        });
      }
      seen.add(key);
    }
    return issues;
  };

  const validateSnapshot = (
    pkg: PlatformPublicationPackage,
  ): PlatformPublicationValidationIssue[] => {
    const issues: PlatformPublicationValidationIssue[] = [];
    if (!pkg.snapshot.id.trim()) {
      issues.push({
        code: 'snapshot-missing-id',
        severity: 'error',
        message: 'Platform Publication Snapshot missing id.',
      });
    }
    if (!pkg.snapshot.generatedAt.trim()) {
      issues.push({
        code: 'snapshot-missing-generated-at',
        severity: 'error',
        message: 'Platform Publication Snapshot missing generatedAt.',
      });
    }
    if (pkg.snapshot.entries.length === 0) {
      issues.push({
        code: 'snapshot-empty',
        severity: 'warning',
        message: 'Platform Publication Snapshot has no entries.',
      });
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: PlatformPublicationPackage,
  ): PlatformPublicationValidationIssue[] => {
    const issues: PlatformPublicationValidationIssue[] = [];
    if (pkg.metadata.sessionId !== pkg.snapshot.metadata.sessionId) {
      issues.push({
        code: 'session-mismatch',
        severity: 'error',
        message: 'Package sessionId does not match snapshot.sessionId.',
      });
    }
    for (const entry of pkg.snapshot.entries) {
      if (
        entry.visibility === 'public' &&
        entry.status === 'Hidden'
      ) {
        issues.push({
          code: 'visibility-status-conflict',
          severity: 'warning',
          message: `Entry ${entry.id} is public but Hidden.`,
        });
      }
    }
    return issues;
  };

  return {
    validateEntry,
    validateSnapshot,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validateEntry(pkg),
        ...validateSnapshot(pkg),
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

export function buildInitialPlatformPublicationSnapshot(
  input: InitializePlatformPublicationInput,
  createId: (prefix: string) => string,
  now: () => Date,
): PlatformPublicationPackage['snapshot'] {
  return {
    id: createId('platform-publication-snapshot'),
    entries: [],
    generatedAt: now().toISOString(),
    metadata: {
      title:
        input.title?.trim() || `Platform Publication ${input.sessionId}`,
      notes: 'Platform Publication Snapshot — catalog projection only.',
      sessionId: input.sessionId,
    },
  };
}
