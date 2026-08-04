/**
 * OF-02 / OF-10 / OF-11 — Partner Registry (persisted Office domain store).
 * Create / read / update partners; production seed is the OF-11 reference partner.
 */

import {
  defaultNextStep,
  type OfficePartner,
  type OfficePartnerDraft,
  type OfficePartnerStatus,
} from './officePartnerModel';
import { appendOfficeEvent } from './officeEventCatalog';
import { loadJson, removeJson, saveJson } from './officeLocalStore';
import { OFFICE_STORAGE_KEYS } from './officeStorageKeys';
import { buildOfficeReferencePartner } from './officeReferencePartner';

const SEED_PARTNERS: readonly OfficePartner[] = Object.freeze([
  buildOfficeReferencePartner(),
]);

type PartnerPersistState = {
  readonly partners: readonly OfficePartner[];
  readonly idSeq: number;
};

function seedState(): PartnerPersistState {
  return {
    partners: SEED_PARTNERS.map((partner) => ({ ...partner })),
    idSeq: 100,
  };
}

function readState(): PartnerPersistState {
  const stored = loadJson<PartnerPersistState | null>(
    OFFICE_STORAGE_KEYS.partners,
    null,
  );
  if (
    stored !== null &&
    Array.isArray(stored.partners) &&
    stored.partners.length > 0
  ) {
    return {
      partners: stored.partners.map((partner) => ({ ...partner })),
      idSeq: typeof stored.idSeq === 'number' ? stored.idSeq : 100,
    };
  }
  return seedState();
}

const initial = readState();
let partners: OfficePartner[] = initial.partners.map((partner) => ({
  ...partner,
}));
let idSeq = initial.idSeq;

export type PartnerQuickActionId =
  | 'prepare-pilot'
  | 'deliver-pilot'
  | 'open-partner-environment'
  | 'send-offer'
  | 'confirm-order'
  | 'record-payment'
  | 'open-builder'
  | 'suspend-partner'
  | 'restore-partner'
  | 'archive-partner';

function nowIso(): string {
  return new Date().toISOString();
}

function persist(): void {
  saveJson(OFFICE_STORAGE_KEYS.partners, {
    partners,
    idSeq,
  } satisfies PartnerPersistState);
}

function nextId(): string {
  idSeq += 1;
  return `p-${idSeq}`;
}

export function listPartners(): readonly OfficePartner[] {
  return [...partners].sort((a, b) => a.name.localeCompare(b.name, 'cs'));
}

export function getPartner(id: string): OfficePartner | null {
  return partners.find((partner) => partner.id === id) ?? null;
}

export function createPartner(draft: OfficePartnerDraft): OfficePartner {
  const createdAt = nowIso();
  const partner: OfficePartner = {
    id: nextId(),
    name: draft.name.trim(),
    status: draft.status,
    nextStep: draft.nextStep.trim() || defaultNextStep(draft.status),
    company: {
      legalName: draft.company.legalName.trim() || draft.name.trim(),
      ico: draft.company.ico.trim(),
      city: draft.company.city.trim(),
      country: draft.company.country.trim() || 'Česko',
    },
    contact: {
      name: draft.contact.name.trim(),
      email: draft.contact.email.trim(),
      phone: draft.contact.phone.trim(),
      role: draft.contact.role.trim(),
    },
    createdAt,
    updatedAt: createdAt,
  };
  partners = [...partners, partner];
  persist();
  appendOfficeEvent({
    kind: 'partner.created',
    label: 'Partner vytvořen',
    detail: `${partner.name} · nový partner`,
    partnerId: partner.id,
  });
  return partner;
}

export function updatePartner(
  id: string,
  draft: OfficePartnerDraft,
): OfficePartner | null {
  const index = partners.findIndex((partner) => partner.id === id);
  if (index < 0) return null;
  const previous = partners[index]!;
  const updated: OfficePartner = {
    ...previous,
    name: draft.name.trim(),
    status: draft.status,
    nextStep: draft.nextStep.trim() || defaultNextStep(draft.status),
    company: {
      legalName: draft.company.legalName.trim() || draft.name.trim(),
      ico: draft.company.ico.trim(),
      city: draft.company.city.trim(),
      country: draft.company.country.trim() || 'Česko',
    },
    contact: {
      name: draft.contact.name.trim(),
      email: draft.contact.email.trim(),
      phone: draft.contact.phone.trim(),
      role: draft.contact.role.trim(),
    },
    updatedAt: nowIso(),
  };
  partners = partners.map((partner, i) => (i === index ? updated : partner));
  persist();
  appendOfficeEvent({
    kind: 'partner.updated',
    label: 'Partner upraven',
    detail: `${updated.name} · ${updated.nextStep}`,
    partnerId: updated.id,
  });
  return updated;
}

export function applyPartnerQuickAction(
  id: string,
  actionId: PartnerQuickActionId,
): OfficePartner | null {
  const partner = getPartner(id);
  if (partner === null) return null;

  let status: OfficePartnerStatus = partner.status;
  let kind:
    | 'offer.sent'
    | 'order.confirmed'
    | 'payment.received'
    | 'builder.opened' = 'offer.sent';
  let label = '';
  let detail = '';

  switch (actionId) {
    case 'prepare-pilot':
      return partner;
    case 'deliver-pilot':
      return partner;
    case 'open-partner-environment':
      return partner;
    case 'send-offer':
      return partner;
    case 'confirm-order':
      status = 'order';
      kind = 'order.confirmed';
      label = 'Objednávka potvrzena';
      detail = `${partner.name} · objednávka potvrzena`;
      break;
    case 'record-payment':
      status = 'payment';
      kind = 'payment.received';
      label = 'Platba přijata';
      detail = `${partner.name} · platba evidována`;
      break;
    case 'open-builder':
      status = 'implementation';
      kind = 'builder.opened';
      label = 'Builder otevřen';
      detail = `${partner.name} · handoff do Builderu`;
      break;
    case 'suspend-partner':
    case 'restore-partner':
    case 'archive-partner':
      return partner;
  }

  const updated: OfficePartner = {
    ...partner,
    status,
    nextStep: defaultNextStep(status),
    updatedAt: nowIso(),
  };
  partners = partners.map((entry) => (entry.id === id ? updated : entry));
  persist();
  appendOfficeEvent({
    kind,
    label,
    detail,
    partnerId: updated.id,
  });
  return updated;
}

/** Test / reset helper — restores seed registry. */
export function resetPartnerRegistryForTests(): void {
  removeJson(OFFICE_STORAGE_KEYS.partners);
  const seeded = seedState();
  partners = seeded.partners.map((partner) => ({ ...partner }));
  idSeq = seeded.idSeq;
}

export function emptyPartnerDraft(): OfficePartnerDraft {
  return {
    name: '',
    status: 'lead',
    nextStep: defaultNextStep('lead'),
    company: {
      legalName: '',
      ico: '',
      city: '',
      country: 'Česko',
    },
    contact: {
      name: '',
      email: '',
      phone: '',
      role: '',
    },
  };
}

export function draftFromPartner(partner: OfficePartner): OfficePartnerDraft {
  return {
    name: partner.name,
    status: partner.status,
    nextStep: partner.nextStep,
    company: { ...partner.company },
    contact: { ...partner.contact },
  };
}
