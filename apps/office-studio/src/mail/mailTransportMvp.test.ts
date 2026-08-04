/**
 * CAP-OP-09 — Mail Transport MVP tests.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { createImapAdapter, type ImapFetchedEnvelope } from './imapAdapter';
import { mapToConversation } from './conversationMapping';
import {
  createConversationMailStore,
  resetConversationMailStore,
  storeHasMessageId,
  storeMessagesForConversation,
} from './conversationMailStore';
import { readMailEnvConfig } from './mailEnv';
import {
  createMailTransportSession,
  type PilotMailTransportSession,
} from './mailTransportService';
import { ingestImapFetch } from './messageIngestion';
import { createSmtpAdapter } from './smtpAdapter';
import {
  createInitialConversationRuntimeState,
  reducePilotConversation,
} from '../office/pilotConversationRuntime';

const root = dirname(fileURLToPath(import.meta.url));

function read(relative: string): string {
  return readFileSync(join(root, '..', relative), 'utf8');
}

function memorySmtp(sent: { messageId: string }[]) {
  return createSmtpAdapter(
    {
      host: 'smtp.test',
      port: 587,
      secure: false,
      user: 'kontakt@conis.cz',
      password: 'secret',
    },
    {
      async sendMail(input) {
        const messageId =
          input.messageId ?? `<smtp-${sent.length + 1}@conis.cz>`;
        sent.push({ messageId });
        return { messageId, accepted: [input.to] };
      },
    },
  );
}

function memoryImap(
  mailboxId: string,
  folders: Record<'INBOX' | 'Sent', ImapFetchedEnvelope[]>,
) {
  return createImapAdapter(
    {
      host: 'imap.test',
      port: 993,
      secure: true,
      user: 'kontakt@conis.cz',
      password: 'secret',
    },
    mailboxId,
    {
      async fetchFolder(folder) {
        return folders[folder] ?? [];
      },
    },
  );
}

describe('CAP-OP-09 mail transport mvp', () => {
  it('reads SMTP and IMAP configuration from env', () => {
    const cfg = readMailEnvConfig({
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '465',
      SMTP_SECURE: 'true',
      SMTP_USER: 'kontakt@conis.cz',
      SMTP_PASSWORD: 'pw',
      IMAP_HOST: 'imap.example.com',
      IMAP_PORT: '993',
      IMAP_SECURE: 'true',
      IMAP_USER: 'kontakt@conis.cz',
      IMAP_PASSWORD: 'pw',
    });
    assert.equal(cfg.smtp?.host, 'smtp.example.com');
    assert.equal(cfg.smtp?.port, 465);
    assert.equal(cfg.smtp?.secure, true);
    assert.equal(cfg.imap?.user, 'kontakt@conis.cz');
  });

  it('sends system mail via SMTP adapter and writes outgoing Message', async () => {
    const store = resetConversationMailStore({
      conversations: [],
      messages: [],
    });
    const sent: { messageId: string }[] = [];
    const session = createMailTransportSession({
      smtp: memorySmtp(sent),
      imap: memoryImap('mbx-conis-contact', { INBOX: [], Sent: [] }),
      store,
    });

    const message = await session.sendSystemMail({
      mailboxId: 'mbx-conis-contact',
      toEmail: 'jana@domysenergii.cz',
      subject: 'Welcome',
      body: 'Vítejte v CONIS.',
      caseId: 'case-dse-starter',
      origin: 'SYSTEM',
    });

    assert.equal(sent.length, 1);
    assert.equal(message.direction, 'outgoing');
    assert.equal(message.origin, 'SYSTEM');
    assert.equal(message.fromEmail, 'kontakt@conis.cz');
    assert.ok(storeHasMessageId(message.messageId, store));
  });

  it('syncs Inbox and Sent, dedupes by Message-ID, maps Conversation', async () => {
    const store = resetConversationMailStore({
      conversations: [
        {
          id: 'conv-dse-starter',
          mailboxId: 'mbx-conis-contact',
          caseId: 'case-dse-starter',
          subject: 'Domy s energií · Starter',
          participantEmails: ['jana@domysenergii.cz', 'kontakt@conis.cz'],
          status: 'open',
          updatedAt: '2026-08-01T00:00:00.000Z',
        },
      ],
      messages: [],
    });

    const sharedId = '<shared-001@conis.cz>';
    const session: PilotMailTransportSession = createMailTransportSession({
      smtp: memorySmtp([]),
      imap: memoryImap('mbx-conis-contact', {
        INBOX: [
          {
            folder: 'INBOX',
            messageId: sharedId,
            threadId: 'thread-shared',
            fromEmail: 'jana@domysenergii.cz',
            toEmail: 'kontakt@conis.cz',
            subject: 'Re: Offer',
            body: 'Děkuji',
            createdAt: '2026-08-04T12:00:00.000Z',
          },
          {
            folder: 'INBOX',
            messageId: '<unknown-lead@example.cz>',
            threadId: 'thread-unknown',
            fromEmail: 'lead@example.cz',
            toEmail: 'kontakt@conis.cz',
            subject: 'Zájem',
            body: 'Hello',
            createdAt: '2026-08-04T13:00:00.000Z',
          },
        ],
        Sent: [
          {
            folder: 'Sent',
            messageId: sharedId,
            threadId: 'thread-shared',
            fromEmail: 'kontakt@conis.cz',
            toEmail: 'jana@domysenergii.cz',
            subject: 'Re: Offer',
            body: 'Děkuji',
            createdAt: '2026-08-04T12:00:00.000Z',
          },
          {
            folder: 'Sent',
            messageId: '<sent-only@conis.cz>',
            threadId: 'thread-sent',
            fromEmail: 'kontakt@conis.cz',
            toEmail: 'erik@nordliving.cz',
            subject: 'Follow-up',
            body: 'Ping',
            createdAt: '2026-08-04T14:00:00.000Z',
          },
        ],
      }),
      store,
    });

    const first = await session.syncMailbox('mbx-conis-contact');
    assert.equal(first.added, 3);
    assert.equal(first.duplicates, 1);

    const second = await session.syncMailbox('mbx-conis-contact');
    assert.equal(second.added, 0);
    assert.equal(second.duplicates, 4);

    const mapped = store.conversations.find((item) =>
      item.participantEmails.includes('jana@domysenergii.cz'),
    );
    assert.equal(mapped?.caseId, 'case-dse-starter');

    const unassigned = store.conversations.find((item) =>
      item.participantEmails.includes('lead@example.cz'),
    );
    assert.equal(unassigned?.caseId, null);
    assert.match(unassigned?.subject ?? '', /Zájem|Nepřiřazené/);
  });

  it('keeps a single Message when the same Message-ID appears in Inbox and Sent', () => {
    const store = createConversationMailStore({
      conversations: [],
      messages: [],
    });
    const sharedId = '<dup@conis.cz>';
    const report = ingestImapFetch(
      'mbx-conis-contact',
      [
        {
          folder: 'INBOX',
          messageId: sharedId,
          threadId: 't1',
          fromEmail: 'a@x.cz',
          toEmail: 'kontakt@conis.cz',
          subject: 'Hi',
          body: 'x',
          createdAt: '2026-08-04T10:00:00.000Z',
        },
        {
          folder: 'Sent',
          messageId: sharedId,
          threadId: 't1',
          fromEmail: 'kontakt@conis.cz',
          toEmail: 'a@x.cz',
          subject: 'Hi',
          body: 'x',
          createdAt: '2026-08-04T10:00:00.000Z',
        },
      ],
      store,
    );
    assert.equal(report.added, 1);
    assert.equal(report.duplicates, 1);
    assert.equal(store.messages.length, 1);
  });

  it('maps unknown traffic to Nepřiřazené and refreshes Conversation Runtime from store', async () => {
    const store = resetConversationMailStore({
      conversations: [],
      messages: [],
    });
    const session = createMailTransportSession({
      smtp: memorySmtp([]),
      imap: memoryImap('mbx-conis-contact', {
        INBOX: [
          {
            folder: 'INBOX',
            messageId: '<orphan@x.cz>',
            threadId: 'thread-orphan',
            fromEmail: 'orphan@x.cz',
            toEmail: 'kontakt@conis.cz',
            subject: 'Orphan',
            body: 'Hi',
            createdAt: '2026-08-04T15:00:00.000Z',
          },
        ],
        Sent: [],
      }),
      store,
    });

    await session.syncMailbox('mbx-conis-contact');
    const conversation = mapToConversation(
      {
        mailboxId: 'mbx-conis-contact',
        fromEmail: 'orphan@x.cz',
        toEmail: 'kontakt@conis.cz',
        subject: 'Orphan',
        threadId: 'thread-orphan',
        createdAt: '2026-08-04T15:00:00.000Z',
      },
      store,
    );
    assert.equal(conversation.caseId, null);

    let runtime = createInitialConversationRuntimeState(null);
    runtime = reducePilotConversation(runtime, {
      type: 'select-conversation',
      conversationId: conversation.id,
    });
    runtime = reducePilotConversation(runtime, {
      type: 'refresh-from-store',
      caseId: null,
    });
    assert.ok(
      storeMessagesForConversation(conversation.id, store).length >= 1,
    );
    assert.equal(runtime.mailboxes.some((m) => m.email === 'kontakt@conis.cz'), true);
  });

  it('keeps Office UI free of IMAP/SMTP and isolates live adapters', () => {
    const context = read('office/PilotWorkspaceContext.tsx');
    const inboxUi = read(
      'features/pilot-workspace/terminal/PilotTerminalInbox.tsx',
    );
    assert.doesNotMatch(context, /nodemailer|imapflow|IMAP_HOST|SMTP_HOST/);
    assert.doesNotMatch(inboxUi, /nodemailer|imapflow|IMAP_HOST|SMTP_HOST/);
    assert.match(context, /mailTransport\?/);
    assert.match(context, /syncMailboxTransport/);
    assert.match(context, /sendSystemMail/);
    assert.match(context, /mailSessionActive/);
    assert.match(context, /wirePilotMailTransportSession/);

    const liveSmtp = read('mail/live/nodemailerSmtp.ts');
    const liveImap = read('mail/live/imapflowFetch.ts');
    assert.match(liveSmtp, /nodemailer/);
    assert.match(liveImap, /imapflow/i);
    assert.match(liveImap, /INBOX/);
    assert.match(liveImap, /Sent/);
  });
});
