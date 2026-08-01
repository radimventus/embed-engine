/**
 * EPIC-BX-22 — Commercial Platform report over existing Company / Capability SSOT.
 */

import {
  composeStudioById,
  listCapabilities,
  type CapabilityId,
} from '@embed-engine/capabilities';
import {
  findTenant,
  getDefaultCompanyRegistry,
  listWorkspacesForCompany,
  type PlatformSession,
} from '@embed-engine/platform-access';

import type {
  CommercialDashboard,
  CommercialEdition,
  CommercialExecutiveView,
  CommercialPlan,
  CommercialPlatformReport,
  CompanySubscriptionProjection,
  LicenseProjection,
  RenewalState,
  TrialStatus,
  UpgradeRecommendation,
} from '../domain/types';
import {
  BUILDER_USAGE_CAPABILITIES,
  GROWTH_SIGNAL_CAPABILITIES,
  isCapabilityAvailableOnPlan,
} from './planEntitlements';

function derivePlan(input: {
  readonly pilot: boolean;
  readonly projectCount: number;
  readonly usingGrowthSignals: boolean;
}): CommercialPlan {
  if (input.pilot && input.projectCount <= 3 && !input.usingGrowthSignals) {
    return 'Trial';
  }
  if (input.usingGrowthSignals && input.projectCount >= 3) return 'Growth';
  if (input.usingGrowthSignals) return 'Starter';
  if (input.projectCount >= 5) return 'Scale';
  return 'Starter';
}

function deriveEdition(plan: CommercialPlan, pilot: boolean): CommercialEdition {
  if (plan === 'Scale') return 'Enterprise';
  if (plan === 'Growth') return 'Professional';
  if (pilot || plan === 'Trial') return 'Pilot';
  return 'Professional';
}

function deriveTrialStatus(
  plan: CommercialPlan,
  pilot: boolean,
): TrialStatus {
  if (plan === 'Trial') return 'active';
  if (pilot) return 'converted';
  return 'none';
}

function deriveRenewalState(
  plan: CommercialPlan,
  trialStatus: TrialStatus,
): RenewalState {
  if (trialStatus === 'expired') return 'lapsed';
  if (trialStatus === 'active' || plan === 'Trial') return 'due';
  if (trialStatus === 'none' && plan === 'Starter') return 'not-applicable';
  return 'current';
}

function declaredCommercialCapabilities(): readonly CapabilityId[] {
  const ids = new Set<CapabilityId>();
  for (const studioId of ['builder', 'manager', 'sales'] as const) {
    try {
      const host = composeStudioById(studioId);
      for (const id of host.declaredIds) {
        ids.add(id);
      }
    } catch {
      // ignore
    }
  }
  return [...ids];
}

function buildSubscriptions(
  _session: PlatformSession | null,
): readonly CompanySubscriptionProjection[] {
  const registry = getDefaultCompanyRegistry();
  const declared = declaredCommercialCapabilities();
  const usingGrowth = GROWTH_SIGNAL_CAPABILITIES.some((id) =>
    declared.includes(id),
  );

  return registry.companies.map((company) => {
    const tenant =
      findTenant(registry, company.tenantId) ??
      registry.tenants.find((item) => item.companyId === company.id);
    const workspaces = listWorkspacesForCompany(registry, company.id);
    const workspace = workspaces[0];
    const projectCount = registry.projects.filter(
      (project) => project.companyId === company.id,
    ).length;
    const pilot = tenant?.pilot === true;
    const plan = derivePlan({
      pilot,
      projectCount,
      usingGrowthSignals: usingGrowth,
    });
    const edition = deriveEdition(plan, pilot);
    const trialStatus = deriveTrialStatus(plan, pilot);
    const renewalState = deriveRenewalState(plan, trialStatus);
    const activeCapabilityIds = declared.filter((id) => {
      const def = listCapabilities().find((item) => item.id === id);
      if (def === undefined) return false;
      return isCapabilityAvailableOnPlan(def.entitlement, plan);
    });

    return {
      companyId: company.id,
      companyName: company.name,
      tenantId: tenant?.id ?? company.tenantId,
      workspaceId: workspace?.id ?? '—',
      workspaceName: workspace?.name ?? '—',
      edition,
      plan,
      trialStatus,
      renewalState,
      projectCount,
      activeCapabilityIds,
    };
  });
}

function buildUpgrades(
  subscriptions: readonly CompanySubscriptionProjection[],
): readonly UpgradeRecommendation[] {
  const upgrades: UpgradeRecommendation[] = [];
  for (const sub of subscriptions) {
    const usesCs = sub.activeCapabilityIds.includes('customer-success');
    const usesOps = sub.activeCapabilityIds.includes('operations-center');
    const highBuilderUsage =
      sub.projectCount >= 3 &&
      BUILDER_USAGE_CAPABILITIES.some((id) =>
        sub.activeCapabilityIds.includes(id),
      );

    if (
      highBuilderUsage &&
      usesCs &&
      (sub.plan === 'Trial' || sub.plan === 'Starter')
    ) {
      upgrades.push({
        id: `upgrade-${sub.companyId}-builder-growth`,
        companyId: sub.companyId,
        companyName: sub.companyName,
        title: 'Doporučen vyšší plán (Growth)',
        detail:
          'vysoké využití Builderu, Customer Success aktivní',
        suggestedPlan: 'Growth',
      });
    } else if (
      (usesCs || usesOps) &&
      (sub.plan === 'Trial' || sub.plan === 'Starter')
    ) {
      upgrades.push({
        id: `upgrade-${sub.companyId}-growth`,
        companyId: sub.companyId,
        companyName: sub.companyName,
        title: 'Doporučen vyšší plán (Growth)',
        detail: [
          usesCs ? 'Customer Success aktivní' : null,
          usesOps ? 'Operations aktivní' : null,
        ]
          .filter((item): item is string => item !== null)
          .join(', '),
        suggestedPlan: 'Growth',
      });
    }

    if (
      sub.activeCapabilityIds.includes('product-learning') &&
      sub.plan === 'Growth'
    ) {
      upgrades.push({
        id: `upgrade-${sub.companyId}-scale`,
        companyId: sub.companyId,
        companyName: sub.companyName,
        title: 'Zvažte Scale pro Product Learning at scale',
        detail: 'využíváte Product Learning na Growth plánu',
        suggestedPlan: 'Scale',
      });
    }
  }
  return upgrades;
}

function buildDashboard(
  subscriptions: readonly CompanySubscriptionProjection[],
  upgrades: readonly UpgradeRecommendation[],
): CommercialDashboard {
  const planCounts: Record<CommercialPlan, number> = {
    Trial: 0,
    Starter: 0,
    Growth: 0,
    Scale: 0,
  };
  const capabilityUsage = new Map<CapabilityId, number>();

  for (const sub of subscriptions) {
    planCounts[sub.plan] += 1;
    for (const id of sub.activeCapabilityIds) {
      capabilityUsage.set(id, (capabilityUsage.get(id) ?? 0) + 1);
    }
  }

  return {
    companies: subscriptions.map((sub) => ({
      companyId: sub.companyId,
      companyName: sub.companyName,
      edition: sub.edition,
      plan: sub.plan,
      trialStatus: sub.trialStatus,
      renewalState: sub.renewalState,
    })),
    activeCompanies: subscriptions.length,
    trialCompanies: subscriptions.filter((s) => s.trialStatus === 'active')
      .length,
    planCounts,
    capabilityUsage: [...capabilityUsage.entries()]
      .map(([capabilityId, companiesUsing]) => ({
        capabilityId,
        companiesUsing,
      }))
      .sort((a, b) => b.companiesUsing - a.companiesUsing),
    upgradeOpportunities: upgrades,
  };
}

function buildExecutive(
  dashboard: CommercialDashboard,
  subscriptions: readonly CompanySubscriptionProjection[],
): CommercialExecutiveView {
  const paid = subscriptions.filter((s) => s.plan !== 'Trial').length;
  const dueRenewals = subscriptions.filter((s) => s.renewalState === 'due')
    .length;
  const lapsed = subscriptions.filter((s) => s.renewalState === 'lapsed')
    .length;
  const readiness =
    dashboard.trialCompanies === 0 && paid > 0
      ? 'Revenue Ready'
      : dashboard.trialCompanies > 0
        ? 'Pilot / Trial — revenue path forming'
        : 'Not Ready';

  const commercialRisks: string[] = [];
  if (dashboard.trialCompanies > 0) {
    commercialRisks.push(
      `${dashboard.trialCompanies} firma(y) v aktivním trial — konverze není jistá`,
    );
  }
  if (dueRenewals > 0) {
    commercialRisks.push(
      `${dueRenewals} firma(y) se stavem renewal · due`,
    );
  }
  if (lapsed > 0) {
    commercialRisks.push(`${lapsed} firma(y) se stavem renewal · lapsed`);
  }
  if (commercialRisks.length === 0) {
    commercialRisks.push('Žádná kritická commercial rizika');
  }

  return {
    revenueReadiness: readiness,
    adoption: `${paid}/${dashboard.activeCompanies} paid-like plans · ${dashboard.trialCompanies} trial`,
    commercialRisks,
    growthOpportunities:
      dashboard.upgradeOpportunities.length > 0
        ? dashboard.upgradeOpportunities.map(
            (item) => `${item.companyName}: ${item.title}`,
          )
        : ['Žádné aktivní upgrade opportunities'],
    constraints: [
      'Bez billing / payment gateway / fakturace',
      'Capability Registry zůstává jediným zdrojem pravdy',
      'Commercial pouze projektuje existující Company / Workspace data',
      'Hidden entitlements nejsou komerčně nabízeny',
    ],
  };
}

export function buildCommercialPlatformReport(
  session: PlatformSession | null,
): CommercialPlatformReport {
  const subscriptions = buildSubscriptions(session);
  const entitlements = listCapabilities().map((def) => ({
    capabilityId: def.id,
    name: def.name,
    entitlement: def.entitlement,
    availableOnPlan: true,
  }));
  const licenses: LicenseProjection[] = subscriptions.map((sub) => ({
    companyId: sub.companyId,
    companyName: sub.companyName,
    workspaceId: sub.workspaceId,
    workspaceName: sub.workspaceName,
    plan: sub.plan,
    edition: sub.edition,
    trialStatus: sub.trialStatus,
    renewalState: sub.renewalState,
    enabledCapabilities: sub.activeCapabilityIds,
  }));
  const upgrades = buildUpgrades(subscriptions);
  const dashboard = buildDashboard(subscriptions, upgrades);
  const executive = buildExecutive(dashboard, subscriptions);

  const targetPlan: CommercialPlan = 'Growth';
  const entitlementRows = entitlements.map((row) => ({
    ...row,
    availableOnPlan: isCapabilityAvailableOnPlan(row.entitlement, targetPlan),
  }));

  return {
    subscriptions,
    entitlements: entitlementRows,
    licenses,
    upgrades,
    dashboard,
    executive,
  };
}
