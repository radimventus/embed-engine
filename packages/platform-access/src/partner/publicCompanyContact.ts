import type { DurableOfficePartner } from './officePartnerRecord';

function present(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Safe public subset of an Office Partner / Company record.
 * Deliberately omits CRM contact person, role, status, next step, and notes.
 */
export type PublicCompanyContact = {
  readonly companyId: string;
  readonly displayName: string;
  readonly legalName: string | null;
  readonly ico: string | null;
  readonly city: string | null;
  readonly country: string | null;
  readonly email: string | null;
  readonly phone: string | null;
};

export function emptyPublicCompanyContact(input: {
  readonly companyId: string;
  readonly displayName: string;
}): PublicCompanyContact {
  return {
    companyId: input.companyId.trim(),
    displayName: input.displayName.trim(),
    legalName: null,
    ico: null,
    city: null,
    country: null,
    email: null,
    phone: null,
  };
}

export function projectPublicCompanyContact(input: {
  readonly companyId: string;
  readonly displayName: string;
  readonly partner: DurableOfficePartner | null;
}): PublicCompanyContact {
  const companyId = input.companyId.trim();
  const displayName = input.displayName.trim();
  if (input.partner === null) {
    return emptyPublicCompanyContact({ companyId, displayName });
  }
  return {
    companyId,
    displayName: present(input.partner.name) ?? displayName,
    legalName:
      present(input.partner.company.legalName) ??
      present(input.partner.name) ??
      present(displayName),
    ico: present(input.partner.company.ico),
    city: present(input.partner.company.city),
    country: present(input.partner.company.country),
    email: present(input.partner.contact.email),
    phone: present(input.partner.contact.phone),
  };
}
