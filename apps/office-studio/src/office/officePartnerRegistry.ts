/**
 * OF-02 — Partner Registry (in-memory MVP store).
 * Create / read / update partners; seeds align with OF-01 fixtures.
 */

import {
  defaultNextStep,
  type OfficePartner,
  type OfficePartnerDraft,
  type OfficePartnerStatus,
} from './officePartnerModel';
import { appendOfficeEvent } from './officeEventCatalog';

const SEED_PARTNERS: readonly OfficePartner[] = Object.freeze([
  {
    id: 'p-blokki',
    name: 'Blokki',
    status: 'implementation',
    nextStep: 'Dokončit Builder handoff',
    company: {
      legalName: 'Blokki s.r.o.',
      ico: '08911234',
      city: 'Praha',
      country: 'Česko',
    },
    contact: {
      name: 'Jan Blok',
      email: 'jan@blokki.cz',
      phone: '+420 777 100 200',
      role: 'Jednatel',
    },
    createdAt: '2026-08-02T09:12:00.000Z',
    updatedAt: '2026-08-03T07:05:00.000Z',
  },
  {
    id: 'p-nord',
    name: 'Nordhaus',
    status: 'offer',
    nextStep: 'Sledovat odpověď na nabídku',
    company: {
      legalName: 'Nordhaus CZ a.s.',
      ico: '04567890',
      city: 'Brno',
      country: 'Česko',
    },
    contact: {
      name: 'Eva Nord',
      email: 'eva@nordhaus.cz',
      phone: '+420 602 333 444',
      role: 'Obchodní ředitelka',
    },
    createdAt: '2026-07-28T10:00:00.000Z',
    updatedAt: '2026-08-02T11:40:00.000Z',
  },
  {
    id: 'p-linea',
    name: 'Linea Domů',
    status: 'payment',
    nextStep: 'Potvrdit přijetí platby',
    company: {
      legalName: 'Linea Domů s.r.o.',
      ico: '12345098',
      city: 'Ostrava',
      country: 'Česko',
    },
    contact: {
      name: 'Petr Linea',
      email: 'petr@lineadomu.cz',
      phone: '+420 731 555 666',
      role: 'CEO',
    },
    createdAt: '2026-07-20T08:30:00.000Z',
    updatedAt: '2026-08-02T16:22:00.000Z',
  },
]);

let partners: OfficePartner[] = SEED_PARTNERS.map((partner) => ({ ...partner }));
let idSeq = 100;

export type PartnerQuickActionId =
  | 'prepare-pilot'
  | 'deliver-pilot'
  | 'send-offer'
  | 'confirm-order'
  | 'record-payment'
  | 'open-builder';

function nowIso(): string {
  return new Date().toISOString();
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
      // CS-01 — handled by preparePilotForPartner (orchestration), not status-only.
      return partner;
    case 'deliver-pilot':
      // PE-06 — handled by deliverPilot (orchestration + preview), not status-only.
      return partner;
    case 'send-offer':
      status = 'offer';
      kind = 'offer.sent';
      label = 'Nabídka odeslána';
      detail = `${partner.name} · nabídka odeslána`;
      break;
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
  }

  const updated: OfficePartner = {
    ...partner,
    status,
    nextStep: defaultNextStep(status),
    updatedAt: nowIso(),
  };
  partners = partners.map((entry) =>
    entry.id === id ? updated : entry,
  );
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
  partners = SEED_PARTNERS.map((partner) => ({ ...partner }));
  idSeq = 100;
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
