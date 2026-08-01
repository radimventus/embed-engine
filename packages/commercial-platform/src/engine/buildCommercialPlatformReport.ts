/**
 * EPIC-BX-21 — Commercial Platform report over existing Company / Capability SSOT.
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
  TrialStatus,
  UpgradeRecommendation,
} from '../domain/types';
import {
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
    const tenant = findTenant(
      registry,
      company.tenantId,
    ) ?? registry.tenants.find((item) => item.companyId === company.id);
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
    if (
      (usesCs || usesOps) &&
      (sub.plan === 'Trial' || sub.plan === 'Starter')
    ) {
      upgrades.push({
        id: `upgrade-${sub.companyId}-growth`,
        companyId: sub.companyId,
        companyName: sub.companyName,
        title: 'Doporučen vyšší plán (Growth)',
        detail: [
          usesCs ? 'využíváte Customer Success' : null,
          usesOps ? 'využíváte Operations' : null,
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
    recommendedUpgrades: upgrades,
  };
}

function buildExecutive(
  dashboard: CommercialDashboard,
  subscriptions: readonly CompanySubscriptionProjection[],
): CommercialExecutiveView {
  const paid = subscriptions.filter((s) => s.plan !== 'Trial').length;
  const readiness =
    dashboard.trialCompanies === 0 && paid > 0
      ? 'Commercial Ready'
      : dashboard.trialCompanies > 0
        ? 'Pilot / Trial in progress'
        : 'Not Ready';

  return {
    commercialReadiness: readiness,
    adoption: `${paid}/${dashboard.activeCompanies} paid-like plans · ${dashboard.trialCompanies} trial`,
    capabilityUsage: `${dashboard.capabilityUsage.length} capabilities in use across firms`,
    growthOpportunities:
      dashboard.recommendedUpgrades.length > 0
        ? dashboard.recommendedUpgrades.map(
            (item) => `${item.companyName}: ${item.title}`,
          )
        : ['Žádné aktivní upgrade doporučení'],
    constraints: [
      'Bez billing / payment gateway / fakturace',
      'Capability Registry zůstává jediným zdrojem pravdy',
      'Commercial pouze projektuje existující Company / Workspace data',
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
    enabledCapabilities: sub.activeCapabilityIds,
  }));
  const upgrades = buildUpgrades(subscriptions);
  const dashboard = buildDashboard(subscriptions, upgrades);
  const executive = buildExecutive(dashboard, subscriptions);

  // Mark entitlement availability against dominant plan (Growth as default SaaS target).
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
