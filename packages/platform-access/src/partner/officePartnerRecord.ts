import { canonicalCompanyIdForOfficePartner } from './canonicalOfficePartner';
import {
  parsePartnerEnvironmentScope,
  type PartnerEnvironmentScope,
} from './partnerEnvironmentScope';

export const OFFICE_PARTNER_STATUSES = [
  'lead',
  'offer',
  'order',
  'payment',
  'implementation',
  'active',
] as const;

export type DurableOfficePartnerStatus = (typeof OFFICE_PARTNER_STATUSES)[number];

export type DurableOfficeCompanyCard = {
  readonly legalName: string;
  readonly ico: string;
  readonly streetAddress: string;
  readonly city: string;
  readonly country: string;
};

export type DurableOfficeContactCard = {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly role: string;
};

/** Authoring record — Office Partner form SSOT, persisted by Platform API. */
export type DurableOfficePartner = {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
  readonly status: DurableOfficePartnerStatus;
  readonly nextStep: string;
  readonly company: DurableOfficeCompanyCard;
  readonly contact: DurableOfficeContactCard;
  readonly partnerEnvironmentScope: PartnerEnvironmentScope | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type DurableOfficePartnerDraft = {
  readonly name: unknown;
  readonly status: unknown;
  readonly nextStep: unknown;
  readonly company: unknown;
  readonly contact: unknown;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class InvalidOfficePartnerError extends Error {
  constructor(message = 'Invalid Office Partner.') {
    super(message);
    this.name = 'InvalidOfficePartnerError';
  }
}

function trimText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function optionalEmail(value: unknown): string {
  const email = trimText(value);
  if (email.length === 0) return '';
  if (!EMAIL_PATTERN.test(email)) {
    throw new InvalidOfficePartnerError('Invalid Office Partner email.');
  }
  return email;
}

function asStatus(value: unknown): DurableOfficePartnerStatus {
  if (
    typeof value === 'string' &&
    (OFFICE_PARTNER_STATUSES as readonly string[]).includes(value)
  ) {
    return value as DurableOfficePartnerStatus;
  }
  throw new InvalidOfficePartnerError('Invalid Office Partner status.');
}

function asCompany(value: unknown): DurableOfficeCompanyCard {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new InvalidOfficePartnerError('Invalid Office Partner company.');
  }
  const company = value as Record<string, unknown>;
  return {
    legalName: trimText(company.legalName),
    ico: trimText(company.ico),
    streetAddress: trimText(company.streetAddress),
    city: trimText(company.city),
    country: trimText(company.country),
  };
}

function asContact(value: unknown): DurableOfficeContactCard {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new InvalidOfficePartnerError('Invalid Office Partner contact.');
  }
  const contact = value as Record<string, unknown>;
  return {
    name: trimText(contact.name),
    email: optionalEmail(contact.email),
    phone: trimText(contact.phone),
    role: trimText(contact.role),
  };
}

function asIso(value: unknown, fallback: string): string {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) {
    return fallback;
  }
  return new Date(value).toISOString();
}

export function normalizeDurableOfficePartner(input: {
  readonly id: string;
  readonly draft: DurableOfficePartnerDraft;
  readonly previous?: DurableOfficePartner | null;
  readonly now?: string;
}): DurableOfficePartner {
  const id = input.id.trim();
  if (id.length === 0) {
    throw new InvalidOfficePartnerError('Invalid Office Partner identity.');
  }
  const name = trimText(input.draft.name);
  if (name.length === 0) {
    throw new InvalidOfficePartnerError('Invalid Office Partner name.');
  }
  const now = input.now ?? new Date().toISOString();
  const createdAt = input.previous?.createdAt ?? asIso(undefined, now);
  return {
    id,
    companyId: canonicalCompanyIdForOfficePartner(id),
    name,
    status: asStatus(input.draft.status),
    nextStep: trimText(input.draft.nextStep),
    company: asCompany(input.draft.company),
    contact: asContact(input.draft.contact),
    partnerEnvironmentScope: input.previous?.partnerEnvironmentScope ?? null,
    createdAt,
    updatedAt: now,
  };
}

export function parseStoredOfficePartner(
  value: unknown,
): DurableOfficePartner | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  const stored = value as Record<string, unknown>;
  if (typeof stored.id !== 'string' || stored.id.trim().length === 0) {
    return null;
  }
  try {
    const partner = normalizeDurableOfficePartner({
      id: stored.id,
      draft: {
        name: stored.name,
        status: stored.status,
        nextStep: stored.nextStep,
        company: stored.company,
        contact: stored.contact,
      },
      now: asIso(stored.updatedAt, new Date().toISOString()),
    });
    return {
      ...partner,
      createdAt: asIso(stored.createdAt, partner.createdAt),
      partnerEnvironmentScope: parsePartnerEnvironmentScope(
        stored.partnerEnvironmentScope,
      ),
    };
  } catch {
    return null;
  }
}

export function withPartnerEnvironmentScope(
  partner: DurableOfficePartner,
  scope: PartnerEnvironmentScope,
  now = new Date().toISOString(),
): DurableOfficePartner {
  return {
    ...partner,
    partnerEnvironmentScope: scope,
    updatedAt: now,
  };
}
