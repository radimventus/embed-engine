import type {
  BuildPublicationPlanInput,
  InitializePublicationPlanInput,
  PublicationPlan,
  PublicationPlanPackage,
  PublicationPlanValidation,
} from '../../model';

export type PublicationPlanStrategy = {
  readonly id: string;
  supports(input: BuildPublicationPlanInput): boolean;
  build(
    input: BuildPublicationPlanInput,
    createId: (prefix: string) => string,
  ): PublicationPlan;
  validate(plan: PublicationPlan): readonly string[];
};

export type PublicationPlanValidator = {
  validate(pkg: PublicationPlanPackage): PublicationPlanValidation;
  validateOrder(plan: PublicationPlan): readonly string[];
  validateDependencies(plan: PublicationPlan): readonly string[];
  validateIntegrity(plan: PublicationPlan): readonly string[];
};

export function createBasicPublicationPlanStrategy(): PublicationPlanStrategy {
  const collectPlanOrder = (
    rootArtifactId: string,
    dependencies: BuildPublicationPlanInput['dependencies'],
  ): string[] => {
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

    const order: string[] = [];
    const visited = new Set<string>();
    const visit = (node: string) => {
      if (visited.has(node)) {
        return;
      }
      visited.add(node);
      const next = [...(graph.get(node) ?? [])].sort();
      for (const child of next) {
        visit(child);
      }
      order.push(node);
    };
    visit(rootArtifactId);
    return [...new Set(order)];
  };

  return {
    id: 'basic-publication-plan-strategy',

    supports(input) {
      return input.rootArtifactId.trim().length > 0;
    },

    build(input, createId) {
      const dependencyKeys = input.dependencies
        .filter((dependency) => dependency.status === 'Active')
        .map(
          (dependency) =>
            `${dependency.sourceArtifactId}:${dependency.targetArtifactId}:${dependency.dependencyType}`,
        )
        .sort();
      const orderedArtifacts = collectPlanOrder(
        input.rootArtifactId,
        input.dependencies,
      );
      const steps = orderedArtifacts.map((artifactId, index) => ({
        id: createId('publication-plan-step'),
        artifactId,
        order: index + 1,
        operation:
          artifactId === input.rootArtifactId
            ? ('PUBLISH' as const)
            : index === 0
              ? ('VERIFY' as const)
              : ('PUBLISH' as const),
        status: 'Planned' as const,
      }));

      return {
        id: createId('publication-plan'),
        rootArtifactId: input.rootArtifactId,
        steps,
        dependencies: dependencyKeys,
        status: 'Draft',
        metadata: {
          title: input.title?.trim() || `Publication Plan ${input.rootArtifactId}`,
          notes:
            input.notes?.trim() ||
            'Deterministic publication plan derived from artifact dependencies.',
        },
      };
    },

    validate(plan) {
      if (plan.steps.length === 0) {
        return ['Publication plan has no steps.'];
      }
      return [];
    },
  };
}

export function createPublicationPlanValidator(options: {
  readonly now?: () => Date;
} = {}): PublicationPlanValidator {
  const now = options.now ?? (() => new Date());

  return {
    validate(pkg) {
      const issues = [
        ...this.validateOrder(pkg.plan).map((message) => ({
          code: 'plan-order',
          severity: 'error' as const,
          message,
        })),
        ...this.validateDependencies(pkg.plan).map((message) => ({
          code: 'plan-dependencies',
          severity: 'warning' as const,
          message,
        })),
        ...this.validateIntegrity(pkg.plan).map((message) => ({
          code: 'plan-integrity',
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

    validateOrder(plan) {
      const orders = plan.steps.map((step) => step.order);
      const unique = new Set(orders);
      return unique.size === orders.length
        ? []
        : ['Publication plan contains duplicate step order values.'];
    },

    validateDependencies(plan) {
      return plan.dependencies.length === 0
        ? ['Publication plan has no active dependency edges.']
        : [];
    },

    validateIntegrity(plan) {
      const issues: string[] = [];
      if (!plan.rootArtifactId.trim()) {
        issues.push('Publication plan requires rootArtifactId.');
      }
      if (!plan.steps.some((step) => step.artifactId === plan.rootArtifactId)) {
        issues.push('Publication plan must contain root artifact step.');
      }
      return issues;
    },
  };
}

export function buildInitialPublicationPlanPackage(
  input: InitializePublicationPlanInput,
  createId: (prefix: string) => string,
  now: () => Date,
): PublicationPlanPackage {
  const stamp = now().toISOString();
  return {
    id: createId('publication-plan-package'),
    version: '1.0.0',
    plan: {
      id: createId('publication-plan'),
      rootArtifactId: 'artifact-pending',
      steps: [],
      dependencies: [],
      status: 'Draft',
      metadata: {
        title: input.title?.trim() || `Publication Plan ${input.sessionId}`,
        notes: 'Awaiting plan build.',
      },
    },
    createdAt: stamp,
    updatedAt: stamp,
    metadata: {
      title: input.title?.trim() || `Publication Plan ${input.sessionId}`,
      sessionId: input.sessionId,
      notes: 'Publication plan package — planning only.',
      status: 'Draft',
    },
    validation: null,
  };
}
