/**
 * CAP-OP-09 — Mail transport service.
 * Fills Conversation Runtime via ingestion. Office uses only this session API
 * (never IMAP/SMTP types).
 */

import type { PilotConversationMessage } from '../office/pilotConversationModel';
import type { PilotWorkspaceCaseId } from '../office/pilotWorkspaceModel';
import type { ConversationMailStore } from './conversationMailStore';
import {
  ensureStoreMailbox,
  getConversationMailStore,
  getStoreMailbox,
} from './conversationMailStore';
import type { ImapAdapter } from './imapAdapter';
import {
  ingestImapFetch,
  ingestOutboundSystemMail,
  type MessageIngestionReport,
} from './messageIngestion';
import type { SmtpAdapter } from './smtpAdapter';

export type SystemMailDraft = {
  readonly mailboxId: string;
  readonly toEmail: string;
  readonly subject: string;
  readonly body: string;
  readonly threadId?: string;
  readonly caseId?: PilotWorkspaceCaseId | null;
  readonly origin?: 'SYSTEM' | 'OFFICE';
};

export type MailSyncReport = MessageIngestionReport & {
  readonly mailboxId: string;
  readonly syncedAt: string;
};

/**
 * Transport session boundary — Office may call these methods without knowing
 * whether the backing transport is IMAP/SMTP or a test double.
 */
export type PilotMailTransportSession = {
  readonly syncMailbox: (
    mailboxId: string,
    sinceIso?: string,
  ) => Promise<MailSyncReport>;
  readonly sendSystemMail: (
    draft: SystemMailDraft,
  ) => Promise<PilotConversationMessage>;
};

export type MailTransportPorts = {
  readonly smtp: SmtpAdapter;
  readonly imap: ImapAdapter;
  readonly store?: ConversationMailStore;
  /** Default since window for IMAP sync (ISO). */
  readonly defaultSinceIso?: string;
};

export function createMailTransportSession(
  ports: MailTransportPorts,
): PilotMailTransportSession {
  const store = ports.store ?? getConversationMailStore();

  return {
    async syncMailbox(mailboxId, sinceIso) {
      if (ports.imap.mailboxId !== mailboxId) {
        throw new Error(
          `IMAP adapter mailbox mismatch: expected ${ports.imap.mailboxId}, got ${mailboxId}`,
        );
      }
      const mailbox = getStoreMailbox(mailboxId, store);
      if (mailbox === null) {
        ensureStoreMailbox(
          {
            id: mailboxId,
            name: mailboxId,
            email: ports.imap.config.user,
            owner: 'transport',
            status: 'active',
          },
          store,
        );
      }
      const since =
        sinceIso ??
        ports.defaultSinceIso ??
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const fetched = await ports.imap.syncInboxAndSent(since);
      const report = ingestImapFetch(mailboxId, fetched, store);
      return {
        ...report,
        mailboxId,
        syncedAt: new Date().toISOString(),
      };
    },

    async sendSystemMail(draft) {
      const mailbox =
        getStoreMailbox(draft.mailboxId, store) ??
        ensureStoreMailbox(
          {
            id: draft.mailboxId,
            name: draft.mailboxId,
            email: ports.smtp.config.user,
            owner: 'transport',
            status: 'active',
          },
          store,
        );

      const sendResult = await ports.smtp.sendMail({
        from: mailbox.email,
        to: draft.toEmail,
        subject: draft.subject,
        text: draft.body,
      });

      const { result, message } = ingestOutboundSystemMail(
        {
          mailboxId: draft.mailboxId,
          fromEmail: mailbox.email,
          toEmail: draft.toEmail,
          subject: draft.subject,
          body: draft.body,
          threadId: draft.threadId,
          caseId: draft.caseId,
          origin: draft.origin ?? 'SYSTEM',
          sendResult,
        },
        store,
      );

      if (result === 'duplicate' || message === null) {
        throw new Error(
          `System mail Message-ID already present: ${sendResult.messageId}`,
        );
      }
      return message;
    },
  };
}
