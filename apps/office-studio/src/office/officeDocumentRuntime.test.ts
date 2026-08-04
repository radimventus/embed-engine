/**
 * PT-15 — Document Runtime Office integration tests.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { beforeEach, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { buildBusinessEvent } from '@embed-engine/business-automation';

import {
  getConversationMailStore,
  resetConversationMailStore,
} from '../mail/conversationMailStore';
import {
  createOfficeAutomationHost,
  resetOfficeAutomationHostForTests,
} from './officeAutomationHost';
import {
  listProjectDocuments,
  resetOfficeDocumentRuntimeForTests,
} from './officeDocumentRuntimeHost';
import { resetDocumentTimelineJournalForTests } from './officeDocumentTimelineJournal';
import { projectTimelineFromConversation } from './pilotConversationTimeline';

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = join(here, '..');
const repoRoot = join(here, '../../../..');

function readSrc(relative: string): string {
  return readFileSync(join(srcRoot, relative), 'utf8');
}

function readRepo(relative: string): string {
  return readFileSync(join(repoRoot, relative), 'utf8');
}

describe('PT-15 Office Document Runtime wiring', () => {
  beforeEach(() => {
    resetOfficeAutomationHostForTests();
    resetOfficeDocumentRuntimeForTests();
    resetDocumentTimelineJournalForTests();
    resetConversationMailStore();
  });

  it('issues documents from OrderConfirmed through Automation → Document Runtime', async () => {
    const host = createOfficeAutomationHost();
    await host.runtime.publish(
      buildBusinessEvent({
        kind: 'OrderConfirmed',
        source: 'offer-experience',
        correlationId: 'case-dse-starter',
        payload: {
          caseId: 'case-dse-starter',
          orderId: 'ORD-1',
          partnerName: 'Domy s energií',
          companyName: 'DSE s.r.o.',
          packageName: 'Starter',
          amountCzk: 14_970,
          contactEmail: 'jana@domysenergii.cz',
        },
      }),
    );

    const docs = listProjectDocuments('case-dse-starter');
    assert.equal(docs.length, 5);
    assert.ok(docs.some((item) => item.type === 'electronic_order'));
    assert.ok(host.journal.documents.length >= 5);

    const store = getConversationMailStore();
    const attached = store.messages.filter(
      (message) =>
        message.attachments !== undefined && message.attachments.length > 0,
    );
    assert.ok(attached.length >= 5);

    const timeline = projectTimelineFromConversation('case-dse-starter');
    assert.ok(timeline.some((event) => event.kind === 'document.generated'));
    assert.ok(timeline.some((event) => event.kind === 'document.attached'));
    assert.ok(timeline.some((event) => event.kind === 'document.sent'));
  });

  it('keeps Office viewer free of document creation and SMTP', () => {
    const viewer = readSrc(
      'features/pilot-workspace/terminal/ProjectDocumentViewer.tsx',
    );
    const detail = readSrc(
      'features/pilot-workspace/terminal/PilotTerminalDetail.tsx',
    );
    const workspace = readSrc('features/documents/DocumentsWorkspacePage.tsx');
    const host = readSrc('office/officeDocumentRuntimeHost.ts');
    const automation = readRepo(
      'packages/business-automation/src/runtime/automationRuntime.ts',
    );

    assert.match(detail, /ProjectDocumentViewer/);
    assert.match(viewer, /Download/);
    assert.match(viewer, /Send/);
    assert.match(viewer, /pilot-project-document-status/);
    assert.doesNotMatch(viewer, /prepareDocumentPackage|issueProforma/);
    assert.doesNotMatch(viewer, /nodemailer|imapflow/);
    assert.doesNotMatch(workspace, /prepareDocumentPackage|issueProforma/);
    assert.doesNotMatch(workspace, /office-docs-prepare|office-docs-proforma/);
    assert.match(host, /createDocumentRuntime/);
    assert.match(host, /generateForEvent|issueForBusinessEvent/);
    assert.doesNotMatch(automation, /renderPlainTextPdf|bytesToBase64/);
  });
});
