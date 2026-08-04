/**
 * PT-20 — GM-2 Planning & Product Roadmap package validation.
 */

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(
  here,
  '../../../../docs/platform/office/gm2-roadmap',
);

function read(name: string): string {
  return readFileSync(join(packageRoot, name), 'utf8');
}

describe('PT-20 GM-2 product roadmap package', () => {
  it('ships consolidated roadmap deliverables with priority, estimates, CAPs and metrics', () => {
    const required = [
      'README.md',
      'gm2-product-roadmap.md',
      'consolidated-backlog.md',
      'prioritization-matrix.md',
      'cap-plan.md',
      'success-metrics.md',
    ] as const;

    for (const file of required) {
      assert.ok(existsSync(join(packageRoot, file)), `missing ${file}`);
    }

    const roadmap = read('gm2-product-roadmap.md');
    assert.match(roadmap, /GM-2 Product Roadmap/);
    assert.match(roadmap, /CAP-GM2-01/);
    assert.match(roadmap, /F-02|F-01/);
    assert.match(roadmap, /Non-goals|deferred/i);

    const backlog = read('consolidated-backlog.md');
    assert.match(backlog, /Consolidated Backlog/);
    assert.match(backlog, /GM2-C01/);
    assert.match(backlog, /GM2-H01/);
    assert.match(backlog, /Dedup|duplicat/i);
    assert.match(backlog, /GM-1|technical debt|Pilot|UX|Business|Ops/i);
    assert.doesNotMatch(backlog, /Full CRM integration\n\| \*\*GM2/);

    const matrix = read('prioritization-matrix.md');
    assert.match(matrix, /Critical/);
    assert.match(matrix, /High/);
    assert.match(matrix, /Medium/);
    assert.match(matrix, /Nice/);
    assert.match(matrix, /\bXS\b|\bS\b|\bM\b|\bL\b|\bXL\b/);
    assert.match(matrix, /Dependencies|Business impact|Technical impact/i);
    assert.match(matrix, /GM2-C01/);
    assert.match(matrix, /F-02/);

    const caps = read('cap-plan.md');
    assert.match(caps, /CAP-GM2-01/);
    assert.match(caps, /CAP-GM2-02/);
    assert.match(caps, /CAP-GM2-03/);
    assert.match(caps, /CAP-GM2-04/);
    assert.match(caps, /CAP-GM2-05/);
    assert.match(caps, /Acceptance|Business benefit|Goal/i);

    const metrics = read('success-metrics.md');
    assert.match(metrics, /onboarding|M-01/i);
    assert.match(metrics, /manual|M-02/i);
    assert.match(metrics, /Automation|M-03/i);
    assert.match(metrics, /cycle time|M-04|process/i);
    assert.match(metrics, /satisfaction|M-05/i);
  });
});
