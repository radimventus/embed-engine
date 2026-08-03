/**
 * OF-02 — Partner Registry search + status filter helpers.
 */

import type { OfficePartner, OfficePartnerStatus } from './officePartnerModel';
import { officePartnerStatusLabel } from './officePartnerModel';

export type PartnerStatusFilter = 'all' | OfficePartnerStatus;

export function matchesPartnerQuery(
  partner: OfficePartner,
  query: string,
): boolean {
  if (query.length === 0) return true;
  const haystack = [
    partner.name,
    partner.nextStep,
    officePartnerStatusLabel(partner.status),
    partner.company.legalName,
    partner.company.city,
    partner.company.ico,
    partner.contact.name,
    partner.contact.email,
    partner.contact.phone,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

export function filterPartners(
  partners: readonly OfficePartner[],
  query: string,
  statusFilter: PartnerStatusFilter,
): readonly OfficePartner[] {
  const normalized = query.trim().toLowerCase();
  return partners.filter((partner) => {
    if (statusFilter !== 'all' && partner.status !== statusFilter) {
      return false;
    }
    return matchesPartnerQuery(partner, normalized);
  });
}
