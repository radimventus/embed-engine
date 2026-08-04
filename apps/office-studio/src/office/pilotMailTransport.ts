/**
 * CAP-OP-09 — Transport adapter contracts for Conversation Runtime.
 * Live IMAP/SMTP live under src/mail/ — Office UI never imports them.
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

export type PilotOutboundMailTransport = {
  readonly kind: Extract<PilotMailTransportKind, 'system' | 'office' | 'smtp'>;
  readonly send?: (
    draft: PilotOutboundMailDraft,
  ) => Promise<PilotConversationMessage> | PilotConversationMessage;
};

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

/** No-op registry — Office default has no direct transport coupling. */
export const emptyPilotMailTransportRegistry: PilotMailTransportRegistry =
  Object.freeze({
    outbound: Object.freeze([]),
    inbound: Object.freeze([]),
  });
