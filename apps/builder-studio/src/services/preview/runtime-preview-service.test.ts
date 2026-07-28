import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createAssetService } from '../asset-service';
import { createBuildService } from '../build/build-service';
import { createPublishService } from '../publish/publish-service';
import { createRuntimePreviewService } from './runtime-preview-service';
import { createStubRuntimeAdapter } from './stub-runtime-adapter';

function createPublishedPackageId(): {
  packageId: string;
  publish: ReturnType<typeof createPublishService>;
} {
  const assets = createAssetService();
  const build = createBuildService({
    getProject: (projectId) => assets.getActiveProject(projectId),
    now: () => new Date('2026-08-17T18:00:00.000Z'),
    createId: (prefix) => `${prefix}-preview`,
  });
  const built = build.buildProject('harmony-124');
  const publish = createPublishService({
    getPackage: (packageId) => build.getPackage(packageId),
    now: () => new Date('2026-08-17T18:10:00.000Z'),
    createId: (prefix) => `${prefix}-pub`,
  });
  const published = publish.publishPackage(built.package.packageId);
  assert.equal(published.success, true);
  return { packageId: built.package.packageId, publish };
}

describe('createRuntimePreviewService', () => {
  it('opens preview from PublishedPackage only', () => {
    const { packageId, publish } = createPublishedPackageId();
    const preview = createRuntimePreviewService({
      getPublishedPackage: (id) => publish.getPublishedPackage(id),
      now: () => new Date('2026-08-17T18:20:00.000Z'),
      createId: (prefix) => `${prefix}-1`,
    });

    const session = preview.openPreview(packageId);
    assert.equal(session.previewState, 'Ready');
    assert.equal(session.packageId, packageId);
    assert.equal(preview.getPreviewState().state, 'Ready');
    assert.equal(preview.getPreviewHistory()[0]?.type, 'PreviewOpened');
  });

  it('refreshes and closes preview session', () => {
    const { packageId, publish } = createPublishedPackageId();
    const preview = createRuntimePreviewService({
      getPublishedPackage: (id) => publish.getPublishedPackage(id),
      now: () => new Date('2026-08-17T18:30:00.000Z'),
      createId: (prefix) => `${prefix}-2`,
    });

    preview.openPreview(packageId);
    const refreshed = preview.refreshPreview();
    assert.equal(refreshed?.previewState, 'Ready');
    assert.ok(refreshed?.refreshedAt !== null);
    assert.equal(preview.getPreviewHistory()[0]?.type, 'PreviewReloaded');

    const closed = preview.closePreview();
    assert.equal(closed?.previewState, 'Idle');
    assert.equal(preview.getActiveSession(), null);
    assert.equal(preview.getPreviewState().state, 'Idle');
  });

  it('fails when PublishedPackage is missing', () => {
    const preview = createRuntimePreviewService({
      getPublishedPackage: () => null,
      now: () => new Date('2026-08-17T18:40:00.000Z'),
    });
    const session = preview.openPreview('missing');
    assert.equal(session.previewState, 'Error');
    assert.equal(preview.getPreviewHistory()[0]?.type, 'PreviewFailed');
  });

  it('records adapter failures without interpreting package content', () => {
    const { packageId, publish } = createPublishedPackageId();
    const preview = createRuntimePreviewService({
      getPublishedPackage: (id) => publish.getPublishedPackage(id),
      adapter: createStubRuntimeAdapter({ failOnLoad: true }),
      now: () => new Date('2026-08-17T18:50:00.000Z'),
    });
    const session = preview.openPreview(packageId);
    assert.equal(session.previewState, 'Error');
    assert.equal(preview.getPreviewHistory()[0]?.type, 'PreviewFailed');
  });

  it('keeps preview history capped at 20', () => {
    const { packageId, publish } = createPublishedPackageId();
    let n = 0;
    const preview = createRuntimePreviewService({
      getPublishedPackage: (id) => publish.getPublishedPackage(id),
      now: () => {
        n += 1;
        return new Date(Date.UTC(2026, 7, 17, 19, 0, n));
      },
    });

    for (let i = 0; i < 12; i += 1) {
      preview.openPreview(packageId);
      preview.closePreview();
    }
    assert.ok(preview.getPreviewHistory().length <= 20);
    assert.equal(preview.getPreviewHistory().length, 20);
  });
});
