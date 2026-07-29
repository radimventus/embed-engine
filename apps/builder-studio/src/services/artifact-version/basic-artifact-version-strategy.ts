import type {
  ArtifactVersion,
  ArtifactVersionPackage,
  ArtifactVersionValidation,
  InitializeArtifactVersionManagerInput,
  RegisterArtifactVersionInput,
} from '../../model';

export type ArtifactVersionStrategy = {
  readonly id: string;
  supports(input: RegisterArtifactVersionInput): boolean;
  register(
    input: RegisterArtifactVersionInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): ArtifactVersion;
  activate(
    artifactVersion: ArtifactVersion,
    allVersions: readonly ArtifactVersion[],
  ): readonly ArtifactVersion[];
};

export type ArtifactVersionValidator = {
  validate(pkg: ArtifactVersionPackage): ArtifactVersionValidation;
  validateVersion(version: ArtifactVersion): readonly string[];
  validateLifecycle(
    versions: readonly ArtifactVersion[],
  ): readonly string[];
  validateIntegrity(
    versions: readonly ArtifactVersion[],
  ): readonly string[];
};

export function createBasicArtifactVersionStrategy(): ArtifactVersionStrategy {
  return {
    id: 'basic-artifact-version-strategy',

    supports(input) {
      return input.artifactId.trim().length > 0 && input.version.trim().length > 0;
    },

    register(input, createId, now) {
      return {
        id: createId('artifact-version'),
        artifactId: input.artifactId,
        version: input.version,
        status: input.active ? 'ACTIVE' : 'SUPPORTED',
        createdAt: now().toISOString(),
        metadata: {
          title: input.title?.trim() || input.artifactId,
          artifactType: input.artifactType ?? 'Unknown',
          notes:
            input.notes?.trim() || 'Registered artifact version metadata only.',
          active: input.active ?? false,
        },
      };
    },

    activate(artifactVersion, allVersions) {
      return allVersions.map((item) => {
        if (item.artifactId !== artifactVersion.artifactId) {
          return item;
        }
        if (item.id === artifactVersion.id) {
          return {
            ...item,
            status: 'ACTIVE',
            metadata: {
              ...item.metadata,
              active: true,
            },
          };
        }
        return {
          ...item,
          status: item.status === 'ARCHIVED' ? 'ARCHIVED' : 'SUPPORTED',
          metadata: {
            ...item.metadata,
            active: false,
          },
        };
      });
    },
  };
}

export function createArtifactVersionValidator(options: {
  readonly now?: () => Date;
} = {}): ArtifactVersionValidator {
  const now = options.now ?? (() => new Date());

  return {
    validate(pkg) {
      const issues = [
        ...pkg.artifactVersions.flatMap((version) =>
          this.validateVersion(version).map((message) => ({
            code: 'artifact-version',
            severity: 'error' as const,
            message,
          })),
        ),
        ...this.validateLifecycle(pkg.artifactVersions).map((message) => ({
          code: 'artifact-lifecycle',
          severity: 'warning' as const,
          message,
        })),
        ...this.validateIntegrity(pkg.artifactVersions).map((message) => ({
          code: 'artifact-integrity',
          severity: 'error' as const,
          message,
        })),
      ];
      return {
        valid: issues.every((issue) => issue.severity !== 'error'),
        issues,
        validatedAt: now().toISOString(),
      };
    },

    validateVersion(version) {
      const issues: string[] = [];
      if (!version.artifactId.trim()) {
        issues.push('Artifact version requires artifactId.');
      }
      if (!version.version.trim()) {
        issues.push('Artifact version requires version.');
      }
      return issues;
    },

    validateLifecycle(versions) {
      const activeByArtifact = new Map<string, number>();
      for (const version of versions) {
        if (version.metadata.active || version.status === 'ACTIVE') {
          activeByArtifact.set(
            version.artifactId,
            (activeByArtifact.get(version.artifactId) ?? 0) + 1,
          );
        }
      }
      return [...activeByArtifact.entries()]
        .filter(([, count]) => count > 1)
        .map(([artifactId]) => `Artifact ${artifactId} has multiple active versions.`);
    },

    validateIntegrity(versions) {
      const seen = new Set<string>();
      const issues: string[] = [];
      for (const version of versions) {
        const key = `${version.artifactId}:${version.version}`;
        if (seen.has(key)) {
          issues.push(`Duplicate artifact version detected for ${key}.`);
        }
        seen.add(key);
      }
      return issues;
    },
  };
}

export function buildInitialArtifactVersionPackage(
  input: InitializeArtifactVersionManagerInput,
  createId: (prefix: string) => string,
  now: () => Date,
): ArtifactVersionPackage {
  const stamp = now().toISOString();
  return {
    id: createId('artifact-version-package'),
    version: '1.0.0',
    artifactVersions: [],
    createdAt: stamp,
    updatedAt: stamp,
    metadata: {
      title: input.title?.trim() || `Artifact Versions ${input.sessionId}`,
      sessionId: input.sessionId,
      notes: 'Artifact version package — metadata registry only.',
      status: 'Draft',
    },
    validation: null,
  };
}
