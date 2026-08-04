/**
 * CAP-OP-09 — IMAP adapter (Inbox + Sent sync).
 * Office never imports this module; envelopes are ingested into Conversation Runtime.
 */

import type { ImapEnvConfig } from './mailEnv';
import type { PilotMailboxId } from '../office/pilotConversationModel';

export type ImapFolderName = 'INBOX' | 'Sent';

export type ImapFetchedEnvelope = {
  readonly folder: ImapFolderName;
  readonly messageId: string;
  readonly threadId: string;
  readonly fromEmail: string;
  readonly toEmail: string;
  readonly subject: string;
  readonly body: string;
  readonly createdAt: string;
};

export type ImapTransportClient = {
  readonly fetchFolder: (
    folder: ImapFolderName,
    sinceIso: string,
  ) => Promise<readonly ImapFetchedEnvelope[]>;
};

export type ImapAdapter = {
  readonly kind: 'imap';
  readonly config: ImapEnvConfig;
  readonly mailboxId: PilotMailboxId;
  readonly syncInboxAndSent: (
    sinceIso: string,
  ) => Promise<readonly ImapFetchedEnvelope[]>;
};

export function createImapAdapter(
  config: ImapEnvConfig,
  mailboxId: PilotMailboxId,
  client: ImapTransportClient,
): ImapAdapter {
  return {
    kind: 'imap',
    config,
    mailboxId,
    async syncInboxAndSent(sinceIso) {
      const [inbox, sent] = await Promise.all([
        client.fetchFolder('INBOX', sinceIso),
        client.fetchFolder('Sent', sinceIso),
      ]);
      return [...inbox, ...sent];
    },
  };
}
