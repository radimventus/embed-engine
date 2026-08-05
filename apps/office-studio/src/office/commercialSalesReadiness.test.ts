/**
 * PT-COM-01 — Pilot Sales Readiness (Improvement Log + barriers locked).
 * No feature work — documents sale-blocking gaps for first pilots.
 */

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(root, '../../../..');
const improvementLog = join(
  repoRoot,
  'docs/platform/office/improvement-log',
);

describe('PT-COM-01 Pilot Sales Readiness', () => {
  it('documents critical first-sale barriers in Improvement Log', () => {
    const report = readFileSync(
      join(repoRoot, 'docs/platform/office/PT-COM-01-pilot-sales-readiness.md'),
      'utf8',
    );
    const index = readFileSync(join(improvementLog, 'README.md'), 'utf8');

    assert.match(report, /Pilot Dry Run/);
    assert.match(report, /Production Readiness/);
    assert.match(report, /S-001/);
    assert.match(report, /S-002/);
    assert.match(report, /S-003/);
    assert.match(report, /7b00d9c/);
    assert.match(report, /Manuální SOP/);

    assert.match(index, /Priority \(1–5\)|Priority \*\*1\*\*/);
    assert.match(index, /S-001/);
    assert.match(index, /S-002/);
    assert.match(index, /S-003/);

    for (const id of [
      'S-001-durable-partner-identity.md',
      'S-002-live-smtp-offer-delivery.md',
      'S-003-personalized-offer-entry.md',
      'S-007-payment-finance-sop.md',
    ]) {
      assert.equal(existsSync(join(improvementLog, id)), true, id);
    }

    const partners = readFileSync(
      join(root, '../features/partners/PartnersWorkspacePage.tsx'),
      'utf8',
    );
    assert.match(partners, /createPilotMailSession\(\)/);
  });
});
