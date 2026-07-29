import type {
  InitializeRuntimeApiInput,
  InvokeRuntimeOperationInput,
  RegisterRuntimeRouteInput,
  ResolveRuntimeRouteInput,
  RuntimeApiEvent,
  RuntimeApiIndexEntry,
  RuntimeApiInvocationResult,
  RuntimeApiPackage,
  RuntimeApiRoute,
  RuntimeApiValidation,
} from '../../model';
import {
  buildInitialApiRegistry,
  createBasicRuntimeApiStrategy,
  createRouteFromInput,
  createRuntimeApiValidator,
  type RuntimeApiStrategy,
  type RuntimeApiValidator,
} from './basic-runtime-api-strategy';
import {
  createRuntimeApiIndex,
  type RuntimeApiIndex,
} from './runtime-api-index';

export type RuntimeApiGatewayOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: RuntimeApiStrategy;
  readonly validator?: RuntimeApiValidator;
  readonly index?: RuntimeApiIndex;
};

/**
 * RuntimeApiGateway (EPIC-BLD-51).
 * Public entry boundary — routing only, no Runtime mutation.
 */
export type RuntimeApiGateway = {
  initialize(input: InitializeRuntimeApiInput): RuntimeApiPackage;
  resolve(
    apiPackageId: string,
    input: ResolveRuntimeRouteInput,
  ): RuntimeApiRoute | null;
  invoke(
    apiPackageId: string,
    input: InvokeRuntimeOperationInput,
  ): RuntimeApiInvocationResult;
  publish(packageId: string): RuntimeApiPackage;
  dispose(packageId: string): RuntimeApiPackage;
  registerRoute(
    apiPackageId: string,
    input: RegisterRuntimeRouteInput,
  ): RuntimeApiPackage;
  getPackage(packageId: string): RuntimeApiPackage | null;
  listPackages(): readonly RuntimeApiPackage[];
  listRoutes(apiPackageId?: string): readonly RuntimeApiRoute[];
  getEvents(): readonly RuntimeApiEvent[];
  getIndex(): readonly RuntimeApiIndexEntry[];
  validate(packageId: string): RuntimeApiValidation;
};

export function createRuntimeApiGateway(
  options: RuntimeApiGatewayOptions = {},
): RuntimeApiGateway {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicRuntimeApiStrategy();
  const validator = options.validator ?? createRuntimeApiValidator({ now });
  const index = options.index ?? createRuntimeApiIndex();

  const packages = new Map<string, RuntimeApiPackage>();
  const events: RuntimeApiEvent[] = [];

  const emit = (
    type: RuntimeApiEvent['type'],
    packageId: string,
    registryId: string | null,
    routeId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('runtime-api-event'),
      type,
      packageId,
      registryId,
      routeId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): RuntimeApiPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`API package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: RuntimeApiPackage): RuntimeApiPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const registerInto = (
    apiPackageId: string,
    input: RegisterRuntimeRouteInput,
  ): RuntimeApiPackage => {
    const pkg = requirePackage(apiPackageId);
    if (pkg.metadata.status === 'Disposed') {
      throw new Error('Cannot register route into disposed API package.');
    }
    if (!strategy.supports(input)) {
      throw new Error('API strategy does not support this route input.');
    }
    const route = createRouteFromInput(input, createId);
    const withoutDup = pkg.registry.routes.filter(
      (item) =>
        !(
          item.capability === route.capability &&
          item.operation === route.operation &&
          item.version === route.version
        ),
    );
    const next: RuntimeApiPackage = {
      ...pkg,
      updatedAt: now().toISOString(),
      registry: {
        ...pkg.registry,
        routes: [...withoutDup, route],
        generatedAt: now().toISOString(),
      },
      validation: null,
    };
    store(next);
    emit(
      'RuntimeRouteRegistered',
      next.id,
      next.registry.id,
      route.id,
      `Registered route ${route.capability}.${route.operation} → ${route.handler}.`,
    );
    return next;
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) {
        throw new Error('API gateway requires sessionId.');
      }
      const stamp = now().toISOString();
      const registry = buildInitialApiRegistry(input, createId, now);
      const pkg: RuntimeApiPackage = {
        id: createId('runtime-api-package'),
        version: '1.0.0',
        registry,
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title: registry.metadata.title,
          sessionId: registry.metadata.sessionId,
          notes: 'Runtime API Gateway package — public boundary only.',
          status: 'Draft',
        },
        validation: null,
      };
      let current = store(pkg);
      for (const route of input.routes ?? []) {
        current = registerInto(current.id, route);
      }
      return current;
    },

    registerRoute(apiPackageId, input) {
      return registerInto(apiPackageId, input);
    },

    resolve(apiPackageId, input) {
      const pkg = requirePackage(apiPackageId);
      const route = strategy.resolve(pkg.registry, input);
      if (route !== null) {
        emit(
          'RuntimeRouteResolved',
          pkg.id,
          pkg.registry.id,
          route.id,
          `Resolved ${route.capability}.${route.operation} → ${route.handler}.`,
        );
      }
      return route;
    },

    invoke(apiPackageId, input) {
      const pkg = requirePackage(apiPackageId);
      const route = strategy.resolve(pkg.registry, {
        capability: input.capability,
        operation: input.operation,
        version: input.version,
      });
      if (route === null) {
        throw new Error(
          `No route for ${input.capability}.${input.operation}.`,
        );
      }
      emit(
        'RuntimeRouteResolved',
        pkg.id,
        pkg.registry.id,
        route.id,
        `Resolved ${route.capability}.${route.operation} → ${route.handler}.`,
      );
      return strategy.invoke(route, input, createId, now);
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: RuntimeApiPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'RuntimeApiValidated',
        next.id,
        next.registry.id,
        null,
        validation.valid
          ? 'API package validated.'
          : `Validation failed with ${validation.issues.length} issue(s).`,
      );
      return validation;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      const validation = pkg.validation ?? validator.validate(pkg);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid API package.');
      }
      const next: RuntimeApiPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published Runtime API Gateway.',
        },
      };
      store(next);
      emit(
        'RuntimeApiPublished',
        next.id,
        next.registry.id,
        null,
        `Published API package ${next.id}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: RuntimeApiPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed API package (read-only archive).',
        },
      };
      store(next);
      return next;
    },

    getPackage(packageId) {
      return packages.get(packageId) ?? null;
    },

    listPackages() {
      return [...packages.values()];
    },

    listRoutes(apiPackageId) {
      if (apiPackageId === undefined) {
        return [...packages.values()].flatMap((item) => item.registry.routes);
      }
      return requirePackage(apiPackageId).registry.routes;
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
