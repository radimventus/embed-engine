/**
 * CAP-OP-09 — Live env-backed mail transport factory (Node only).
 * Not imported by Office UI.
 */

import { createImapAdapter } from './imapAdapter';
import { createImapFlowClient } from './live/imapflowFetch';
import { createNodemailerSmtpClient } from './live/nodemailerSmtp';
import { readMailEnvConfig } from './mailEnv';
import {
  createMailTransportSession,
  type PilotMailTransportSession,
} from './mailTransportService';
import { createSmtpAdapter } from './smtpAdapter';
import type { ConversationMailStore } from './conversationMailStore';
import type { PilotMailboxId } from '../office/pilotConversationModel';

export function createEnvMailTransportSession(options: {
  readonly mailboxId: PilotMailboxId;
  readonly store?: ConversationMailStore;
  readonly env?: Record<string, string | undefined>;
}): PilotMailTransportSession {
  const env = readMailEnvConfig(options.env ?? process.env);
  if (env.smtp === null) {
    throw new Error(
      'SMTP is not configured (SMTP_HOST, SMTP_USER, SMTP_PASSWORD)',
    );
  }
  if (env.imap === null) {
    throw new Error(
      'IMAP is not configured (IMAP_HOST, IMAP_USER, IMAP_PASSWORD)',
    );
  }

  const smtp = createSmtpAdapter(env.smtp, createNodemailerSmtpClient(env.smtp));
  const imap = createImapAdapter(
    env.imap,
    options.mailboxId,
    createImapFlowClient(env.imap),
  );

  return createMailTransportSession({
    smtp,
    imap,
    store: options.store,
  });
}
