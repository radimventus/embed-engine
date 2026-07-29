/**
 * Runtime Integration Registry (EPIC-BLD-49).
 * Registry of published Runtime integration artifacts — lookup only.
 */

import type { RuntimeIntegrationPackageType } from './runtime-integration-types';

export type RuntimeRegistryPackageType = RuntimeIntegrationPackageType;

export type RuntimeRegistryEntry = {
  readonly id: string;
  readonly packageId: string;
  readonly packageType: RuntimeRegistryPackageType;
  readonly version: string;
  readonly source: string;
  readonly registeredAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly status: string;
    readonly publishedAt: string | null;
  };
};

export type RuntimeRegistryCatalog = {
  readonly id: string;
  readonly entries: readonly RuntimeRegistryEntry[];
  readonly createdAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly sessionId: string;
  };
};

export type RuntimeRegistryPackage = {
  readonly id: string;
  readonly version: string;
  readonly catalog: RuntimeRegistryCatalog;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: RuntimeRegistryValidation | null;
};

export type RuntimeRegistryValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimeRegistryValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimeRegistryValidationIssue[];
  readonly validatedAt: string;
};

export type RegisterRegistryPackageInput = {
  readonly packageId: string;
  readonly packageType: RuntimeRegistryPackageType;
  readonly version: string;
  readonly source: string;
  readonly registeredAt?: string | null;
  readonly publishedAt?: string | null;
  readonly title?: string;
  readonly status?: string | null;
  readonly notes?: string | null;
};

export type InitializeRegistryInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly packages?: readonly RegisterRegistryPackageInput[];
};

export type RuntimeRegistryIndexEntry = {
  readonly registryPackageId: string;
  readonly catalogId: string;
  readonly entryId: string;
  readonly packageId: string;
  readonly packageType: RuntimeRegistryPackageType;
  readonly version: string;
  readonly source: string;
};

export type RuntimeRegistryEventType =
  | 'RuntimePackageRegistered'
  | 'RuntimePackageUpdated'
  | 'RuntimeRegistryValidated'
  | 'RuntimeRegistryPublished';

export type RuntimeRegistryEvent = {
  readonly eventId: string;
  readonly type: RuntimeRegistryEventType;
  readonly packageId: string;
  readonly catalogId: string | null;
  readonly entryId: string | null;
  readonly at: string;
  readonly message: string;
};
