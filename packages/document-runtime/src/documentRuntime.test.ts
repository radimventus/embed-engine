/**
 * PT-15 — Document Runtime tests.
 */

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  buildDocumentContextFromPayload,
  COMMERCIAL_DOCUMENT_CATALOG,
  createDocumentRuntime,
  DEAL_PACKAGE_ROOT,
  documentsForBusinessEvent,
  ELECTRONIC_ORDER_PACKAGE,
} from './index';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../..');

describe('PT-15 document runtime', () => {
  it('registers commercial documents against deal package sources', () => {
    assert.equal(COMMERCIAL_DOCUMENT_CATALOG.length, 6);
    assert.ok(existsSync(join(repoRoot, DEAL_PACKAGE_ROOT, 'README.md')));
    for (const entry of COMMERCIAL_DOCUMENT_CATALOG) {
      assert.ok(
        existsSync(join(repoRoot, entry.sourcePath)),
        `missing ${entry.sourcePath}`,
      );
      assert.match(entry.sourcePath, new RegExp(`^${DEAL_PACKAGE_ROOT}/`));
    }
    assert.ok(existsSync(join(repoRoot, DEAL_PACKAGE_ROOT, 'invoice-design.css')));
    assert.deepEqual([...ELECTRONIC_ORDER_PACKAGE], [
      'electronic_order',
      'framework',
      'implementation_standard',
      'dpa',
      'vop',
    ]);
  });

  it('maps business events to document sets', () => {
    assert.equal(documentsForBusinessEvent('OrderConfirmed').length, 5);
    assert.deepEqual(documentsForBusinessEvent('ProformaGenerated'), ['proforma']);
    assert.deepEqual(documentsForBusinessEvent('PaymentConfirmed'), []);
  });

  it('generates PDF via Document Runtime (not Automation)', async () => {
    const attached: string[] = [];
    const mailed: string[] = [];
    const timeline: string[] = [];

    const runtime = createDocumentRuntime({
      conversation: {
        attachDocument: (artifact) => {
          attached.push(artifact.id);
        },
      },
      mail: {
        sendDocument: ({ artifact }) => {
          mailed.push(artifact.attachment.fileName);
        },
      },
      timeline: {
        recordDocumentEvent: ({ kind, artifact }) => {
          timeline.push(`${kind}:${artifact.type}`);
        },
      },
    });

    const context = buildDocumentContextFromPayload({
      projectId: 'case-dse-starter',
      payload: {
        partnerName: 'Domy s energií',
        companyName: 'DSE s.r.o.',
        packageName: 'Starter',
        orderId: 'ORD-1',
        amountCzk: 14_970,
        contactEmail: 'jana@domysenergii.cz',
      },
    });

    const result = await runtime.issueForBusinessEvent({
      eventKind: 'OrderConfirmed',
      context,
      sendToEmail: 'jana@domysenergii.cz',
    });

    assert.equal(result.artifacts.length, 5);
    assert.ok(result.artifacts.every((item) => item.attachment.mimeType === 'application/pdf'));
    assert.ok(result.artifacts.every((item) => item.attachment.byteLength > 100));
    assert.match(
      Buffer.from(result.artifacts[0]!.attachment.bytesBase64, 'base64').toString(
        'latin1',
      ),
      /^%PDF/,
    );
    assert.equal(attached.length, 5);
    assert.equal(mailed.length, 1);
    assert.ok(timeline.some((item) => item.startsWith('document.generated:')));
    assert.ok(timeline.some((item) => item.startsWith('document.sent:')));
    assert.equal(runtime.listByProject('case-dse-starter').length, 5);

    const proforma = await runtime.issueForBusinessEvent({
      eventKind: 'ProformaGenerated',
      context: {
        ...context,
        proformaNumber: 'PF-1',
        dueDate: '2026-08-18T00:00:00.000Z',
      },
    });
    assert.equal(proforma.artifacts[0]?.type, 'proforma');
  });

  it('keeps deal invoice design source available', () => {
    const css = readFileSync(
      join(repoRoot, DEAL_PACKAGE_ROOT, 'invoice-design.css'),
      'utf8',
    );
    assert.match(css, /--conis-gold/);
  });
});
