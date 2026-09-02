/**
 * OF-02 — Office Partner data model (MVP SSOT inside Office Studio).
 * Partner is the primary Office entity — company + contact + lifecycle status.
 */

export type OfficePartnerStatus =
  | 'lead'
  | 'offer'
  | 'order'
  | 'payment'
  | 'implementation'
  | 'active';

export type OfficeCompanyCard = {
  readonly legalName: string;
  readonly ico: string;
  readonly streetAddress: string;
  readonly city: string;
  readonly country: string;
};

export type OfficeContactCard = {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly role: string;
};

export type OfficePartner = {
  readonly id: string;
  readonly name: string;
  readonly status: OfficePartnerStatus;
  readonly nextStep: string;
  readonly company: OfficeCompanyCard;
  readonly contact: OfficeContactCard;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type OfficePartnerDraft = {
  readonly name: string;
  readonly status: OfficePartnerStatus;
  readonly nextStep: string;
  readonly company: OfficeCompanyCard;
  readonly contact: OfficeContactCard;
};

export const OFFICE_PARTNER_STATUS_LABELS: Record<OfficePartnerStatus, string> =
  {
    lead: 'Lead',
    offer: 'Nabídka',
    order: 'Objednávka',
    payment: 'Platba',
    implementation: 'Implementace',
    active: 'Aktivní',
  };

export const OFFICE_PARTNER_STATUS_ORDER: readonly OfficePartnerStatus[] =
  Object.freeze([
    'lead',
    'offer',
    'order',
    'payment',
    'implementation',
    'active',
  ]);

export function officePartnerStatusLabel(
  status: OfficePartnerStatus,
): string {
  return OFFICE_PARTNER_STATUS_LABELS[status];
}

export function officePartnerStatusTone(
  status: OfficePartnerStatus,
): 'info' | 'warning' | 'gold' | 'pass' | 'draft' {
  switch (status) {
    case 'lead':
      return 'draft';
    case 'offer':
      return 'info';
    case 'order':
      return 'warning';
    case 'payment':
      return 'gold';
    case 'implementation':
      return 'gold';
    case 'active':
      return 'pass';
  }
}

export function defaultNextStep(status: OfficePartnerStatus): string {
  switch (status) {
    case 'lead':
      return 'Připravit nabídku';
    case 'offer':
      return 'Sledovat odpověď na nabídku';
    case 'order':
      return 'Čekat na platbu';
    case 'payment':
      return 'Potvrdit přijetí platby';
    case 'implementation':
      return 'Dokončit Builder handoff';
    case 'active':
      return 'Provozní péče o partnera';
  }
}
