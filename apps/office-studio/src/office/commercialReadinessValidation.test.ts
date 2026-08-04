/**
 * PT-17 — Commercial Readiness Validation tests.
 */

import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  COMMERCIAL_READINESS_PROJECT_ID,
  formatCommercialReadinessReportMarkdown,
  runCommercialReadinessValidation,
} from './commercialReadinessValidation';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '../../../..');
const reportPath = join(
  repoRoot,
  'docs/platform/office/PT-17-commercial-readiness-report.md',
);

describe('PT-17 commercial readiness validation', () => {
  it('validates full Offer → Pilot Ready lifecycle, failures, and writes readiness report', async () => {
    const report = await runCommercialReadinessValidation();

    assert.equal(report.snapshot.projectId, COMMERCIAL_READINESS_PROJECT_ID);
    assert.equal(report.overall, 'PASS');
    assert.equal(report.readinessScore, 100);
    assert.equal(report.blockers.length, 0);

    for (const area of report.areas) {
      assert.equal(
        area.verdict,
        'PASS',
        `${area.id} expected PASS · ${area.detail}`,
      );
    }

    assert.ok(
      report.areas.some((area) => area.id === 'e2e-lifecycle'),
    );
    assert.ok(report.areas.some((area) => area.id === 'failure-mail'));
    assert.ok(
      report.areas.some((area) => area.id === 'failure-missing-doc'),
    );
    assert.ok(
      report.areas.some((area) => area.id === 'failure-duplicate-event'),
    );
    assert.ok(
      report.areas.some((area) => area.id === 'failure-workflow-interrupt'),
    );
    assert.ok(report.findings.length >= 3);
    assert.ok(report.recommendations.length >= 3);

    const markdown = formatCommercialReadinessReportMarkdown(report);
    assert.match(markdown, /Commercial Readiness Score/);
    assert.match(markdown, /End-to-End Validation Report/);
    assert.match(markdown, /Runtime Consistency Report/);
    assert.match(markdown, /Failure Scenario Report/);
    assert.match(markdown, /Pilot Readiness Report/);
    assert.match(markdown, /\*\*PASS\*\*/);
    assert.match(markdown, /Failure · Workflow interruption/);

    mkdirSync(dirname(reportPath), { recursive: true });
    writeFileSync(reportPath, markdown, 'utf8');
  });
});
