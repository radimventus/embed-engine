import type {
  BuildObjectPublicationInput,
  InitializePublicationInput,
  PublicationManifest,
  PublicationObjectAsset,
  PublicationObjectPackage,
  PublicationPackage,
  PublicationValidation,
  PublicationValidationIssue,
} from '../../model';

/**
 * PublicationStrategy (EPIC-BLD-55).
 * Deterministic build / publish — no remote deploy or Experience generation.
 */
export type PublicationStrategy = {
  readonly id: string;
  supports(input: BuildObjectPublicationInput): boolean;
  build(
    input: BuildObjectPublicationInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): PublicationObjectPackage;
  publish(
    objectPackage: PublicationObjectPackage,
  ): PublicationObjectPackage;
};

function stableChecksum(parts: readonly string[]): string {
  let hash = 0;
  const joined = parts.join('|');
  for (let i = 0; i < joined.length; i += 1) {
    hash = (hash * 31 + joined.charCodeAt(i)) >>> 0;
  }
  return `chk-${hash.toString(16).padStart(8, '0')}`;
}

/**
 * BasicPublicationStrategy — maps Builder object inputs into publishable packages.
 */
export function createBasicPublicationStrategy(): PublicationStrategy {
  return {
    id: 'basic-publication-strategy',

    supports(input) {
      return input.objectId.trim().length > 0;
    },

    build(input, createId, now) {
      const stamp = now().toISOString();
      const version = input.objectVersion?.trim() || '1.0.0';
      const assets: readonly PublicationObjectAsset[] =
        input.assets ??
        [
          {
            id: createId('publication-asset'),
            kind: 'metadata',
            label: 'Object metadata',
            ref: `object://${input.objectId}/metadata`,
          },
          {
            id: createId('publication-asset'),
            kind: 'manifest',
            label: 'Publication descriptor',
            ref: `object://${input.objectId}/manifest`,
          },
        ];
      const manifest: PublicationManifest = {
        id: createId('publication-manifest'),
        objectVersion: version,
        runtimeVersion: input.runtimeVersion?.trim() || '1.0.0',
        contractVersion: input.contractVersion?.trim() || '1.0.0',
        compatibilityVersion: input.compatibilityVersion?.trim() || '1.0.0',
        generatedAt: stamp,
      };
      const id = createId('publication-object-package');
      return {
        id,
        objectId: input.objectId,
        version,
        manifest,
        assets,
        metadata: {
          title: input.title?.trim() || `Published ${input.objectId}`,
          notes: 'Local publishable Object Package — no remote deploy.',
          sourceObjectId: input.objectId,
          sourceProjectId: input.sourceProjectId?.trim() || 'project-demo',
        },
        checksum: stableChecksum([
          id,
          input.objectId,
          version,
          manifest.runtimeVersion,
          manifest.contractVersion,
          manifest.compatibilityVersion,
          ...assets.map((asset) => asset.ref),
        ]),
      };
    },

    publish(objectPackage) {
      return {
        ...objectPackage,
        metadata: {
          ...objectPackage.metadata,
          notes: 'Published Object Package — local artifact only.',
        },
      };
    },
  };
}

/**
 * PublicationValidator (EPIC-BLD-55).
 */
export type PublicationValidator = {
  validate(pkg: PublicationPackage): PublicationValidation;
  validateManifest(
    pkg: PublicationPackage,
  ): readonly PublicationValidationIssue[];
  validateAssets(
    pkg: PublicationPackage,
  ): readonly PublicationValidationIssue[];
  validateIntegrity(
    pkg: PublicationPackage,
  ): readonly PublicationValidationIssue[];
};

export function createPublicationValidator(options?: {
  readonly now?: () => Date;
}): PublicationValidator {
  const now = options?.now ?? (() => new Date());

  const validateManifest = (
    pkg: PublicationPackage,
  ): PublicationValidationIssue[] => {
    const issues: PublicationValidationIssue[] = [];
    const { manifest } = pkg.objectPackage;
    if (!manifest.id.trim()) {
      issues.push({
        code: 'manifest-missing-id',
        severity: 'error',
        message: 'Publication Manifest missing id.',
      });
    }
    if (!manifest.objectVersion.trim()) {
      issues.push({
        code: 'manifest-missing-object-version',
        severity: 'error',
        message: 'Publication Manifest missing objectVersion.',
      });
    }
    if (!manifest.runtimeVersion.trim()) {
      issues.push({
        code: 'manifest-missing-runtime-version',
        severity: 'error',
        message: 'Publication Manifest missing runtimeVersion.',
      });
    }
    if (!manifest.contractVersion.trim()) {
      issues.push({
        code: 'manifest-missing-contract-version',
        severity: 'warning',
        message: 'Publication Manifest missing contractVersion.',
      });
    }
    if (!manifest.compatibilityVersion.trim()) {
      issues.push({
        code: 'manifest-missing-compatibility-version',
        severity: 'warning',
        message: 'Publication Manifest missing compatibilityVersion.',
      });
    }
    return issues;
  };

  const validateAssets = (
    pkg: PublicationPackage,
  ): PublicationValidationIssue[] => {
    const issues: PublicationValidationIssue[] = [];
    if (pkg.objectPackage.assets.length === 0) {
      issues.push({
        code: 'assets-empty',
        severity: 'error',
        message: 'Object Package has no assets.',
      });
    }
    const seen = new Set<string>();
    for (const asset of pkg.objectPackage.assets) {
      if (!asset.id.trim() || !asset.ref.trim()) {
        issues.push({
          code: 'asset-incomplete',
          severity: 'error',
          message: `Asset ${asset.id || '(missing)'} incomplete.`,
        });
      }
      if (seen.has(asset.ref)) {
        issues.push({
          code: 'asset-duplicate-ref',
          severity: 'warning',
          message: `Duplicate asset ref ${asset.ref}.`,
        });
      }
      seen.add(asset.ref);
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: PublicationPackage,
  ): PublicationValidationIssue[] => {
    const issues: PublicationValidationIssue[] = [];
    if (!pkg.objectPackage.objectId.trim()) {
      issues.push({
        code: 'object-missing-id',
        severity: 'error',
        message: 'Object Package missing objectId.',
      });
    }
    if (!pkg.objectPackage.checksum.trim()) {
      issues.push({
        code: 'checksum-missing',
        severity: 'error',
        message: 'Object Package missing checksum.',
      });
    }
    if (
      pkg.objectPackage.manifest.objectVersion !== pkg.objectPackage.version
    ) {
      issues.push({
        code: 'version-mismatch',
        severity: 'error',
        message: 'Manifest objectVersion does not match Object Package version.',
      });
    }
    if (!pkg.metadata.sessionId.trim()) {
      issues.push({
        code: 'session-missing',
        severity: 'error',
        message: 'Publication Package missing sessionId.',
      });
    }
    return issues;
  };

  return {
    validateManifest,
    validateAssets,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validateManifest(pkg),
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

export function buildInitialPublicationPackage(
  input: InitializePublicationInput,
  createId: (prefix: string) => string,
  now: () => Date,
): PublicationPackage {
  const stamp = now().toISOString();
  const placeholder: PublicationObjectPackage = {
    id: createId('publication-object-package'),
    objectId: 'object-pending',
    version: '0.0.0',
    manifest: {
      id: createId('publication-manifest'),
      objectVersion: '0.0.0',
      runtimeVersion: '0.0.0',
      contractVersion: '0.0.0',
      compatibilityVersion: '0.0.0',
      generatedAt: stamp,
    },
    assets: [],
    metadata: {
      title: input.title?.trim() || `Object Publication ${input.sessionId}`,
      notes: 'Awaiting build.',
      sourceObjectId: 'object-pending',
      sourceProjectId: 'project-pending',
    },
    checksum: 'chk-pending',
  };
  return {
    id: createId('publication-package'),
    version: '1.0.0',
    objectPackage: placeholder,
    createdAt: stamp,
    updatedAt: stamp,
    metadata: {
      title: placeholder.metadata.title,
      sessionId: input.sessionId,
      notes: 'Object Publication package — local pipeline only.',
      status: 'Draft',
    },
    validation: null,
  };
}
