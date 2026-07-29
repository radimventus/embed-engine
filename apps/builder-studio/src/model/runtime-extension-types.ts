/**
 * Runtime Extension Framework (EPIC-BLD-54).
 * Deterministic extension registry — no Runtime mutation or dynamic loading.
 */

export type RuntimeExtensionStatus =
  | 'Registered'
  | 'Enabled'
  | 'Disabled'
  | 'Published';

export type RuntimeExtension = {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capability: string;
  readonly dependencies: readonly string[];
  readonly status: RuntimeExtensionStatus;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly contractId: string | null;
    readonly source: string;
  };
};

export type RuntimeExtensionRegistry = {
  readonly id: string;
  readonly extensions: readonly RuntimeExtension[];
  readonly generatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly sessionId: string;
  };
};

export type RuntimeExtensionPackage = {
  readonly id: string;
  readonly version: string;
  readonly registry: RuntimeExtensionRegistry;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: RuntimeExtensionValidation | null;
};

export type RuntimeExtensionValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimeExtensionValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimeExtensionValidationIssue[];
  readonly validatedAt: string;
};

export type RegisterRuntimeExtensionInput = {
  readonly name: string;
  readonly version: string;
  readonly capability: string;
  readonly dependencies?: readonly string[];
  readonly title?: string;
  readonly notes?: string;
  readonly contractId?: string | null;
  readonly source?: string;
  readonly status?: RuntimeExtensionStatus;
};

export type InitializeExtensionInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly extensions?: readonly RegisterRuntimeExtensionInput[];
};

export type RuntimeExtensionIndexEntry = {
  readonly packageId: string;
  readonly registryId: string;
  readonly extensionId: string;
  readonly name: string;
  readonly capability: string;
  readonly version: string;
  readonly status: RuntimeExtensionStatus;
};

export type RuntimeExtensionEventType =
  | 'RuntimeExtensionRegistered'
  | 'RuntimeExtensionEnabled'
  | 'RuntimeExtensionDisabled'
  | 'RuntimeExtensionPublished';

export type RuntimeExtensionEvent = {
  readonly eventId: string;
  readonly type: RuntimeExtensionEventType;
  readonly packageId: string;
  readonly registryId: string | null;
  readonly extensionId: string | null;
  readonly at: string;
  readonly message: string;
};
