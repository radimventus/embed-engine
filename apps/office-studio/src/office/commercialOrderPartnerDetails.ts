/**
 * PT-CJ-03 — Editable partner billing details for Dokončit objednávku.
 * Preview / local form state only — no registry mutation.
 */

import {
  canonicalCompanyIdForOfficePartner,
} from '@embed-engine/platform-access';

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
        item.id === activeCase.companyId ||
        canonicalCompanyIdForOfficePartner(item.id) === activeCase.companyId,
    ) ?? null;

  const legalName =
    partner?.company.legalName.trim() ||
    activeCase.companyName.trim();

  const city = partner?.company.city.trim() ?? '';
  const country = partner?.company.country.trim() ?? '';

  const address = [city, country]
    .filter((value) => value.length > 0)
    .join(', ');

  return {
    companyName: legalName,
    ico: partner?.company.ico.trim() ?? '',
    dic: '',
    contactName:
      partner?.contact.name.trim() ||
      contact?.name ||
      activeCase.partnerName,
    email:
      partner?.contact.email.trim() ||
      contact?.email ||
      '',
    phone: partner?.contact.phone.trim() ?? '',
    address,
  };
}
