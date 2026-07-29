import type {
  BuildRuntimeBootstrapInput,
  InitializeRuntimeBootstrapInput,
  RuntimeBootstrapPackage,
  RuntimeBootstrapValidation,
  RuntimeSessionModel,
} from '../../model';

export type RuntimeBootstrapStrategy = {
  readonly id: string;
  supports(input: BuildRuntimeBootstrapInput): boolean;
  build(
    input: BuildRuntimeBootstrapInput,
    createId: (prefix: string) => string,
  ): RuntimeSessionModel;
  publish(session: RuntimeSessionModel): RuntimeSessionModel;
};

export type RuntimeBootstrapValidator = {
  validate(pkg: RuntimeBootstrapPackage): RuntimeBootstrapValidation;
  validateSession(session: RuntimeSessionModel): readonly string[];
  validateMetadata(session: RuntimeSessionModel): readonly string[];
  validateIntegrity(session: RuntimeSessionModel): readonly string[];
};

export function createBasicRuntimeBootstrapStrategy(): RuntimeBootstrapStrategy {
  return {
    id: 'basic-runtime-bootstrap-strategy',

    supports(input) {
      return (
        input.runtimeVersion.trim().length > 0 &&
        input.bootstrapVersion.trim().length > 0
      );
    },

    build(input, createId) {
      return {
        id: createId('runtime-session-model'),
        publicationId: input.publicationId,
        objectId: input.objectId,
        runtimeVersion: input.runtimeVersion,
        bootstrapVersion: input.bootstrapVersion,
        metadata: {
          title: input.title?.trim() || input.objectId,
          notes:
            input.notes?.trim() ||
            'Prepared deterministic Runtime bootstrap input package.',
          readinessStatus: input.readinessStatus ?? 'UNKNOWN',
          sessionState: 'Prepared',
        },
      };
    },

    publish(session) {
      return {
        ...session,
        metadata: {
          ...session.metadata,
          sessionState: 'Published',
          notes: 'Published Runtime bootstrap package.',
        },
      };
    },
  };
}

export function createRuntimeBootstrapValidator(options: {
  readonly now?: () => Date;
} = {}): RuntimeBootstrapValidator {
  const now = options.now ?? (() => new Date());

  return {
    validate(pkg) {
      const issues = [
        ...this.validateSession(pkg.runtimeSession).map((message) => ({
          code: 'runtime-session',
          severity: 'error' as const,
          message,
        })),
        ...this.validateMetadata(pkg.runtimeSession).map((message) => ({
          code: 'runtime-metadata',
          severity: 'warning' as const,
          message,
        })),
        ...this.validateIntegrity(pkg.runtimeSession).map((message) => ({
          code: 'runtime-integrity',
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
      if (!session.publicationId.trim()) {
        issues.push('Runtime bootstrap requires publicationId.');
      }
      if (!session.objectId.trim()) {
        issues.push('Runtime bootstrap requires objectId.');
      }
      if (!session.runtimeVersion.trim()) {
        issues.push('Runtime bootstrap requires runtimeVersion.');
      }
      if (!session.bootstrapVersion.trim()) {
        issues.push('Runtime bootstrap requires bootstrapVersion.');
      }
      return issues;
    },

    validateMetadata(session) {
      const warnings: string[] = [];
      if (session.metadata.readinessStatus === 'UNKNOWN') {
        warnings.push('Runtime bootstrap has unknown readiness status.');
      }
      if (session.metadata.readinessStatus === 'NOT_READY') {
        warnings.push('Runtime bootstrap references a NOT_READY publication.');
      }
      return warnings;
    },

    validateIntegrity(session) {
      const issues: string[] = [];
      if (!session.id.trim()) {
        issues.push('Runtime bootstrap session requires id.');
      }
      return issues;
    },
  };
}

export function buildInitialRuntimeBootstrapPackage(
  input: InitializeRuntimeBootstrapInput,
  createId: (prefix: string) => string,
  now: () => Date,
): RuntimeBootstrapPackage {
  const stamp = now().toISOString();
  return {
    id: createId('runtime-bootstrap-package'),
    version: '1.0.0',
    runtimeSession: {
      id: createId('runtime-session-model'),
      publicationId: 'publication-pending',
      objectId: 'object-pending',
      runtimeVersion: 'runtime-pending',
      bootstrapVersion: '0.0.0',
      metadata: {
        title: input.title?.trim() || `Runtime Bootstrap ${input.sessionId}`,
        notes: 'Awaiting bootstrap build.',
        readinessStatus: 'UNKNOWN',
        sessionState: 'Prepared',
      },
    },
    createdAt: stamp,
    updatedAt: stamp,
    metadata: {
      title: input.title?.trim() || `Runtime Bootstrap ${input.sessionId}`,
      sessionId: input.sessionId,
      notes: 'Runtime bootstrap package — input preparation only.',
      status: 'Draft',
    },
    validation: null,
  };
}
