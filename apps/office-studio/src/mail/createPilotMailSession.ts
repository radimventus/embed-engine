/**
 * CAP-OP-10 — Operational mail session (Session API only).
 * Browser-safe: does not import nodemailer/imapflow.
 * Live env transport remains createEnvMailTransportSession (Node / src/mail/live).
 */

import type { PilotMailboxId } from '../office/pilotConversationModel';
import { createImapAdapter, type ImapFetchedEnvelope } from './imapAdapter';
import type { ConversationMailStore } from './conversationMailStore';
import { getConversationMailStore } from './conversationMailStore';
import { readMailEnvConfig } from './mailEnv';
import {
  createMailTransportSession,
  type PilotMailTransportSession,
} from './mailTransportService';
import { createSmtpAdapter } from './smtpAdapter';
import { allocateSystemMessageId } from './smtpAdapter';

export const DEFAULT_PILOT_MAILBOX_ID: PilotMailboxId = 'mbx-conis-contact';

export type PilotMailSessionOptions = {
  readonly mailboxId?: PilotMailboxId;
  readonly store?: ConversationMailStore;
  readonly env?: Record<string, string | undefined>;
  /**
   * Optional Inbox/Sent envelopes for operational IMAP sync (tests / demos).
   * Production live sync uses createEnvMailTransportSession.
   */
  readonly operationalFetch?: (
    folder: 'INBOX' | 'Sent',
    sinceIso: string,
  ) => Promise<readonly ImapFetchedEnvelope[]>;
};

/**
 * Active Office mail session for kontakt@ / mbx-conis-contact.
 * Same Session API as createEnvMailTransportSession — Office never sees IMAP/SMTP.
 */
export function createPilotMailSession(
  options: PilotMailSessionOptions = {},
): PilotMailTransportSession {
  const mailboxId = options.mailboxId ?? DEFAULT_PILOT_MAILBOX_ID;
  const store = options.store ?? getConversationMailStore();
  const env = readMailEnvConfig(options.env ?? {});
  const smtpUser = env.smtp?.user ?? 'kontakt@conis.cz';
  const imapUser = env.imap?.user ?? smtpUser;

  const smtp = createSmtpAdapter(
    env.smtp ?? {
      host: 'operational.local',
      port: 587,
      secure: false,
      user: smtpUser,
      password: 'operational',
    },
    {
      async sendMail(input) {
        const messageId = input.messageId ?? allocateSystemMessageId();
        return { messageId, accepted: [input.to] };
      },
    },
  );

  const fetch =
    options.operationalFetch ??
    (async () => [] as readonly ImapFetchedEnvelope[]);

  const imap = createImapAdapter(
    env.imap ?? {
      host: 'operational.local',
      port: 993,
      secure: true,
      user: imapUser,
      password: 'operational',
    },
    mailboxId,
    {
      fetchFolder: (folder, sinceIso) => fetch(folder, sinceIso),
    },
  );

  return createMailTransportSession({ smtp, imap, store });
}

/**
 * Wires the default Pilot Workspace mailbox session.
 * Prefer injecting createEnvMailTransportSession from Node when SMTP+IMAP env is live.
 */
export function wirePilotMailTransportSession(
  options: PilotMailSessionOptions = {},
): PilotMailTransportSession {
  return createPilotMailSession({
    mailboxId: DEFAULT_PILOT_MAILBOX_ID,
    ...options,
  });
}
