/**
 * OF-01 / OF-02 — Office dashboard MVP (overview derived from Partner Registry).
 */

import type { OfficePartner } from './officePartnerModel';
import { officePartnerStatusLabel } from './officePartnerModel';
import { listPartners } from './officePartnerRegistry';

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
  return [
    {
      id: 'new-partners',
      title: 'Noví partneři',
      value: partners.length,
      hint: 'V Partner Registry',
    },
    {
      id: 'pending-offers',
      title: 'Čekající nabídky',
      value: partners.filter((partner) => partner.status === 'offer').length,
      hint: 'Čeká na odpověď partnera',
    },
    {
      id: 'pending-payments',
      title: 'Čekající platby',
      value: partners.filter((partner) => partner.status === 'payment').length,
      hint: 'Pilotní poplatky',
    },
    {
      id: 'active-implementations',
      title: 'Probíhající implementace',
      value: partners.filter(
        (partner) => partner.status === 'implementation',
      ).length,
      hint: 'Builder handoff v běhu',
    },
  ];
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

/** @deprecated Prefer buildOfficeDashboardCards() */
export const OFFICE_DASHBOARD_CARDS: readonly OfficeDashboardCard[] =
  buildOfficeDashboardCards();
