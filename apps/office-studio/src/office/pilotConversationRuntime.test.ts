/**
 * CAP-OP-08 / PT-11 — Conversation Runtime foundation tests.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { resetConversationMailStore } from '../mail/conversationMailStore';
import {
  conversationsForCase,
  messagesForConversation,
  PILOT_DEMO_CONVERSATION_MESSAGES,
  PILOT_DEMO_CONVERSATIONS,
  PILOT_DEMO_MAILBOXES,
  PILOT_MESSAGE_ORIGIN_LABELS,
} from './pilotConversationModel';
import {
  createInitialConversationRuntimeState,
  reducePilotConversation,
  withMailTransportRegistry,
} from './pilotConversationRuntime';
import { emptyPilotMailTransportRegistry } from './pilotMailTransport';

const root = dirname(fileURLToPath(import.meta.url));

function read(relative: string): string {
  return readFileSync(join(root, '..', relative), 'utf8');
}

describe('CAP-OP-08 conversation runtime foundation', () => {
  it('defines Mailbox, Conversation and Message models', () => {
    resetConversationMailStore();
    assert.ok(PILOT_DEMO_MAILBOXES.length >= 1);
    const mailbox = PILOT_DEMO_MAILBOXES[0];
    assert.ok(mailbox.id);
    assert.ok(mailbox.name);
    assert.ok(mailbox.email);
    assert.ok(mailbox.owner);
    assert.ok(mailbox.status);

    const conversation = PILOT_DEMO_CONVERSATIONS[0];
    assert.ok(conversation.id);
    assert.ok(conversation.mailboxId);
    assert.ok(conversation.subject);

    const message = PILOT_DEMO_CONVERSATION_MESSAGES[0];
    assert.ok(['incoming', 'outgoing'].includes(message.direction));
    assert.ok(['SYSTEM', 'OFFICE', 'IMAP'].includes(message.origin));
    assert.ok(message.messageId);
    assert.ok(message.threadId);
    assert.ok(message.mailboxId);
    assert.ok(message.conversationId);
    assert.equal(PILOT_MESSAGE_ORIGIN_LABELS.SYSTEM, 'SYSTEM');
  });

  it('loads Conversation and Message list for a commercial case', () => {
    resetConversationMailStore();
    const forCase = conversationsForCase('case-dse-starter');
    assert.equal(forCase.length, 1);
    assert.equal(forCase[0].id, 'conv-dse-starter');

    const messages = messagesForConversation('conv-dse-starter');
    assert.ok(messages.length >= 3);
    assert.ok(messages.some((item) => item.direction === 'incoming'));
    assert.ok(messages.some((item) => item.direction === 'outgoing'));
    assert.ok(messages.some((item) => item.origin === 'SYSTEM'));
    assert.ok(messages.some((item) => item.origin === 'OFFICE'));
    assert.ok(messages.some((item) => item.origin === 'IMAP'));
  });

  it('tracks active Conversation in runtime without persistence', () => {
    resetConversationMailStore();
    let state = createInitialConversationRuntimeState('case-dse-starter');
    assert.equal(state.activeConversationId, 'conv-dse-starter');
    assert.equal(state.activeConversation?.caseId, 'case-dse-starter');
    assert.ok(state.messages.length >= 1);
    assert.equal(state.activeMailbox?.email, 'sales@conis.cz');

    state = reducePilotConversation(state, {
      type: 'load-for-case',
      caseId: 'case-nord-pilot',
    });
    assert.equal(state.activeConversationId, 'conv-nord-pilot');
    assert.equal(state.messages[0]?.conversationId, 'conv-nord-pilot');

    state = reducePilotConversation(state, {
      type: 'select-conversation',
      conversationId: null,
    });
    assert.equal(state.activeConversationId, null);
    assert.equal(state.messages.length, 0);

    const source = read('office/pilotConversationRuntime.ts');
    assert.doesNotMatch(source, /localStorage/);
    assert.doesNotMatch(source, /officeLocalStore/);
  });

  it('keeps communication model separate from IMAP/SMTP transport', () => {
    const registry = withMailTransportRegistry(emptyPilotMailTransportRegistry);
    assert.equal(registry.outbound?.length, 0);
    assert.equal(registry.inbound?.length, 0);

    const model = read('office/pilotConversationModel.ts');
    const runtime = read('office/pilotConversationRuntime.ts');
    const transport = read('office/pilotMailTransport.ts');
    assert.doesNotMatch(model, /from ['"]imap/i);
    assert.doesNotMatch(model, /nodemailer|imapflow|node-imap/);
    assert.doesNotMatch(runtime, /nodemailer|imapflow|node-imap/);
    assert.doesNotMatch(runtime, /\bfetch\(/);
    assert.match(model, /PilotMessageOrigin = 'SYSTEM' \| 'OFFICE' \| 'IMAP'/);
    assert.match(transport, /PilotOutboundMailTransport/);
    assert.match(transport, /PilotInboundMailTransport/);
    assert.match(transport, /emptyPilotMailTransportRegistry/);
  });

  it('integrates Conversation Runtime into PilotWorkspaceProvider', () => {
    const context = read('office/PilotWorkspaceContext.tsx');
    assert.match(context, /createInitialConversationRuntimeState/);
    assert.match(context, /reducePilotConversation/);
    assert.match(context, /selectConversation/);
    assert.match(context, /readonly conversation:/);

    const inboxUi = read(
      'features/pilot-workspace/terminal/PilotTerminalInbox.tsx',
    );
    assert.match(inboxUi, /data-conversation-runtime/);
    assert.match(inboxUi, /conversation\.activeConversation/);
    assert.match(inboxUi, /conversation\.messages/);
    assert.doesNotMatch(inboxUi, /\bIMAP\b.*fetch/i);
  });
});
