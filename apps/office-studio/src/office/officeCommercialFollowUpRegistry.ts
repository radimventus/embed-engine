/**
 * PE-08 / PE-09 — Commercial Follow-up: activity tracking, status, timeline sync.
 * No notifications / SMTP.
 */

import {
  findUserByEmail,
  listInvites,
  type PilotInvite,
} from '@embed-engine/platform-access';

import { appendOfficeEvent, listPartnerTimeline } from './officeEventCatalog';
import { getPartner, listPartners } from './officePartnerRegistry';
import {
  COMMERCIAL_FOLLOW_UP_STATUS_LABELS,
  FOLLOW_UP_ACTIVE_WINDOW_MS,
  FOLLOW_UP_STALE_AFTER_MS,
  NEWLY_ACTIVATED_WINDOW_MS,
  type CommercialFollowUpStatusId,
  type PartnerActivityFlags,
  type PartnerCommercialFollowUp,
} from './officeCommercialFollowUpModel';

const TRACK_STORAGE_KEY = 'conis.office.commercial-followup.v1';

type MilestoneFlags = {
  readonly inviteOpened?: true;
  readonly ndaAccepted?: true;
  readonly accountActivated?: true;
  readonly firstLogin?: true;
  readonly readyForContact?: true;
};

type FollowUpTrackStore = {
  readonly byPartnerId: Record<string, MilestoneFlags>;
};

let memoryTrack: FollowUpTrackStore = { byPartnerId: {} };

const STUDIO_LABELS: Readonly<Record<string, string>> = Object.freeze({
  office: 'Office Studio',
  builder: 'Builder Studio',
  manager: 'Manager Studio',
  sales: 'Sales Studio',
  client: 'Client Studio',
});

export function formatLastVisitedStudio(
  studioId: string | null,
): string | null {
  if (studioId === null || studioId.length === 0) return null;
  return STUDIO_LABELS[studioId] ?? studioId;
}

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function loadTrack(): FollowUpTrackStore {
  if (!canUseStorage()) return memoryTrack;
  try {
    const raw = localStorage.getItem(TRACK_STORAGE_KEY);
    if (raw === null || raw.length === 0) return memoryTrack;
    const parsed = JSON.parse(raw) as {
      byPartnerId?: Record<string, MilestoneFlags>;
    };
    memoryTrack = {
      byPartnerId:
        parsed.byPartnerId !== null && typeof parsed.byPartnerId === 'object'
          ? parsed.byPartnerId
          : {},
    };
    return memoryTrack;
  } catch {
    return memoryTrack;
  }
}

function saveTrack(store: FollowUpTrackStore): void {
  memoryTrack = store;
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(TRACK_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

export function resetCommercialFollowUpStoreForTests(): void {
  memoryTrack = { byPartnerId: {} };
  if (canUseStorage()) {
    localStorage.removeItem(TRACK_STORAGE_KEY);
  }
}

function findDeliveredAt(partnerId: string): string | null {
  const event = listPartnerTimeline(partnerId, 80).find(
    (item) => item.kind === 'pilot.delivered',
  );
  return event?.occurredAt ?? null;
}

function findInviteForEmail(email: string): PilotInvite | null {
  const normalized = email.trim().toLowerCase();
  if (normalized.length === 0) return null;
  const invites = listInvites().filter((item) => item.email === normalized);
  if (invites.length === 0) return null;
  return (
    invites.find((item) => item.status === 'activated') ??
    invites.find((item) => item.status === 'pending') ??
    invites[0] ??
    null
  );
}

export function buildPartnerActivityFlags(
  email: string,
): PartnerActivityFlags {
  const invite = findInviteForEmail(email);
  const user = findUserByEmail(email);
  return {
    inviteOpened: invite?.openedAt != null,
    ndaAccepted: invite?.ndaAcceptedAt != null,
    accountActivated: invite?.status === 'activated',
    firstLogin: user?.lastLoginAt != null,
    lastActivityAt: user?.lastActivityAt ?? null,
    lastVisitedStudio: formatLastVisitedStudio(user?.lastStudioId ?? null),
    inviteOpenedAt: invite?.openedAt ?? null,
    ndaAcceptedAt: invite?.ndaAcceptedAt ?? null,
    activatedAt: invite?.activatedAt ?? null,
    firstLoginAt: user?.lastLoginAt ?? null,
  };
}

export function resolveCommercialFollowUpStatus(
  activity: PartnerActivityFlags,
  deliveredAt: string | null,
  nowMs = Date.now(),
): CommercialFollowUpStatusId {
  if (!activity.accountActivated) {
    if (activity.inviteOpened) return 'invite_opened';
    if (deliveredAt !== null || activity.inviteOpenedAt !== null) {
      return 'not_taken';
    }
    return 'not_taken';
  }

  if (activity.lastActivityAt !== null) {
    const last = Date.parse(activity.lastActivityAt);
    if (!Number.isNaN(last) && nowMs - last <= FOLLOW_UP_ACTIVE_WINDOW_MS) {
      return 'active';
    }
  }

  if (activity.activatedAt !== null) {
    const activated = Date.parse(activity.activatedAt);
    if (
      !Number.isNaN(activated) &&
      nowMs - activated >= FOLLOW_UP_STALE_AFTER_MS
    ) {
      return 'ready_for_contact';
    }
  }

  if (activity.firstLogin && activity.lastActivityAt === null) {
    return 'ready_for_contact';
  }

  if (activity.accountActivated && !activity.firstLogin) {
    return 'ready_for_contact';
  }

  return activity.lastActivityAt !== null ? 'ready_for_contact' : 'active';
}

function isNewlyActivated(
  activity: PartnerActivityFlags,
  nowMs: number,
): boolean {
  if (!activity.accountActivated || activity.activatedAt === null) {
    return false;
  }
  const activated = Date.parse(activity.activatedAt);
  if (Number.isNaN(activated)) return false;
  return nowMs - activated <= NEWLY_ACTIVATED_WINDOW_MS;
}

export function buildPartnerCommercialFollowUp(
  partnerId: string,
  nowMs = Date.now(),
): PartnerCommercialFollowUp | null {
  const partner = getPartner(partnerId);
  if (partner === null) return null;
  const email = partner.contact.email.trim();
  const activity = buildPartnerActivityFlags(email);
  const deliveredAt = findDeliveredAt(partnerId);
  const status = resolveCommercialFollowUpStatus(
    activity,
    deliveredAt,
    nowMs,
  );
  return {
    partnerId: partner.id,
    partnerName: partner.name,
    email,
    status,
    statusLabel: COMMERCIAL_FOLLOW_UP_STATUS_LABELS[status],
    activity,
    deliveredAt,
    newlyActivated: isNewlyActivated(activity, nowMs),
  };
}

export function listCommercialFollowUps(
  nowMs = Date.now(),
): readonly PartnerCommercialFollowUp[] {
  return listPartners()
    .map((partner) => buildPartnerCommercialFollowUp(partner.id, nowMs))
    .filter((item): item is PartnerCommercialFollowUp => {
      if (item === null) return false;
      return (
        item.deliveredAt !== null ||
        item.activity.inviteOpened ||
        item.activity.accountActivated
      );
    });
}

function hasTimelineKind(partnerId: string, kind: string): boolean {
  return listPartnerTimeline(partnerId, 100).some(
    (event) => event.kind === kind,
  );
}

/**
 * Sync follow-up timeline milestones for a partner (idempotent).
 */
export function syncCommercialFollowUpTimeline(
  partnerId: string,
  nowMs = Date.now(),
): PartnerCommercialFollowUp | null {
  const followUp = buildPartnerCommercialFollowUp(partnerId, nowMs);
  if (followUp === null) return null;

  const track = loadTrack();
  const flags = track.byPartnerId[partnerId] ?? {};
  let nextFlags: MilestoneFlags = { ...flags };
  const { activity, partnerName, email, status } = followUp;

  if (activity.inviteOpened && flags.inviteOpened !== true) {
    if (!hasTimelineKind(partnerId, 'followup.invite_opened')) {
      appendOfficeEvent({
        kind: 'followup.invite_opened',
        label: 'Pozvánka otevřena',
        detail: `${partnerName} · ${email}`,
        partnerId,
      });
    }
    nextFlags = { ...nextFlags, inviteOpened: true };
  }

  if (activity.ndaAccepted && flags.ndaAccepted !== true) {
    if (!hasTimelineKind(partnerId, 'followup.nda_accepted')) {
      appendOfficeEvent({
        kind: 'followup.nda_accepted',
        label: 'NDA odsouhlaseno',
        detail: `${partnerName} · NDA accepted`,
        partnerId,
      });
    }
    nextFlags = { ...nextFlags, ndaAccepted: true };
  }

  if (activity.accountActivated && flags.accountActivated !== true) {
    if (!hasTimelineKind(partnerId, 'followup.account_activated')) {
      appendOfficeEvent({
        kind: 'followup.account_activated',
        label: 'Účet aktivován',
        detail: `${partnerName} · ${email}`,
        partnerId,
      });
    }
    nextFlags = { ...nextFlags, accountActivated: true };
  }

  if (activity.firstLogin && flags.firstLogin !== true) {
    if (!hasTimelineKind(partnerId, 'followup.first_login')) {
      appendOfficeEvent({
        kind: 'followup.first_login',
        label: 'První přihlášení',
        detail: `${partnerName} · ${activity.firstLoginAt ?? ''}`,
        partnerId,
      });
    }
    nextFlags = { ...nextFlags, firstLogin: true };
  }

  if (status === 'ready_for_contact' && flags.readyForContact !== true) {
    if (!hasTimelineKind(partnerId, 'followup.ready_for_contact')) {
      appendOfficeEvent({
        kind: 'followup.ready_for_contact',
        label: 'Připraven k obchodnímu kontaktu',
        detail: `${partnerName} · obchodní follow-up`,
        partnerId,
      });
    }
    nextFlags = { ...nextFlags, readyForContact: true };
  }

  if (nextFlags !== flags) {
    saveTrack({
      byPartnerId: {
        ...track.byPartnerId,
        [partnerId]: nextFlags,
      },
    });
  }

  return followUp;
}

export function syncAllCommercialFollowUps(
  nowMs = Date.now(),
): readonly PartnerCommercialFollowUp[] {
  return listPartners()
    .map((partner) => syncCommercialFollowUpTimeline(partner.id, nowMs))
    .filter((item): item is PartnerCommercialFollowUp => {
      if (item === null) return false;
      return (
        item.deliveredAt !== null ||
        item.activity.inviteOpened ||
        item.activity.accountActivated
      );
    });
}

export function listFollowUpByStatus(
  status: CommercialFollowUpStatusId,
  nowMs = Date.now(),
): readonly PartnerCommercialFollowUp[] {
  return syncAllCommercialFollowUps(nowMs).filter(
    (item) => item.status === status,
  );
}

/** PE-09 — partners waiting for account activation after delivery. */
export function listWaitingActivation(
  nowMs = Date.now(),
): readonly PartnerCommercialFollowUp[] {
  return syncAllCommercialFollowUps(nowMs).filter(
    (item) => !item.activity.accountActivated,
  );
}

/** PE-09 — partners activated within the newly-activated window. */
export function listNewlyActivated(
  nowMs = Date.now(),
): readonly PartnerCommercialFollowUp[] {
  return syncAllCommercialFollowUps(nowMs).filter(
    (item) => item.newlyActivated,
  );
}

/** PE-09 — partners ready for commercial follow-up contact. */
export function listReadyForFollowUp(
  nowMs = Date.now(),
): readonly PartnerCommercialFollowUp[] {
  return listFollowUpByStatus('ready_for_contact', nowMs);
}
