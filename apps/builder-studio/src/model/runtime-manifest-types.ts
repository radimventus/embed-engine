/**
 * Runtime Manifest Engine (EPIC-BLD-50).
 * Declarative description of published Runtime capabilities — no Runtime mutation.
 */

export type RuntimeCapabilityDescriptor = {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly package: string;
  readonly dependencies: readonly string[];
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly source: string;
    readonly packageType: string;
  };
};

export type RuntimeManifest = {
  readonly id: string;
  readonly version: string;
  readonly capabilities: readonly RuntimeCapabilityDescriptor[];
  readonly packages: readonly string[];
  readonly registryVersion: string;
  readonly generatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly notes: string;
    readonly sessionId: string;
  };
};

export type RuntimeManifestPackage = {
  readonly id: string;
  readonly version: string;
  readonly manifest: RuntimeManifest;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: {
    readonly title: string;
    readonly sessionId: string;
    readonly notes: string;
    readonly status: 'Draft' | 'Published' | 'Disposed';
  };
  readonly validation: RuntimeManifestValidation | null;
};

export type RuntimeManifestValidationIssue = {
  readonly code: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
};

export type RuntimeManifestValidation = {
  readonly valid: boolean;
  readonly issues: readonly RuntimeManifestValidationIssue[];
  readonly validatedAt: string;
};

export type CollectManifestCapabilityInput = {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly packageId: string;
  readonly dependencies?: readonly string[];
  readonly source?: string;
  readonly packageType?: string;
  readonly title?: string;
  readonly notes?: string;
};

export type CollectManifestInput = {
  readonly sessionId: string;
  readonly title?: string;
  readonly registryVersion?: string;
  readonly manifestVersion?: string;
  readonly capabilities?: readonly CollectManifestCapabilityInput[];
};

export type RuntimeManifestIndexEntry = {
  readonly packageId: string;
  readonly manifestId: string;
  readonly sessionId: string;
  readonly capabilityCount: number;
  readonly registryVersion: string;
};

export type RuntimeManifestEventType =
  | 'RuntimeManifestGenerated'
  | 'RuntimeManifestValidated'
  | 'RuntimeManifestPublished';

export type RuntimeManifestEvent = {
  readonly eventId: string;
  readonly type: RuntimeManifestEventType;
  readonly packageId: string;
  readonly manifestId: string | null;
  readonly at: string;
  readonly message: string;
};
