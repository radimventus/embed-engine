/**
 * PT-CJ-03 — Editable partner billing details for Dokončit objednávku.
 * Preview / local form state only — no registry mutation.
 */

import { listPartners } from './officePartnerRegistry';
import type { PilotWorkspaceCase } from './pilotWorkspaceModel';

export type CommercialOrderPartnerDetails = {
  readonly companyName: string;
  readonly ico: string;
  readonly dic: string;
  readonly contactName: string;
  readonly email: string;
  readonly phone: string;
  readonly address: string;
};

export function buildCommercialOrderPartnerDetails(
  activeCase: PilotWorkspaceCase,
): CommercialOrderPartnerDetails {
  const contact = activeCase.contacts[0] ?? null;
  const partner =
    listPartners().find(
      (item) =>
        item.company.legalName === activeCase.companyName ||
        item.name === activeCase.partnerName,
    ) ?? null;

  const ico = partner?.company.ico.trim() || seedIco(activeCase.id);
  const city = partner?.company.city.trim() || 'Praha';
  const country = partner?.company.country.trim() || 'Česká republika';

  return {
    companyName: activeCase.companyName,
    ico,
    dic: ico.length > 0 ? `CZ${ico}` : '',
    contactName: contact?.name ?? activeCase.partnerName,
    email: contact?.email ?? partner?.contact.email ?? '',
    phone: partner?.contact.phone ?? contactPhoneFallback(activeCase.id),
    address: `${city}, ${country}`,
  };
}

function seedIco(caseId: string): string {
  const digits = caseId.replace(/\D/g, '');
  if (digits.length >= 8) return digits.slice(-8);
  return (digits + '06123456').slice(0, 8);
}

function contactPhoneFallback(caseId: string): string {
  const n = caseId.replace(/\D/g, '').slice(-6).padStart(6, '0');
  return `+420 ${n.slice(0, 3)} ${n.slice(3)}`;
}
