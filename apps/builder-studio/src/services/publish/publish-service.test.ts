import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createAssetService } from '../asset-service';
import { createBuildService } from '../build/build-service';
import { createPublishService } from './publish-service';
import { listDeploymentTargets } from '../../model/deployment-targets';

const docsDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../docs',
);

describe('createPublishService', () => {
  it('publishes only from an existing ProjectPackage', () => {
    const assets = createAssetService();
    const build = createBuildService({
      getProject: (projectId) => assets.getActiveProject(projectId),
      now: () => new Date('2026-08-17T14:00:00.000Z'),
      createId: (prefix) => `${prefix}-pub-test`,
    });
    const built = build.buildProject('harmony-124');
    const publish = createPublishService({
      getPackage: (packageId) => build.getPackage(packageId),
      now: () => new Date('2026-08-17T15:00:00.000Z'),
      createId: (prefix) => `${prefix}-ok`,
    });

    const result = publish.publishPackage(built.package.packageId);
    assert.equal(result.success, true);
    assert.ok(result.publishedPackage !== null);
    assert.equal(result.publishManifest?.buildVersion, '1.0.0');
    assert.equal(result.publishedPackage?.runtimeEntry.includes('harmony-124'), true);
    assert.equal(result.distribution?.root, 'distribution/');
    assert.equal(result.distribution?.publishPath, 'distribution/publish.json');

    mkdirSync(docsDir, { recursive: true });
    writeFileSync(
      join(docsDir, 'sample-publish.harmony-124.json'),
      `${JSON.stringify(result.publishManifest, null, 2)}\n`,
      'utf8',
    );
    writeFileSync(
      join(docsDir, 'sample-published-package.harmony-124.json'),
      `${JSON.stringify(
        {
          packageId: result.publishedPackage?.packageId,
          version: result.publishedPackage?.version,
          runtimeEntry: result.publishedPackage?.runtimeEntry,
          publishedAt: result.publishedPackage?.publishedAt,
          metadata: result.publishedPackage?.metadata,
          publishManifest: result.publishedPackage?.publishManifest,
          assetCounts: {
            hero: result.publishedPackage?.assets.hero.length,
            photographs: result.publishedPackage?.assets.photographs.length,
            video: result.publishedPackage?.assets.video.length,
          },
        },
        null,
        2,
      )}\n`,
      'utf8',
    );
  });

  it('fails publish for unsuccessful build package', () => {
    const assets = createAssetService();
    const build = createBuildService({
      getProject: (projectId) => assets.getActiveProject(projectId),
      now: () => new Date('2026-08-17T14:30:00.000Z'),
      createId: (prefix) => `${prefix}-fail`,
    });
    const built = build.buildProject('family-98');
    assert.equal(built.package.publishable, false);

    const publish = createPublishService({
      getPackage: (packageId) => build.getPackage(packageId),
      now: () => new Date('2026-08-17T15:30:00.000Z'),
    });
    const result = publish.publishPackage(built.package.packageId);
    assert.equal(result.success, false);
    assert.equal(result.publishedPackage, null);
    assert.ok(
      result.errors.some((issue) => issue.code === 'BUILD_NOT_SUCCESSFUL'),
    );
  });

  it('never accepts missing package id', () => {
    const publish = createPublishService({
      getPackage: () => null,
    });
    const result = publish.publishPackage('missing-package');
    assert.equal(result.success, false);
    assert.ok(result.errors.some((issue) => issue.code === 'PACKAGE_NOT_FOUND'));
  });

  it('keeps publish history for the session', () => {
    const assets = createAssetService();
    const build = createBuildService({
      getProject: (projectId) => assets.getActiveProject(projectId),
      now: () => new Date('2026-08-17T16:00:00.000Z'),
      createId: (prefix) => `${prefix}-hist`,
    });
    const built = build.buildProject('harmony-124');
    let n = 0;
    const publish = createPublishService({
      getPackage: (packageId) => build.getPackage(packageId),
      now: () => {
        n += 1;
        return new Date(`2026-08-17T16:${String(n).padStart(2, '0')}:00.000Z`);
      },
    });

    publish.publishPackage(built.package.packageId);
    publish.publishPackage(built.package.packageId);
    assert.equal(publish.getPublishHistory(built.package.packageId).length, 2);
    assert.equal(
      publish.getLatestPublish(built.package.packageId)?.publishManifest
        ?.version,
      '1.0.1',
    );
  });

  it('exposes deployment target interface catalog only', () => {
    const targets = listDeploymentTargets();
    assert.deepEqual(
      targets.map((item) => item.kind),
      ['GitHub Pages', 'S3', 'Local', 'Cloud Storage'],
    );
  });
});
