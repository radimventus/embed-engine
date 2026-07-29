/**
 * Runtime API Gateway (EPIC-BLD-51).
 * Public boundary for Runtime capability access — routing only, no business logic.
 */

export type RuntimeApiRoute = {
  readonly id: string;
  readonly capability: string;
  readonly operation: string;
  readonly version: string;
  readonly handler: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly packageId: string | null;
    readonly status: string;
  };
};

export type RuntimeApiRegistry = {
  readonly id: string;
  readonly routes: readonly RuntimeApiRoute[];
  readonly generatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly sessionId: string;
    readonly manifestId: string | null;
  };
};

export type RuntimeApiPackage = {
  readonly id: string;
  readonly version: string;
  readonly registry: RuntimeApiRegistry;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: RuntimeApiValidation | null;
};

export type RuntimeApiValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimeApiValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimeApiValidationIssue[];
  readonly validatedAt: string;
};

export type RegisterRuntimeRouteInput = {
  readonly capability: string;
  readonly operation: string;
  readonly version: string;
  readonly handler: string;
  readonly title?: string;
  readonly notes?: string;
  readonly packageId?: string | null;
  readonly status?: string | null;
};

export type InitializeRuntimeApiInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly manifestId?: string | null;
  readonly routes?: readonly RegisterRuntimeRouteInput[];
};

export type ResolveRuntimeRouteInput = {
  readonly capability: string;
  readonly operation: string;
  readonly version?: string | null;
};

export type InvokeRuntimeOperationInput = {
  readonly capability: string;
  readonly operation: string;
  readonly version?: string | null;
  readonly requestId?: string | null;
};

export type RuntimeApiInvocationResult = {
  readonly requestId: string;
  readonly routeId: string;
  readonly capability: string;
  readonly operation: string;
  readonly handler: string;
  readonly status: 'Routed';
  readonly at: string;
  readonly message: string;
};

export type RuntimeApiIndexEntry = {
  readonly apiPackageId: string;
  readonly registryId: string;
  readonly routeId: string;
  readonly capability: string;
  readonly operation: string;
  readonly version: string;
  readonly handler: string;
};

export type RuntimeApiEventType =
  | 'RuntimeRouteRegistered'
  | 'RuntimeRouteResolved'
  | 'RuntimeApiPublished'
  | 'RuntimeApiValidated';

export type RuntimeApiEvent = {
  readonly eventId: string;
  readonly type: RuntimeApiEventType;
  readonly packageId: string;
  readonly registryId: string | null;
  readonly routeId: string | null;
  readonly at: string;
  readonly message: string;
};
