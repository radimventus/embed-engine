/**
 * PE-08 / PE-09 — Commercial Follow-up domain (Office MVP).
 */

export type CommercialFollowUpStatusId =
  | 'not_taken'
  | 'invite_opened'
  | 'active'
  | 'ready_for_contact';

export type PartnerActivityFlags = {
  readonly inviteOpened: boolean;
  readonly ndaAccepted: boolean;
  readonly accountActivated: boolean;
  readonly firstLogin: boolean;
  readonly lastActivityAt: string | null;
  readonly lastVisitedStudio: string | null;
  readonly inviteOpenedAt: string | null;
  readonly ndaAcceptedAt: string | null;
  readonly activatedAt: string | null;
  readonly firstLoginAt: string | null;
};

export type PartnerCommercialFollowUp = {
  readonly partnerId: string;
  readonly partnerName: string;
  readonly email: string;
  readonly status: CommercialFollowUpStatusId;
  readonly statusLabel: string;
  readonly activity: PartnerActivityFlags;
  readonly deliveredAt: string | null;
  /** Activated within this window — “nově aktivovaní”. */
  readonly newlyActivated: boolean;
};

export const COMMERCIAL_FOLLOW_UP_STATUS_LABELS: Readonly<
  Record<CommercialFollowUpStatusId, string>
> = Object.freeze({
  not_taken: 'Nepřevzal',
  invite_opened: 'Pozvánka otevřena',
  active: 'Aktivní',
  ready_for_contact: 'Připraven k obchodnímu kontaktu',
});

/** Partner is "active in CONIS" when last activity is within this window. */
export const FOLLOW_UP_ACTIVE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/** After activation, stale silence escalates to ready_for_contact. */
export const FOLLOW_UP_STALE_AFTER_MS = 3 * 24 * 60 * 60 * 1000;

/** Newly activated partners — within 48h of activation. */
export const NEWLY_ACTIVATED_WINDOW_MS = 48 * 60 * 60 * 1000;
