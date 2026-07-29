import type {
  InitializeRuntimeApiInput,
  InvokeRuntimeOperationInput,
  RegisterRuntimeRouteInput,
  ResolveRuntimeRouteInput,
  RuntimeApiInvocationResult,
  RuntimeApiPackage,
  RuntimeApiRegistry,
  RuntimeApiRoute,
  RuntimeApiValidation,
  RuntimeApiValidationIssue,
} from '../../model';

/**
 * RuntimeApiStrategy (EPIC-BLD-51).
 * Deterministic resolve / invoke routing only — no business logic.
 */
export type RuntimeApiStrategy = {
  readonly id: string;
  supports(input: RegisterRuntimeRouteInput): boolean;
  resolve(
    registry: RuntimeApiRegistry,
    input: ResolveRuntimeRouteInput,
  ): RuntimeApiRoute | null;
  invoke(
    route: RuntimeApiRoute,
    input: InvokeRuntimeOperationInput,
    createId: (prefix: string) => string,
    now: () => Date,
  ): RuntimeApiInvocationResult;
};

/**
 * BasicRuntimeApiStrategy — route matching and passthrough acknowledgment.
 */
export function createBasicRuntimeApiStrategy(): RuntimeApiStrategy {
  return {
    id: 'basic-runtime-api-strategy',

    supports(input) {
      return (
        input.capability.trim().length > 0 &&
        input.operation.trim().length > 0 &&
        input.version.trim().length > 0 &&
        input.handler.trim().length > 0
      );
    },

    resolve(registry, input) {
      const capability = input.capability.trim();
      const operation = input.operation.trim();
      const version = input.version?.trim() || null;
      const matches = registry.routes.filter(
        (route) =>
          route.capability === capability && route.operation === operation,
      );
      if (matches.length === 0) {
        return null;
      }
      if (version !== null) {
        return matches.find((route) => route.version === version) ?? null;
      }
      return matches[matches.length - 1] ?? null;
    },

    invoke(route, input, createId, now) {
      return {
        requestId: input.requestId?.trim() || createId('runtime-api-request'),
        routeId: route.id,
        capability: route.capability,
        operation: route.operation,
        handler: route.handler,
        status: 'Routed',
        at: now().toISOString(),
        message: `Routed ${route.capability}.${route.operation} → ${route.handler} (no business execution).`,
      };
    },
  };
}

export function createRouteFromInput(
  input: RegisterRuntimeRouteInput,
  createId: (prefix: string) => string,
): RuntimeApiRoute {
  return {
    id: createId('runtime-api-route'),
    capability: input.capability,
    operation: input.operation,
    version: input.version,
    handler: input.handler,
    metadata: {
      title:
        input.title?.trim() ||
        `${input.capability}.${input.operation}`,
      notes:
        input.notes?.trim() ||
        'Gateway route — routing only, no business logic.',
      packageId: input.packageId ?? null,
      status: input.status?.trim() || 'Available',
    },
  };
}

/**
 * RuntimeApiValidator (EPIC-BLD-51).
 */
export type RuntimeApiValidator = {
  validate(pkg: RuntimeApiPackage): RuntimeApiValidation;
  validateRoutes(
    pkg: RuntimeApiPackage,
  ): readonly RuntimeApiValidationIssue[];
  validateRegistry(
    pkg: RuntimeApiPackage,
  ): readonly RuntimeApiValidationIssue[];
  validateIntegrity(
    pkg: RuntimeApiPackage,
  ): readonly RuntimeApiValidationIssue[];
};

export function createRuntimeApiValidator(options?: {
  readonly now?: () => Date;
}): RuntimeApiValidator {
  const now = options?.now ?? (() => new Date());

  const validateRegistry = (
    pkg: RuntimeApiPackage,
  ): RuntimeApiValidationIssue[] => {
    const issues: RuntimeApiValidationIssue[] = [];
    if (!pkg.registry.id.trim()) {
      issues.push({
        code: 'registry-missing-id',
        severity: 'error',
        message: 'API registry missing id.',
      });
    }
    if (!pkg.registry.metadata.sessionId.trim()) {
      issues.push({
        code: 'registry-missing-session',
        severity: 'error',
        message: `Registry ${pkg.registry.id} missing sessionId.`,
      });
    }
    return issues;
  };

  const validateRoutes = (
    pkg: RuntimeApiPackage,
  ): RuntimeApiValidationIssue[] => {
    const issues: RuntimeApiValidationIssue[] = [];
    const seen = new Set<string>();
    for (const route of pkg.registry.routes) {
      if (!route.capability.trim()) {
        issues.push({
          code: 'route-missing-capability',
          severity: 'error',
          message: `Route ${route.id} missing capability.`,
        });
      }
      if (!route.operation.trim()) {
        issues.push({
          code: 'route-missing-operation',
          severity: 'error',
          message: `Route ${route.id} missing operation.`,
        });
      }
      if (!route.handler.trim()) {
        issues.push({
          code: 'route-missing-handler',
          severity: 'error',
          message: `Route ${route.id} missing handler.`,
        });
      }
      const key = `${route.capability}:${route.operation}:${route.version}`;
      if (seen.has(key)) {
        issues.push({
          code: 'route-duplicate',
          severity: 'warning',
          message: `Duplicate route for ${key}.`,
        });
      }
      seen.add(key);
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: RuntimeApiPackage,
  ): RuntimeApiValidationIssue[] => {
    const issues: RuntimeApiValidationIssue[] = [];
    if (pkg.metadata.sessionId !== pkg.registry.metadata.sessionId) {
      issues.push({
        code: 'session-mismatch',
        severity: 'error',
        message: 'Package sessionId does not match registry.sessionId.',
      });
    }
    if (pkg.registry.routes.length === 0) {
      issues.push({
        code: 'registry-empty',
        severity: 'warning',
        message: 'API registry has no routes.',
      });
    }
    return issues;
  };

  return {
    validateRegistry,
    validateRoutes,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validateRegistry(pkg),
        ...validateRoutes(pkg),
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

export function buildInitialApiRegistry(
  input: InitializeRuntimeApiInput,
  createId: (prefix: string) => string,
  now: () => Date,
): RuntimeApiRegistry {
  return {
    id: createId('runtime-api-registry'),
    routes: [],
    generatedAt: now().toISOString(),
    metadata: {
      title: input.title?.trim() || `Runtime API ${input.sessionId}`,
      notes: 'Public Runtime API route registry — gateway boundary only.',
      sessionId: input.sessionId,
      manifestId: input.manifestId ?? null,
    },
  };
}
