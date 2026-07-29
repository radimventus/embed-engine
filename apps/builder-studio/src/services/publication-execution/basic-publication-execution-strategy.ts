import type {
  InitializePublicationExecutionInput,
  PublicationExecutionPackage,
  PublicationExecutionSession,
  PublicationExecutionValidation,
  StartPublicationExecutionInput,
} from '../../model';

export type PublicationExecutionStrategy = {
  readonly id: string;
  supports(input: StartPublicationExecutionInput): boolean;
  start(
    input: StartPublicationExecutionInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): PublicationExecutionSession;
  execute(
    session: PublicationExecutionSession,
    now: () => Date,
  ): PublicationExecutionSession;
};

export type PublicationExecutionValidator = {
  validate(pkg: PublicationExecutionPackage): PublicationExecutionValidation;
  validateSession(session: PublicationExecutionSession): readonly string[];
  validateOrder(session: PublicationExecutionSession): readonly string[];
  validateIntegrity(session: PublicationExecutionSession): readonly string[];
};

export function createBasicPublicationExecutionStrategy(): PublicationExecutionStrategy {
  return {
    id: 'basic-publication-execution-strategy',

    supports(input) {
      return (
        input.planId.trim().length > 0 &&
        input.rootArtifactId.trim().length > 0 &&
        input.totalSteps > 0
      );
    },

    start(input, createId, now) {
      return {
        id: createId('publication-execution-session'),
        planId: input.planId,
        status: 'RUNNING',
        currentStep: 0,
        startedAt: now().toISOString(),
        finishedAt: null,
        metadata: {
          title: input.title?.trim() || `Execution ${input.rootArtifactId}`,
          notes:
            input.notes?.trim() ||
            'Initialized deterministic publication execution session.',
          rootArtifactId: input.rootArtifactId,
          totalSteps: input.totalSteps,
          completedSteps: 0,
        },
      };
    },

    execute(session, now) {
      const nextStep = session.currentStep + 1;
      const completed = Math.min(nextStep, session.metadata.totalSteps);
      const completedAll = completed >= session.metadata.totalSteps;
      return {
        ...session,
        currentStep: nextStep,
        status: completedAll ? 'COMPLETED' : 'RUNNING',
        finishedAt: completedAll ? now().toISOString() : null,
        metadata: {
          ...session.metadata,
          completedSteps: completed,
          notes: completedAll
            ? 'Execution completed deterministically.'
            : 'Execution step completed.',
        },
      };
    },
  };
}

export function createPublicationExecutionValidator(options: {
  readonly now?: () => Date;
} = {}): PublicationExecutionValidator {
  const now = options.now ?? (() => new Date());

  return {
    validate(pkg) {
      const issues = [
        ...this.validateSession(pkg.session).map((message) => ({
          code: 'execution-session',
          severity: 'error' as const,
          message,
        })),
        ...this.validateOrder(pkg.session).map((message) => ({
          code: 'execution-order',
          severity: 'warning' as const,
          message,
        })),
        ...this.validateIntegrity(pkg.session).map((message) => ({
          code: 'execution-integrity',
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

    validateSession(session) {
      const issues: string[] = [];
      if (!session.planId.trim()) {
        issues.push('Execution session requires planId.');
      }
      if (!session.metadata.rootArtifactId.trim()) {
        issues.push('Execution session requires rootArtifactId.');
      }
      if (session.metadata.totalSteps <= 0) {
        issues.push('Execution session requires totalSteps > 0.');
      }
      return issues;
    },

    validateOrder(session) {
      if (session.currentStep > session.metadata.totalSteps) {
        return ['Current step exceeded total steps.'];
      }
      return [];
    },

    validateIntegrity(session) {
      const issues: string[] = [];
      if (session.status === 'COMPLETED' && session.finishedAt === null) {
        issues.push('Completed execution must have finishedAt.');
      }
      if (session.status === 'RUNNING' && session.startedAt === null) {
        issues.push('Running execution must have startedAt.');
      }
      return issues;
    },
  };
}

export function buildInitialPublicationExecutionPackage(
  input: InitializePublicationExecutionInput,
  createId: (prefix: string) => string,
  now: () => Date,
): PublicationExecutionPackage {
  const stamp = now().toISOString();
  return {
    id: createId('publication-execution-package'),
    version: '1.0.0',
    session: {
      id: createId('publication-execution-session'),
      planId: 'plan-pending',
      status: 'PENDING',
      currentStep: 0,
      startedAt: null,
      finishedAt: null,
      metadata: {
        title: input.title?.trim() || `Publication Execution ${input.sessionId}`,
        notes: 'Awaiting execution start.',
        rootArtifactId: 'artifact-pending',
        totalSteps: 1,
        completedSteps: 0,
      },
    },
    createdAt: stamp,
    updatedAt: stamp,
    metadata: {
      title: input.title?.trim() || `Publication Execution ${input.sessionId}`,
      sessionId: input.sessionId,
      notes: 'Publication execution package — orchestration only.',
      status: 'Draft',
    },
    validation: null,
  };
}
