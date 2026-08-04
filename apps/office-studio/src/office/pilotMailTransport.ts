/**
 * CAP-OP-08 / PT-11 — Transport adapter interfaces (no IMAP/SMTP implementation).
 * Conversation Runtime stays independent of transport.
 */

import type {
  PilotConversationMessage,
  PilotMailboxId,
} from './pilotConversationModel';

export type PilotMailTransportKind = 'system' | 'office' | 'imap' | 'smtp';

export type PilotOutboundMailDraft = {
  readonly mailboxId: PilotMailboxId;
  readonly toEmail: string;
  readonly subject: string;
  readonly body: string;
  readonly threadId: string | null;
  readonly origin: 'SYSTEM' | 'OFFICE';
};

export type PilotInboundMailEnvelope = {
  readonly mailboxId: PilotMailboxId;
  readonly messageId: string;
  readonly threadId: string;
  readonly fromEmail: string;
  readonly toEmail: string;
  readonly subject: string;
  readonly body: string;
  readonly createdAt: string;
};

/**
 * Outbound transport — SYSTEM (Offer/Proforma/Welcome) or OFFICE compose.
 * Implementations land in PT-12+; foundation only declares the contract.
 */
export type PilotOutboundMailTransport = {
  readonly kind: Extract<PilotMailTransportKind, 'system' | 'office' | 'smtp'>;
  readonly send?: (
    draft: PilotOutboundMailDraft,
  ) => Promise<PilotConversationMessage> | PilotConversationMessage;
};

/**
 * Inbound transport — future IMAP / Apple Mail / Outlook sync.
 */
export type PilotInboundMailTransport = {
  readonly kind: Extract<PilotMailTransportKind, 'imap'>;
  readonly fetchSince?: (
    mailboxId: PilotMailboxId,
    sinceIso: string,
  ) => Promise<readonly PilotInboundMailEnvelope[]>;
};

export type PilotMailTransportRegistry = {
  readonly outbound?: readonly PilotOutboundMailTransport[];
  readonly inbound?: readonly PilotInboundMailTransport[];
};

/** No-op registry — proves Office does not depend on IMAP/SMTP. */
export const emptyPilotMailTransportRegistry: PilotMailTransportRegistry =
  Object.freeze({
    outbound: Object.freeze([]),
    inbound: Object.freeze([]),
  });
