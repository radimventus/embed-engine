/**
 * PT-COM-02 — Browser mail session that relays SMTP through Office Vite/Node.
 * Never imports nodemailer. Fail closed when relay is unavailable.
 */

import type { PilotMailboxId } from '../office/pilotConversationModel';
import { createImapAdapter } from './imapAdapter';
import { getConversationMailStore } from './conversationMailStore';
import { readMailEnvConfig } from './mailEnv';
import {
  createMailTransportSession,
  type PilotMailTransportSession,
} from './mailTransportService';
import {
  allocateSystemMessageId,
  createSmtpAdapter,
  type SmtpSendMailInput,
  type SmtpSendMailResult,
} from './smtpAdapter';
import { DEFAULT_PILOT_MAILBOX_ID } from './createPilotMailSession';

export const PILOT_MAIL_RELAY_PATH = '/api/pilot-mail/send' as const;

function resolveRelayUrl(): string {
  try {
    const meta = import.meta as { env?: Record<string, string | undefined> };
    const fromEnv = meta.env?.VITE_MAIL_RELAY_URL?.trim();
    if (fromEnv !== undefined && fromEnv.length > 0) {
      return fromEnv.replace(/\/$/, '');
    }
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${PILOT_MAIL_RELAY_PATH}`;
  }
  return PILOT_MAIL_RELAY_PATH;
}

async function relaySendMail(
  input: SmtpSendMailInput,
): Promise<SmtpSendMailResult> {
  const response = await fetch(resolveRelayUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const payload = (await response.json().catch(() => null)) as {
    ok?: boolean;
    messageId?: string;
    accepted?: string[];
    error?: string;
  } | null;
  if (!response.ok || payload?.ok !== true) {
    throw new Error(
      payload?.error ??
        `SMTP relay failed (${response.status}). Configure SMTP_* on Office host.`,
    );
  }
  return {
    messageId: payload.messageId ?? allocateSystemMessageId(),
    accepted: payload.accepted ?? [input.to],
  };
}

/**
 * Production offer-delivery session — real SMTP via Node relay.
 */
export function createOfferDeliveryMailSession(options?: {
  readonly mailboxId?: PilotMailboxId;
}): PilotMailTransportSession {
  const mailboxId = options?.mailboxId ?? DEFAULT_PILOT_MAILBOX_ID;
  const store = getConversationMailStore();
  const env = readMailEnvConfig({});
  const smtpUser = env.smtp?.user ?? 'kontakt@conis.cz';

  const smtp = createSmtpAdapter(
    env.smtp ?? {
      host: 'relay.local',
      port: 587,
      secure: false,
      user: smtpUser,
      password: 'relay',
    },
    { sendMail: relaySendMail },
  );

  const imap = createImapAdapter(
    {
      host: 'relay.local',
      port: 993,
      secure: true,
      user: smtpUser,
      password: 'relay',
    },
    mailboxId,
    { fetchFolder: async () => [] },
  );

  return createMailTransportSession({ smtp, imap, store });
}
