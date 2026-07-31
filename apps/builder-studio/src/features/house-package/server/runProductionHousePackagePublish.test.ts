import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { runProductionHousePackagePublish } from './runProductionHousePackagePublish';

describe('runProductionHousePackagePublish (CAP-BLD-06)', () => {
  it('blocks on non-healable validation ERROR without calling embed:publish', async () => {
    let embedCalls = 0;
    const result = await runProductionHousePackagePublish({
      packageRoot: '/tmp/hp',
      repoRoot: '/tmp/repo',
      importBuilderHousePackage: async () => ({
        ok: false,
        errors: [
          {
            code: 'BP_DUPLICATE_ROOM',
            message: 'Duplicate room',
            path: 'rooms.csv:row 2',
          },
        ],
      }),
      publishAllFloorPlanGeometry: async () => [],
      runEmbedPublish: () => {
        embedCalls += 1;
        return { status: 0, stdout: '', stderr: '' };
      },
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.stage, 'validate');
    }
    assert.equal(embedCalls, 0);
  });

  it('runs geometry then embed:publish and returns real summary', async () => {
    const repoRoot = mkdtempSync(join(tmpdir(), 'bld06-publish-'));
    const packageRoot = join(repoRoot, 'house-package');
    mkdirSync(join(repoRoot, 'docs/embed'), { recursive: true });
    mkdirSync(packageRoot, { recursive: true });
    writeFileSync(
      join(repoRoot, 'docs/embed/version.json'),
      JSON.stringify({
        version: '0.1.0',
        fingerprint: {
          marker: 'EMBED_RUNTIME_BUILD:deadbeef@2026-07-31T18:00:00Z',
          builtAt: '2026-07-31T18:00:00Z',
        },
      }),
      'utf8',
    );
    writeFileSync(
      join(packageRoot, 'manifest.json'),
      JSON.stringify({ version: '1' }),
      'utf8',
    );

    let importCalls = 0;
    let geometryCalls = 0;
    let embedCalls = 0;

    const result = await runProductionHousePackagePublish({
      packageRoot,
      repoRoot,
      importBuilderHousePackage: async () => {
        importCalls += 1;
        if (importCalls === 1) {
          return {
            ok: false,
            errors: [
              {
                code: 'HP003_GEOMETRY_MISSING',
                message: 'missing geometry',
                path: 'media/plans/p1.geometry.json',
              },
            ],
          };
        }
        return { ok: true, result: {} };
      },
      publishAllFloorPlanGeometry: async () => {
        geometryCalls += 1;
        return [{ ok: true }];
      },
      runEmbedPublish: () => {
        embedCalls += 1;
        return { status: 0, stdout: 'READY', stderr: '' };
      },
    });

    assert.equal(result.ok, true);
    assert.equal(geometryCalls, 1);
    assert.equal(embedCalls, 1);
    if (result.ok) {
      assert.equal(result.summary.status, 'Publish OK');
      assert.equal(
        result.summary.buildFingerprint,
        'EMBED_RUNTIME_BUILD:deadbeef@2026-07-31T18:00:00Z',
      );
      assert.equal(result.summary.geometryRan, true);
    }
  });

  it('surfaces exact embed:publish failure and leaves retry possible', async () => {
    const result = await runProductionHousePackagePublish({
      packageRoot: '/tmp/hp',
      repoRoot: '/tmp/repo',
      importBuilderHousePackage: async () => ({ ok: true, result: {} }),
      publishAllFloorPlanGeometry: async () => [],
      runEmbedPublish: () => ({
        status: 1,
        stdout: '',
        stderr: 'Release Snapshot was NOT marked READY.',
      }),
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.stage, 'embed:publish');
      assert.match(result.error, /Release Snapshot was NOT marked READY/);
    }
  });
});
