/**
 * CAP-OP-09 — Live ImapFlow client (Node only).
 * Syncs INBOX + Sent. Not imported by Office UI / PilotWorkspaceProvider.
 */

import { ImapFlow } from 'imapflow';

import type { ImapEnvConfig } from '../mailEnv';
import type {
  ImapFetchedEnvelope,
  ImapFolderName,
  ImapTransportClient,
} from '../imapAdapter';

function firstAddress(
  value:
    | { address?: string | null; name?: string | null }
    | Array<{ address?: string | null }>
    | undefined
    | null,
): string {
  if (!value) return '';
  if (Array.isArray(value)) {
    return value[0]?.address?.trim() ?? '';
  }
  return value.address?.trim() ?? '';
}

function asText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Buffer.isBuffer(value)) return value.toString('utf8');
  return '';
}

export function createImapFlowClient(config: ImapEnvConfig): ImapTransportClient {
  return {
    async fetchFolder(folder: ImapFolderName, sinceIso: string) {
      const client = new ImapFlow({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.password,
        },
        logger: false,
      });

      const results: ImapFetchedEnvelope[] = [];
      await client.connect();
      try {
        const lock = await client.getMailboxLock(folder);
        try {
          const sinceDate = new Date(sinceIso);
          const uids = await client.search({ since: sinceDate }, { uid: true });
          if (!uids || uids.length === 0) {
            return results;
          }
          for await (const message of client.fetch(
            uids,
            {
              uid: true,
              envelope: true,
              source: true,
              bodyStructure: true,
            },
            { uid: true },
          )) {
            const envelope = message.envelope;
            const messageId =
              envelope?.messageId?.trim() ||
              `<imap-${folder.toLowerCase()}-${message.uid}@conis.local>`;
            const subject = envelope?.subject?.trim() || '(without subject)';
            const fromEmail = firstAddress(envelope?.from?.[0]);
            const toEmail = firstAddress(envelope?.to?.[0]);
            const createdAt = (
              envelope?.date ?? new Date()
            ).toISOString();
            const envelopeRecord = envelope as
              | (NonNullable<typeof envelope> & {
                  references?: string | string[];
                  inReplyTo?: string;
                })
              | undefined;
            const references = envelopeRecord?.references;
            const inReplyTo = envelopeRecord?.inReplyTo;
            const threadId = Array.isArray(references)
              ? String(references[0] ?? messageId)
              : typeof references === 'string' && references.length > 0
                ? references.split(/\s+/)[0]!
                : typeof inReplyTo === 'string' && inReplyTo.length > 0
                  ? inReplyTo
                  : messageId;
            results.push({
              folder,
              messageId,
              threadId,
              fromEmail,
              toEmail,
              subject,
              body: asText(message.source).slice(0, 20_000),
              createdAt,
            });
          }
        } finally {
          lock.release();
        }
      } finally {
        await client.logout().catch(() => undefined);
      }
      return results;
    },
  };
}
