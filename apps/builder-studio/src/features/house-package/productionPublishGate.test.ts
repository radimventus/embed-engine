import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildHousePackageReleaseSummary,
  decideProductionPublishGate,
} from './productionPublishGate';

describe('productionPublishGate (CAP-BLD-06)', () => {
  it('continues when object-house has no errors', () => {
    assert.deepEqual(decideProductionPublishGate([]), { action: 'continue' });
  });

  it('runs geometry when only healable HP-003 errors', () => {
    assert.deepEqual(
      decideProductionPublishGate([
        {
          code: 'HP003_GEOMETRY_MISSING',
          message: 'missing',
          path: 'media/plans/p1.geometry.json',
        },
      ]),
      { action: 'run-geometry' },
    );
  });

  it('blocks when non-healable ERROR present', () => {
    const errors = [
      {
        code: 'BP_DUPLICATE_ROOM' as const,
        message: 'dup',
        path: 'rooms.csv:row 2',
      },
      {
        code: 'HP003_GEOMETRY_MISSING' as const,
        message: 'missing',
      },
    ];
    const decision = decideProductionPublishGate(errors);
    assert.equal(decision.action, 'block');
  });

  it('builds release summary from real version artifacts', () => {
    const summary = buildHousePackageReleaseSummary({
      embedVersionJson: {
        version: '0.1.0',
        fingerprint: {
          marker: 'EMBED_RUNTIME_BUILD:abc@2026-07-31T12:00:00Z',
          builtAt: '2026-07-31T12:00:00Z',
        },
      },
      housePackageManifest: { version: '1' },
      geometryRan: false,
    });
    assert.equal(summary.status, 'Publish OK');
    assert.equal(
      summary.buildFingerprint,
      'EMBED_RUNTIME_BUILD:abc@2026-07-31T12:00:00Z',
    );
    assert.equal(summary.housePackageVersion, '1');
    assert.equal(summary.embedVersion, '0.1.0');
    assert.equal(summary.releaseTimestamp, '2026-07-31T12:00:00Z');
    assert.equal(summary.artifacts.embed, 'docs/embed');
    assert.equal(summary.artifacts.housePackage, 'docs/house-package');
  });
});
