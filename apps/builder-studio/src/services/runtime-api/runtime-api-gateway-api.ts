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
  createRuntimeApiGateway,
  type RuntimeApiGateway,
} from './runtime-api-gateway';

/**
 * Runtime API Gateway surface API (EPIC-BLD-51).
 */
export type RuntimeApiGatewayApi = {
  registerRuntimeRoute(
    apiPackageId: string | null,
    input: RegisterRuntimeRouteInput,
    init?: InitializeRuntimeApiInput,
  ): RuntimeApiPackage;
  resolveRuntimeRoute(
    apiPackageId: string,
    input: ResolveRuntimeRouteInput,
  ): RuntimeApiRoute | null;
  invokeRuntimeOperation(
    apiPackageId: string,
    input: InvokeRuntimeOperationInput,
  ): RuntimeApiInvocationResult;
  listRuntimeRoutes(apiPackageId?: string): readonly RuntimeApiRoute[];
  validateRuntimeApi(packageId: string): RuntimeApiValidation;
  publishRuntimeApi(packageId: string): RuntimeApiPackage;
  initialize(input: InitializeRuntimeApiInput): RuntimeApiPackage;
  preview(packageId: string): RuntimeApiPackage | null;
  listPackages(): readonly RuntimeApiPackage[];
  listEvents(): readonly RuntimeApiEvent[];
  listIndex(): readonly RuntimeApiIndexEntry[];
  dispose(packageId: string): RuntimeApiPackage;
};

export function createRuntimeApiGatewayApi(
  gateway?: RuntimeApiGateway,
): RuntimeApiGatewayApi {
  const api = gateway ?? createRuntimeApiGateway();

  return {
    initialize(input) {
      return api.initialize(input);
    },
    registerRuntimeRoute(apiPackageId, input, init) {
      if (apiPackageId === null) {
        const created = api.initialize(
          init ?? {
            sessionId: 'runtime-session-demo',
            title: 'Builder Runtime API',
            routes: [input],
          },
        );
        if (
          created.registry.routes.some(
            (route) =>
              route.capability === input.capability &&
              route.operation === input.operation &&
              route.version === input.version,
          )
        ) {
          return created;
        }
        return api.registerRoute(created.id, input);
      }
      return api.registerRoute(apiPackageId, input);
    },
    resolveRuntimeRoute(apiPackageId, input) {
      return api.resolve(apiPackageId, input);
    },
    invokeRuntimeOperation(apiPackageId, input) {
      return api.invoke(apiPackageId, input);
    },
    listRuntimeRoutes(apiPackageId) {
      return api.listRoutes(apiPackageId);
    },
    validateRuntimeApi(packageId) {
      return api.validate(packageId);
    },
    publishRuntimeApi(packageId) {
      api.validate(packageId);
      return api.publish(packageId);
    },
    preview(packageId) {
      return api.getPackage(packageId);
    },
    listPackages() {
      return api.listPackages();
    },
    listEvents() {
      return api.getEvents();
    },
    listIndex() {
      return api.getIndex();
    },
    dispose(packageId) {
      return api.dispose(packageId);
    },
  };
}
