/**
 * PT-19 — First Pilot Execution validation.
 * Runs commercial flow evidence and writes the Pilot Execution Report.
 */

import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  executeFirstPilotCommercialFlow,
  formatPilotExecutionReportMarkdown,
} from './pilotFirstExecution';

const here = dirname(fileURLToPath(import.meta.url));
const docsRoot = join(here, '../../../../docs/platform/office/pilot-execution');

function readDoc(name: string): string {
  return readFileSync(join(docsRoot, name), 'utf8');
}

describe('PT-19 first pilot execution', () => {
  it('executes first pilot flow without critical intervention and ships reports', async () => {
    const record = await executeFirstPilotCommercialFlow();
    assert.equal(record.partnerId, 'p-dse');
    assert.equal(record.criticalPlatformIntervention, false);
    for (const step of record.flow) {
      assert.equal(step.status, 'PASS', `${step.step}: ${step.evidence}`);
    }

    mkdirSync(docsRoot, { recursive: true });
    writeFileSync(
      join(docsRoot, 'pilot-execution-report.md'),
      formatPilotExecutionReportMarkdown(record),
      'utf8',
    );

    const required = [
      'README.md',
      'pilot-execution-report.md',
      'operational-findings.md',
      'pilot-review.md',
      'gm2-prioritized-backlog.md',
    ] as const;
    for (const file of required) {
      assert.ok(existsSync(join(docsRoot, file)), `missing ${file}`);
    }

    const findings = readDoc('operational-findings.md');
    assert.match(findings, /F-01/);
    assert.match(findings, /Workflow step/);
    assert.match(findings, /Offer → Order|Payment|Pilot Ready/);
    assert.match(findings, /UX|Ops|Commercial|Missing|Unexpected/);
    assert.match(findings, /GM2-/);
    assert.match(findings, /Findings by Workflow step/);

    const review = readDoc('pilot-review.md');
    assert.match(review, /What worked/);
    assert.match(review, /intervention|What required/i);
    assert.match(review, /partner valued positively|Partner signal/i);
    assert.match(review, /must improve|GM-2/i);

    const backlog = readDoc('gm2-prioritized-backlog.md');
    assert.match(backlog, /## Critical/);
    assert.match(backlog, /## High/);
    assert.match(backlog, /## Medium/);
    assert.match(backlog, /## Nice to Have/);
    assert.match(backlog, /GM2-C01/);
    assert.match(backlog, /GM2-H01/);
    assert.match(backlog, /pilot experience|F-0/i);

    const report = readDoc('pilot-execution-report.md');
    assert.match(report, /Pilot Execution Report/);
    assert.match(report, /Offer/);
    assert.match(report, /Pilot Ready/);
    assert.match(report, /Critical platform intervention required: \*\*NO\*\*/);
    assert.match(report, /only.*pilot-deployment|Deployment Package/i);
  });
});
