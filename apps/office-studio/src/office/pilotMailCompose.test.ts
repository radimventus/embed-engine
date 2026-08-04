/**
 * PT-14 — Mail Compose domain + session wiring tests.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { createImapAdapter } from '../mail/imapAdapter';
import {
  createConversationMailStore,
  storeMessagesForConversation,
} from '../mail/conversationMailStore';
import { createMailTransportSession } from '../mail/mailTransportService';
import { createSmtpAdapter } from '../mail/smtpAdapter';
import { projectTimelineFromConversation } from './pilotConversationTimeline';
import { getPilotWorkspaceCase } from './pilotWorkspaceModel';
import {
  buildForwardDraft,
  buildNewComposeDraft,
  buildReplyAllDraft,
  buildReplyDraft,
  canSendComposeDraft,
  toSystemMailDraft,
} from './pilotMailCompose';
import type {
  PilotConversation,
  PilotConversationMessage,
  PilotMailbox,
} from './pilotConversationModel';

const root = dirname(fileURLToPath(import.meta.url));

function read(relative: string): string {
  return readFileSync(join(root, '..', relative), 'utf8');
}

const mailbox: PilotMailbox = {
  id: 'mbx-conis-contact',
  name: 'CONIS Kontakt',
  email: 'kontakt@conis.cz',
  owner: 'office-ops',
  status: 'active',
};

const conversation: PilotConversation = {
  id: 'conv-test',
  mailboxId: mailbox.id,
  caseId: 'case-dse-starter',
  subject: 'Starter pilot',
  participantEmails: ['jana@domysenergii.cz', 'kontakt@conis.cz', 'ops@partner.cz'],
  status: 'open',
  updatedAt: '2026-08-04T10:00:00.000Z',
};

const source: PilotConversationMessage = {
  id: 'msg-in-1',
  direction: 'incoming',
  subject: 'Dotaz k balíčku',
  body: 'Potřebujeme potvrdit termín.',
  messageId: '<in-1@partner.cz>',
  threadId: '<thread-1@partner.cz>',
  mailboxId: mailbox.id,
  conversationId: conversation.id,
  origin: 'IMAP',
  fromEmail: 'jana@domysenergii.cz',
  toEmail: 'kontakt@conis.cz',
  createdAt: '2026-08-04T09:00:00.000Z',
};

describe('PT-14 mail composer', () => {
  it('builds compose drafts bound to active project contacts', () => {
    const activeCase = getPilotWorkspaceCase('case-dse-starter')!;
    const draft = buildNewComposeDraft({
      activeCase,
      mailbox,
      conversation,
    });
    assert.equal(draft.mode, 'compose');
    assert.equal(draft.caseId, 'case-dse-starter');
    assert.equal(draft.origin, 'OFFICE');
    assert.equal(draft.toEmail, activeCase.contacts[0]?.email);
    assert.equal(draft.partnerName, activeCase.partnerName);
    assert.equal(canSendComposeDraft({ ...draft, subject: 'A', body: 'B' }), true);
  });

  it('builds reply / reply-all / forward with Message-ID threading', () => {
    const activeCase = getPilotWorkspaceCase('case-dse-starter')!;
    const reply = buildReplyDraft({
      activeCase,
      mailbox,
      source,
      conversation,
    });
    assert.equal(reply.mode, 'reply');
    assert.equal(reply.toEmail, 'jana@domysenergii.cz');
    assert.match(reply.subject, /^Re:/);
    assert.equal(reply.threadId, source.threadId);
    assert.equal(reply.inReplyTo, source.messageId);
    assert.match(reply.references ?? '', /thread-1/);

    const replyAll = buildReplyAllDraft({
      activeCase,
      mailbox,
      source,
      conversation,
    });
    assert.equal(replyAll.mode, 'reply-all');
    assert.ok(replyAll.ccEmail.includes('ops@partner.cz'));

    const forward = buildForwardDraft({
      activeCase,
      mailbox,
      source,
      conversation,
    });
    assert.equal(forward.mode, 'forward');
    assert.match(forward.subject, /^Fwd:/);
    assert.match(forward.body, /Původní zpráva/);
    assert.equal(forward.threadId, source.threadId);
  });

  it('sends OFFICE compose through shared Mail Session into Conversation + Timeline', async () => {
    const store = createConversationMailStore({
      mailboxes: [mailbox],
      conversations: [conversation],
      messages: [source],
    });
    const smtpCalls: Array<{ inReplyTo?: string; references?: string }> = [];
    const session = createMailTransportSession({
      store,
      smtp: createSmtpAdapter(
        {
          host: 'smtp.test',
          port: 587,
          secure: false,
          user: mailbox.email,
          password: 'x',
        },
        {
          async sendMail(input) {
            smtpCalls.push({
              inReplyTo: input.inReplyTo,
              references: input.references,
            });
            return {
              messageId: `<out-${smtpCalls.length}@conis.cz>`,
              accepted: [input.to],
            };
          },
        },
      ),
      imap: createImapAdapter(
        {
          host: 'imap.test',
          port: 993,
          secure: true,
          user: mailbox.email,
          password: 'x',
        },
        mailbox.id,
        { async fetchFolder() { return []; } },
      ),
    });

    const activeCase = getPilotWorkspaceCase('case-dse-starter')!;
    const draft = buildReplyDraft({
      activeCase,
      mailbox,
      source,
      conversation,
    });
    const message = await session.sendSystemMail(
      toSystemMailDraft({
        ...draft,
        body: 'Děkujeme, potvrzujeme termín.',
      }),
    );

    assert.equal(message.origin, 'OFFICE');
    assert.equal(message.direction, 'outgoing');
    assert.equal(message.threadId, source.threadId);
    assert.equal(message.conversationId, conversation.id);
    assert.equal(smtpCalls[0]?.inReplyTo, source.messageId);

    const stored = storeMessagesForConversation(conversation.id, store);
    assert.ok(stored.some((item) => item.id === message.id));

    const timeline = projectTimelineFromConversation('case-dse-starter', store);
    assert.ok(
      timeline.some(
        (event) =>
          event.kind === 'email.sent' && event.id === `tl-msg-${message.id}`,
      ),
    );
  });

  it('wires composer into Inbox without SMTP in UI', () => {
    const inbox = read('features/pilot-workspace/terminal/PilotTerminalInbox.tsx');
    const composer = read(
      'features/pilot-workspace/terminal/PilotMailComposer.tsx',
    );
    const transport = read('mail/mailTransportService.ts');
    const composeModel = read('office/pilotMailCompose.ts');

    assert.match(inbox, /PilotMailComposer/);
    assert.match(composer, /sendSystemMail/);
    assert.match(composer, /data-compose-bound="active-project"/);
    assert.match(composer, /toSystemMailDraft/);
    assert.doesNotMatch(composer, /nodemailer|imapflow|createEnvMailTransport/);
    assert.doesNotMatch(inbox, /nodemailer|imapflow/);
    assert.match(transport, /inReplyTo/);
    assert.match(transport, /references/);
    assert.match(composeModel, /origin: 'OFFICE'/);
  });
});
