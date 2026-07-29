import type {
  ArtifactDependency,
  ArtifactDependencyPackage,
  ArtifactDependencyValidation,
  InitializeArtifactDependencyRegistryInput,
  RegisterArtifactDependencyInput,
} from '../../model';

export type ArtifactDependencyStrategy = {
  readonly id: string;
  supports(input: RegisterArtifactDependencyInput): boolean;
  register(
    input: RegisterArtifactDependencyInput,
    createId: (prefix: string) => string,
  ): ArtifactDependency;
  validate(
    dependencies: readonly ArtifactDependency[],
  ): readonly string[];
};

export type ArtifactDependencyValidator = {
  validate(pkg: ArtifactDependencyPackage): ArtifactDependencyValidation;
  validateGraph(
    dependencies: readonly ArtifactDependency[],
  ): readonly string[];
  validateCycles(
    dependencies: readonly ArtifactDependency[],
  ): readonly string[];
  validateIntegrity(
    dependencies: readonly ArtifactDependency[],
  ): readonly string[];
};

export function createBasicArtifactDependencyStrategy(): ArtifactDependencyStrategy {
  return {
    id: 'basic-artifact-dependency-strategy',

    supports(input) {
      return (
        input.sourceArtifactId.trim().length > 0 &&
        input.targetArtifactId.trim().length > 0 &&
        input.sourceArtifactId !== input.targetArtifactId
      );
    },

    register(input, createId) {
      return {
        id: createId('artifact-dependency'),
        sourceArtifactId: input.sourceArtifactId,
        targetArtifactId: input.targetArtifactId,
        dependencyType: input.dependencyType,
        status: 'Active',
        metadata: {
          title:
            input.title?.trim() ||
            `${input.sourceArtifactId} -> ${input.targetArtifactId}`,
          notes:
            input.notes?.trim() || 'Registered artifact dependency metadata only.',
        },
      };
    },

    validate(dependencies) {
      const duplicates = new Set<string>();
      const seen = new Set<string>();
      for (const dependency of dependencies) {
        const key = `${dependency.sourceArtifactId}:${dependency.targetArtifactId}:${dependency.dependencyType}:${dependency.status}`;
        if (seen.has(key)) {
          duplicates.add(
            `Duplicate dependency ${dependency.sourceArtifactId} -> ${dependency.targetArtifactId}.`,
          );
        }
        seen.add(key);
      }
      return [...duplicates];
    },
  };
}

export function createArtifactDependencyValidator(options: {
  readonly now?: () => Date;
} = {}): ArtifactDependencyValidator {
  const now = options.now ?? (() => new Date());

  const buildAdjacency = (dependencies: readonly ArtifactDependency[]) => {
    const graph = new Map<string, string[]>();
    for (const dependency of dependencies) {
      if (dependency.status !== 'Active') {
        continue;
      }
      const list = graph.get(dependency.sourceArtifactId) ?? [];
      list.push(dependency.targetArtifactId);
      graph.set(dependency.sourceArtifactId, list);
      if (!graph.has(dependency.targetArtifactId)) {
        graph.set(dependency.targetArtifactId, []);
      }
    }
    return graph;
  };

  return {
    validate(pkg) {
      const issues = [
        ...this.validateGraph(pkg.dependencies).map((message) => ({
          code: 'artifact-graph',
          severity: 'warning' as const,
          message,
        })),
        ...this.validateCycles(pkg.dependencies).map((message) => ({
          code: 'artifact-cycles',
          severity: 'error' as const,
          message,
        })),
        ...this.validateIntegrity(pkg.dependencies).map((message) => ({
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

    validateGraph(dependencies) {
      return dependencies
        .filter((dependency) => dependency.status === 'Active')
        .filter(
          (dependency) =>
            !dependency.sourceArtifactId.trim() || !dependency.targetArtifactId.trim(),
        )
        .map(() => 'Dependency graph contains incomplete nodes.');
    },

    validateCycles(dependencies) {
      const graph = buildAdjacency(dependencies);
      const visiting = new Set<string>();
      const visited = new Set<string>();
      const issues = new Set<string>();

      const dfs = (node: string, path: string[]) => {
        if (visiting.has(node)) {
          const cycleStart = path.indexOf(node);
          const cycle = [...path.slice(cycleStart), node].join(' -> ');
          issues.add(`Dependency cycle detected: ${cycle}.`);
          return;
        }
        if (visited.has(node)) {
          return;
        }
        visiting.add(node);
        for (const neighbor of graph.get(node) ?? []) {
          dfs(neighbor, [...path, node]);
        }
        visiting.delete(node);
        visited.add(node);
      };

      for (const node of graph.keys()) {
        dfs(node, []);
      }
      return [...issues];
    },

    validateIntegrity(dependencies) {
      const issues: string[] = [];
      const seen = new Set<string>();
      for (const dependency of dependencies) {
        if (dependency.sourceArtifactId === dependency.targetArtifactId) {
          issues.push(
            `Artifact ${dependency.sourceArtifactId} cannot depend on itself.`,
          );
        }
        const key = `${dependency.sourceArtifactId}:${dependency.targetArtifactId}:${dependency.dependencyType}`;
        if (seen.has(key) && dependency.status === 'Active') {
          issues.push(
            `Duplicate active dependency detected for ${dependency.sourceArtifactId} -> ${dependency.targetArtifactId}.`,
          );
        }
        seen.add(key);
      }
      return issues;
    },
  };
}

export function buildInitialArtifactDependencyPackage(
  input: InitializeArtifactDependencyRegistryInput,
  createId: (prefix: string) => string,
  now: () => Date,
): ArtifactDependencyPackage {
  const stamp = now().toISOString();
  return {
    id: createId('artifact-dependency-package'),
    version: '1.0.0',
    dependencies: [],
    createdAt: stamp,
    updatedAt: stamp,
    metadata: {
      title: input.title?.trim() || `Artifact Dependencies ${input.sessionId}`,
      sessionId: input.sessionId,
      notes: 'Artifact dependency package — relationship registry only.',
      status: 'Draft',
    },
    validation: null,
  };
}
