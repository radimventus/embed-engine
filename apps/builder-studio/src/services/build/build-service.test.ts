import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createAssetService } from '../asset-service';
import { createBuildService } from './build-service';

const docsDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../docs',
);

describe('createBuildService', () => {
  it('builds a deterministic package for harmony-124', () => {
    const assets = createAssetService();
    let tick = 0;
    const build = createBuildService({
      getProject: (projectId) => assets.getActiveProject(projectId),
      now: () => new Date('2026-08-17T10:43:00.000Z'),
      createId: (prefix) => {
        tick += 1;
        return `${prefix}-fixed-${tick}`;
      },
    });

    const first = build.buildProject('harmony-124');
    const second = build.buildProject('harmony-124');

    assert.equal(first.success, true);
    assert.equal(first.manifest.version, '1.0.0');
    assert.equal(second.manifest.version, '1.0.1');
    assert.equal(first.manifest.projectId, 'harmony-124');
    assert.ok(first.manifest.manifestId.length > 0);
    assert.equal(first.package.publishable, true);
    assert.equal(first.statistics.assetCount, 8);
    assert.ok(first.statistics.layoutCount >= 1);
    assert.equal(first.errors.length, 0);
    assert.ok(first.warnings.length >= 0);

    mkdirSync(docsDir, { recursive: true });
    writeFileSync(
      join(docsDir, 'sample-manifest.harmony-124.json'),
      `${JSON.stringify(first.manifest, null, 2)}\n`,
      'utf8',
    );
  });

  it('does not stop build when validation has errors', () => {
    const assets = createAssetService();
    const build = createBuildService({
      getProject: (projectId) => assets.getActiveProject(projectId),
      now: () => new Date('2026-08-17T11:00:00.000Z'),
      createId: (prefix) => `${prefix}-villa`,
    });

    const result = build.buildProject('family-98');
    assert.equal(result.success, false);
    assert.ok(result.errors.some((issue) => issue.code === 'HERO_MISSING'));
    assert.ok(result.errors.some((issue) => issue.code === 'LAYOUT_MISSING'));
    assert.ok(result.manifest !== null);
    assert.ok(result.package !== null);
    assert.equal(result.package.publishable, false);
  });

  it('keeps session history of last 10 builds', () => {
    const assets = createAssetService();
    let n = 0;
    const build = createBuildService({
      getProject: (projectId) => assets.getActiveProject(projectId),
      now: () => {
        n += 1;
        return new Date(`2026-08-17T12:${String(n).padStart(2, '0')}:00.000Z`);
      },
    });

    for (let i = 0; i < 12; i += 1) {
      build.buildProject('harmony-124');
    }

    assert.equal(build.getBuildHistory().length, 10);
    assert.equal(build.getBuildHistory('harmony-124').length, 10);
    assert.ok(build.getLatestBuild('harmony-124') !== null);
  });

  it('exposes build API helpers without requiring UI', () => {
    const assets = createAssetService();
    const build = createBuildService({
      getProject: (projectId) => assets.getActiveProject(projectId),
      now: () => new Date('2026-08-17T13:00:00.000Z'),
    });

    const collected = build.collectAssets('harmony-124');
    assert.ok(collected.hero.length >= 1);
    const validation = build.validateProject('harmony-124');
    assert.equal(validation.errors.length, 0);
    const manifest = build.generateManifest('harmony-124');
    assert.equal(manifest.metadata.title, 'Harmony 124');
    const pkg = build.packageProject('harmony-124');
    assert.equal(pkg.projectId, 'harmony-124');
  });
});
