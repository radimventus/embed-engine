/**
 * PE-07 — Pilot Delivery: one-click package + preview + timeline (no SMTP).
 */

import {
  CONIS_SAMPLE_PROJECT_LABEL,
  listInvites,
  resolveInviteLifecycle,
  resolvePartnerInviteHref,
  type PilotInvite,
} from '@embed-engine/platform-access';

import { appendOfficeEvent } from './officeEventCatalog';
import { getPartner, updatePartner, draftFromPartner } from './officePartnerRegistry';
import { preparePilotForPartner } from './preparePilotProvisioning';
import {
  PILOT_DELIVERY_STUDIOS,
  type PilotActivationStatus,
  type PilotDeliveryInviteSnapshot,
  type PilotDeliveryPdfAttachment,
  type PilotDeliveryPreview,
  type PilotDeliveryRecord,
} from './officePilotDeliveryModel';

const STORAGE_KEY = 'conis.office.pilot-delivery.v1';

type DeliveryStore = {
  readonly byPartnerId: Record<string, PilotDeliveryRecord>;
};

let memoryStore: DeliveryStore = { byPartnerId: {} };

function nowIso(): string {
  return new Date().toISOString();
}

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function loadStore(): DeliveryStore {
  if (!canUseStorage()) return memoryStore;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null || raw.length === 0) return memoryStore;
    const parsed = JSON.parse(raw) as {
      byPartnerId?: Record<string, PilotDeliveryRecord>;
    };
    memoryStore = {
      byPartnerId:
        parsed.byPartnerId !== null && typeof parsed.byPartnerId === 'object'
          ? parsed.byPartnerId
          : {},
    };
    return memoryStore;
  } catch {
    return memoryStore;
  }
}

function saveStore(store: DeliveryStore): void {
  memoryStore = store;
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

export function resetPilotDeliveryStoreForTests(): void {
  memoryStore = { byPartnerId: {} };
  if (canUseStorage()) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function findInviteForEmail(email: string): PilotInvite | null {
  const normalized = email.trim().toLowerCase();
  if (normalized.length === 0) return null;
  const invites = listInvites().filter((item) => item.email === normalized);
  if (invites.length === 0) return null;
  return (
    invites.find((item) => item.status === 'pending') ??
    invites[0] ??
    null
  );
}

function toActivationStatus(invite: PilotInvite | null): PilotActivationStatus {
  if (invite === null) return 'missing';
  const lifecycle = resolveInviteLifecycle(invite);
  if (lifecycle === 'activated') return 'activated';
  if (lifecycle === 'expired') return 'expired';
  if (lifecycle === 'revoked') return 'revoked';
  if (lifecycle === 'pending') return 'awaiting_activation';
  return 'missing';
}

function toInviteSnapshot(invite: PilotInvite): PilotDeliveryInviteSnapshot {
  return {
    token: invite.token,
    status: resolveInviteLifecycle(invite),
    expiresAt: invite.expiresAt,
    sendCount: invite.sendCount,
    activationStatus: toActivationStatus(invite),
  };
}

function buildPdfAttachment(
  partnerId: string,
  partnerName: string,
): PilotDeliveryPdfAttachment {
  return {
    id: `pdf-${partnerId}-pilot-presentation`,
    name: `Pilot Presentation · ${partnerName}.pdf`,
    href: `local://pilot-delivery/${partnerId}/pilot-presentation.pdf`,
    attached: true,
    ready: true,
  };
}

/**
 * Build Delivery Preview for the partner (requires contact e-mail).
 * Ensures pilot provisioning when invite is missing.
 */
export function buildPilotDeliveryPreview(
  partnerId: string,
): PilotDeliveryPreview | null {
  const partner = getPartner(partnerId);
  if (partner === null) return null;
  const email = partner.contact.email.trim();
  if (email.length === 0) return null;

  let invite = findInviteForEmail(email);
  if (invite === null) {
    const prepared = preparePilotForPartner(partnerId);
    if (prepared === null) return null;
    invite = prepared.invite;
  }

  const inviteSnapshot =
    invite !== null ? toInviteSnapshot(invite) : null;
  const activationStatus = toActivationStatus(invite);
  const workspaceHref =
    inviteSnapshot !== null
      ? resolvePartnerInviteHref(inviteSnapshot.token)
      : resolvePartnerInviteHref('');

  return {
    partnerId: partner.id,
    partnerName: partner.name,
    email,
    projectName: CONIS_SAMPLE_PROJECT_LABEL,
    accessibleStudios: PILOT_DELIVERY_STUDIOS,
    invite: inviteSnapshot,
    activationStatus,
    workspaceHref,
    pdf: buildPdfAttachment(partner.id, partner.name),
  };
}

export function getPilotDelivery(
  partnerId: string,
): PilotDeliveryRecord | null {
  return loadStore().byPartnerId[partnerId] ?? null;
}

export function listPilotDeliveries(): readonly PilotDeliveryRecord[] {
  return Object.values(loadStore().byPartnerId);
}

/**
 * Unified action „Odeslat pilot“ — prepare package, stamp timeline, no SMTP.
 */
export function deliverPilot(
  partnerId: string,
):
  | { readonly ok: true; readonly delivery: PilotDeliveryRecord }
  | { readonly ok: false; readonly error: string } {
  const preview = buildPilotDeliveryPreview(partnerId);
  if (preview === null) {
    return {
      ok: false,
      error: 'Pilot nelze odeslat — chybí partner nebo kontaktní e-mail.',
    };
  }
  if (preview.invite === null) {
    return {
      ok: false,
      error: 'Pilot nelze odeslat — pozvánka není připravena.',
    };
  }

  const preparedAt = nowIso();
  appendOfficeEvent({
    kind: 'pilot.prepared',
    label: 'PilotPrepared',
    detail: `${preview.partnerName} · ${preview.pdf.name} · ${preview.projectName}`,
    partnerId,
  });

  const deliveredAt = nowIso();
  const delivery: PilotDeliveryRecord = {
    id: `delivery-${partnerId}-${Date.now()}`,
    partnerId,
    preparedAt,
    deliveredAt,
    preview,
    package: {
      pdf: preview.pdf,
      workspaceHref: preview.workspaceHref,
      invite: preview.invite,
      activationStatus: preview.activationStatus,
    },
  };

  const store = loadStore();
  saveStore({
    byPartnerId: {
      ...store.byPartnerId,
      [partnerId]: delivery,
    },
  });

  appendOfficeEvent({
    kind: 'pilot.delivered',
    label: 'PilotDelivered',
    detail: `${preview.email} · ${preview.workspaceHref} · aktivace ${preview.activationStatus} · invite ${preview.invite.status}`,
    partnerId,
  });

  const partner = getPartner(partnerId);
  if (partner !== null) {
    const draft = draftFromPartner(partner);
    updatePartner(partnerId, {
      ...draft,
      nextStep: 'Pilot odeslán — čeká se na aktivaci',
    });
  }

  return { ok: true, delivery };
}
