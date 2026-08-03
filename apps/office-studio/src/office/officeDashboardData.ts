/**
 * OF-01 / OF-02 / PE-08 / PE-09 / PE-11 — Office dashboard.
 */

import type { OfficePartner } from './officePartnerModel';
import { officePartnerStatusLabel } from './officePartnerModel';
import { listPartners } from './officePartnerRegistry';
import {
  listNewlyActivated,
  listReadyForFollowUp,
  listWaitingActivation,
  syncAllCommercialFollowUps,
} from './officeCommercialFollowUpRegistry';
import type { PartnerCommercialFollowUp } from './officeCommercialFollowUpModel';
import {
  listPartnerWorkspaceSummaries,
  type PartnerWorkspaceSummary,
} from './officePartnerEnvironmentLifecycle';

export type OfficeDashboardCard = {
  readonly id: string;
  readonly title: string;
  readonly value: number;
  readonly hint: string;
};

export type OfficePartnerSummary = {
  readonly id: string;
  readonly name: string;
  readonly status: string;
  readonly nextStep: string;
};

export type OfficeActionItem = {
  readonly id: string;
  readonly title: string;
  readonly owner: string;
  readonly dueLabel: string;
};

export type OfficeFollowUpDashboard = {
  readonly waitingActivation: readonly PartnerCommercialFollowUp[];
  readonly newlyActivated: readonly PartnerCommercialFollowUp[];
  readonly readyForFollowUp: readonly PartnerCommercialFollowUp[];
};

function toSummary(partner: OfficePartner): OfficePartnerSummary {
  return {
    id: partner.id,
    name: partner.name,
    status: officePartnerStatusLabel(partner.status),
    nextStep: partner.nextStep,
  };
}

export function buildOfficeDashboardCards(
  partners: readonly OfficePartner[] = listPartners(),
): readonly OfficeDashboardCard[] {
  const followUps = syncAllCommercialFollowUps();
  const waitingActivation = followUps.filter(
    (item) => !item.activity.accountActivated,
  );
  const newlyActivated = followUps.filter((item) => item.newlyActivated);
  const workspaceSummaries = listPartnerWorkspaceSummaries();
  return [
    {
      id: 'new-partners',
      title: 'Noví partneři',
      value: partners.length,
      hint: 'V Partner Registry',
    },
    {
      id: 'followup-waiting-activation',
      title: 'Čekají na aktivaci',
      value: waitingActivation.length,
      hint: 'Pilot odeslán · účet ještě není aktivní',
    },
    {
      id: 'followup-newly-activated',
      title: 'Nově aktivovaní',
      value: newlyActivated.length,
      hint: 'Aktivace během posledních 48 hodin',
    },
    {
      id: 'active-partner-environments',
      title: 'Active Partner',
      value: workspaceSummaries.filter(
        (item) => item.lifecycleStatus === 'active',
      ).length,
      hint: 'Dlouhodobé Partner Environment',
    },
  ];
}

export function buildOfficeFollowUpDashboard(
  nowMs = Date.now(),
): OfficeFollowUpDashboard {
  syncAllCommercialFollowUps(nowMs);
  return {
    waitingActivation: listWaitingActivation(nowMs),
    newlyActivated: listNewlyActivated(nowMs),
    readyForFollowUp: listReadyForFollowUp(nowMs),
  };
}

export function listOfficeWorkspaceSummaries(): readonly PartnerWorkspaceSummary[] {
  return listPartnerWorkspaceSummaries();
}

export function listOfficePartnerSummaries(
  partners: readonly OfficePartner[] = listPartners(),
): readonly OfficePartnerSummary[] {
  return partners.map(toSummary);
}

export function listOfficeWaitingActions(
  partners: readonly OfficePartner[] = listPartners(),
): readonly OfficeActionItem[] {
  return partners
    .filter((partner) => partner.status !== 'active')
    .slice(0, 5)
    .map((partner) => ({
      id: `action-${partner.id}`,
      title: partner.nextStep,
      owner: partner.name,
      dueLabel: officePartnerStatusLabel(partner.status),
    }));
}

/** @deprecated Prefer listOfficePartnerSummaries() — kept for OF-01 section pages. */
export const OFFICE_MY_PARTNERS: readonly OfficePartnerSummary[] =
  listOfficePartnerSummaries();

/** @deprecated Prefer listOfficeWaitingActions() */
export const OFFICE_WAITING_ACTIONS: readonly OfficeActionItem[] =
  listOfficeWaitingActions();

/** @deprecated Prefer buildOfficeDashboardCards() — kept for OF-01 section pages. */
export const OFFICE_DASHBOARD_CARDS: readonly OfficeDashboardCard[] =
  buildOfficeDashboardCards();
