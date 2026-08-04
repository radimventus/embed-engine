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
const mainRoadmap = join(
  here,
  '../../../../docs/roadmap/embed-engine-roadmap.md',
);

function read(name: string): string {
  return readFileSync(join(packageRoot, name), 'utf8');
}

describe('PT-20 GM-2 product roadmap package', () => {
  it('ships consolidated roadmap deliverables with workflow matrix, CAPs and active GM-2', () => {
    const required = [
      'README.md',
      'gm2-product-roadmap.md',
      'consolidated-backlog.md',
      'workflow-backlog-matrix.md',
      'prioritization-matrix.md',
      'cap-plan.md',
      'success-metrics.md',
    ] as const;

    for (const file of required) {
      assert.ok(existsSync(join(packageRoot, file)), `missing ${file}`);
    }

    const roadmap = read('gm2-product-roadmap.md');
    assert.match(roadmap, /GM-2 Product Roadmap/);
    assert.match(roadmap, /Status:\*\* ACTIVE|ACTIVE/);
    assert.match(roadmap, /GM-1.*COMPLETE|COMPLETE/);
    assert.match(roadmap, /CAP-GM2-01/);
    assert.match(roadmap, /F-02|F-01/);
    assert.match(roadmap, /workflow-backlog-matrix/);

    const backlog = read('consolidated-backlog.md');
    assert.match(backlog, /Consolidated Backlog/);
    assert.match(backlog, /GM2-C01/);
    assert.match(backlog, /Dedup|duplicat/i);
    assert.match(backlog, /Pilot|UX|Business|Ops|Technical/i);

    const workflowMatrix = read('workflow-backlog-matrix.md');
    assert.match(workflowMatrix, /Workflow × Backlog|Workflow x Backlog/i);
    assert.match(workflowMatrix, /Product Area/);
    assert.match(workflowMatrix, /Business goal/);
    assert.match(workflowMatrix, /Offer|Payment|Pilot Ready/);
    assert.match(workflowMatrix, /GM2-C01/);
    assert.match(workflowMatrix, /F-02/);

    const matrix = read('prioritization-matrix.md');
    assert.match(matrix, /Critical/);
    assert.match(matrix, /\bXS\b|\bS\b|\bM\b|\bL\b|\bXL\b/);
    assert.match(matrix, /Dependencies|Business impact|Technical impact/i);

    const caps = read('cap-plan.md');
    assert.match(caps, /Technical scope/);
    assert.match(caps, /Estimate/);
    assert.match(caps, /Dependencies/);
    assert.match(caps, /Acceptance/);
    assert.match(caps, /Implementation order/);
    assert.match(caps, /CAP-GM2-05/);

    const metrics = read('success-metrics.md');
    assert.match(metrics, /M-01|onboarding/i);
    assert.match(metrics, /M-02|manual/i);
    assert.match(metrics, /M-03|Automation/i);
    assert.match(metrics, /M-04|cycle|process/i);
    assert.match(metrics, /M-05|satisfaction/i);
    assert.match(metrics, /M-10|Critical/i);

    const published = readFileSync(mainRoadmap, 'utf8');
    assert.match(published, /Commercial Generations/);
    assert.match(published, /GM-1/);
    assert.match(published, /COMPLETE/);
    assert.match(published, /GM-2/);
    assert.match(published, /ACTIVE/);
    assert.match(published, /gm2-roadmap/);
  });
});
