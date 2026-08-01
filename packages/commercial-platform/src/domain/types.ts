/**
 * EPIC-BX-21 — Commercial Platform projection types (no billing domain).
 */

import type {
  CapabilityEntitlement,
  CapabilityId,
} from '@embed-engine/capabilities';

export type CommercialEdition = 'Pilot' | 'Professional' | 'Enterprise';

export type CommercialPlan = 'Trial' | 'Starter' | 'Growth' | 'Scale';

export type TrialStatus = 'active' | 'expired' | 'converted' | 'none';

export type CompanySubscriptionProjection = {
  readonly companyId: string;
  readonly companyName: string;
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly workspaceName: string;
  readonly edition: CommercialEdition;
  readonly plan: CommercialPlan;
  readonly trialStatus: TrialStatus;
  readonly activeCapabilityIds: readonly CapabilityId[];
};

export type CapabilityEntitlementRow = {
  readonly capabilityId: CapabilityId;
  readonly name: string;
  readonly entitlement: CapabilityEntitlement;
  readonly availableOnPlan: boolean;
};

export type LicenseProjection = {
  readonly companyId: string;
  readonly companyName: string;
  readonly workspaceId: string;
  readonly workspaceName: string;
  readonly plan: CommercialPlan;
  readonly edition: CommercialEdition;
  readonly enabledCapabilities: readonly CapabilityId[];
};

export type UpgradeRecommendation = {
  readonly id: string;
  readonly companyId: string;
  readonly companyName: string;
  readonly title: string;
  readonly detail: string;
  readonly suggestedPlan: CommercialPlan;
};

export type CommercialDashboard = {
  readonly activeCompanies: number;
  readonly trialCompanies: number;
  readonly planCounts: Readonly<Record<CommercialPlan, number>>;
  readonly capabilityUsage: readonly {
    readonly capabilityId: CapabilityId;
    readonly companiesUsing: number;
  }[];
  readonly recommendedUpgrades: readonly UpgradeRecommendation[];
};

export type CommercialExecutiveView = {
  readonly commercialReadiness: string;
  readonly adoption: string;
  readonly capabilityUsage: string;
  readonly growthOpportunities: readonly string[];
  readonly constraints: readonly string[];
};

export type CommercialPlatformReport = {
  readonly subscriptions: readonly CompanySubscriptionProjection[];
  readonly entitlements: readonly CapabilityEntitlementRow[];
  readonly licenses: readonly LicenseProjection[];
  readonly upgrades: readonly UpgradeRecommendation[];
  readonly dashboard: CommercialDashboard;
  readonly executive: CommercialExecutiveView;
};
