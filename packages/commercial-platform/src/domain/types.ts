/**
 * EPIC-BX-22 — Commercial Platform projection types (no billing domain).
 */

import type {
  CapabilityEntitlement,
  CapabilityId,
} from '@embed-engine/capabilities';

export type CommercialEdition = 'Pilot' | 'Professional' | 'Enterprise';

export type CommercialPlan = 'Trial' | 'Starter' | 'Growth' | 'Scale';

export type TrialStatus = 'active' | 'expired' | 'converted' | 'none';

/** Deterministic renewal projection — not a billing lifecycle. */
export type RenewalState = 'current' | 'due' | 'lapsed' | 'not-applicable';

export type CompanySubscriptionProjection = {
  readonly companyId: string;
  readonly companyName: string;
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly workspaceName: string;
  readonly edition: CommercialEdition;
  readonly plan: CommercialPlan;
  readonly trialStatus: TrialStatus;
  readonly renewalState: RenewalState;
  readonly projectCount: number;
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
  readonly trialStatus: TrialStatus;
  readonly renewalState: RenewalState;
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

export type CommercialCompanyRow = {
  readonly companyId: string;
  readonly companyName: string;
  readonly edition: CommercialEdition;
  readonly plan: CommercialPlan;
  readonly trialStatus: TrialStatus;
  readonly renewalState: RenewalState;
};

export type CommercialDashboard = {
  readonly companies: readonly CommercialCompanyRow[];
  readonly activeCompanies: number;
  readonly trialCompanies: number;
  readonly planCounts: Readonly<Record<CommercialPlan, number>>;
  readonly capabilityUsage: readonly {
    readonly capabilityId: CapabilityId;
    readonly companiesUsing: number;
  }[];
  readonly upgradeOpportunities: readonly UpgradeRecommendation[];
};

export type CommercialExecutiveView = {
  readonly revenueReadiness: string;
  readonly adoption: string;
  readonly commercialRisks: readonly string[];
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
