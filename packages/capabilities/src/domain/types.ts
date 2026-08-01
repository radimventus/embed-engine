/**
 * EPIC-BX-13 / BX-21 / BX-22 — Capability Platform domain model (orchestration only).
 * Pure TypeScript — no React, no Runtime/HP/Publish coupling.
 */

export type StudioId = 'builder' | 'manager' | 'sales';

export type CapabilityId =
  | 'dashboard'
  | 'media'
  | 'knowledge'
  | 'experience'
  | 'preview'
  | 'release'
  | 'collaboration'
  | 'intelligence'
  | 'ai'
  | 'operations'
  | 'pipeline'
  | 'customer-success'
  | 'operations-center'
  | 'product-learning'
  | 'commercial-platform';

/**
 * Commercial entitlement class — Registry remains SSOT; Commercial only projects.
 * `hidden` = not commercially offered (never unlocked by plan rules).
 */
export type CapabilityEntitlement =
  | 'included'
  | 'optional'
  | 'experimental'
  | 'hidden';

export type CapabilityMaturity =
  | 'experimental'
  | 'beta'
  | 'stable'
  | 'deprecated';

export type CapabilityHealthStatus = 'healthy' | 'degraded' | 'inactive' | 'error';

export type CapabilityDefinition = {
  readonly id: CapabilityId;
  readonly name: string;
  readonly version: string;
  readonly owner: string;
  readonly studioSupport: readonly StudioId[];
  readonly dependencies: readonly CapabilityId[];
  readonly maturity: CapabilityMaturity;
  readonly entitlement: CapabilityEntitlement;
  readonly description: string;
};

export type CapabilityMetadata = {
  readonly id: CapabilityId;
  readonly name: string;
  readonly version: string;
  readonly owner: string;
  readonly maturity: CapabilityMaturity;
  readonly entitlement: CapabilityEntitlement;
  readonly description: string;
  readonly studioSupport: readonly StudioId[];
  readonly dependencies: readonly CapabilityId[];
};

export type CapabilityHealth = {
  readonly id: CapabilityId;
  readonly status: CapabilityHealthStatus;
  readonly active: boolean;
  readonly message: string;
  readonly checkedAt: string;
};

/**
 * Unified Capability API — every capability instance implements this.
 */
export type CapabilityApi = {
  readonly id: CapabilityId;
  activate: () => CapabilityHealth;
  deactivate: () => CapabilityHealth;
  health: () => CapabilityHealth;
  metadata: () => CapabilityMetadata;
};

export type CapabilityManifestEntry = {
  readonly id: CapabilityId;
};

export type CapabilityManifest = {
  readonly studioId: StudioId;
  readonly version: string;
  readonly uses: readonly CapabilityManifestEntry[];
};

export type StudioComposition = {
  readonly studioId: StudioId;
  readonly label: string;
  readonly manifest: CapabilityManifest;
};

export type CapabilityInspectorModel = {
  readonly studioId: StudioId;
  readonly activeCapabilityId: CapabilityId | null;
  readonly capabilities: readonly {
    readonly metadata: CapabilityMetadata;
    readonly health: CapabilityHealth;
    readonly declared: boolean;
  }[];
};
