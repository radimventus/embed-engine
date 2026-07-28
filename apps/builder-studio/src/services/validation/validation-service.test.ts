import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createAssetService } from '../asset-service';
import { createBuildService } from '../build/build-service';
import { createPublishService } from '../publish/publish-service';
import { createRuntimePreviewService } from '../preview/runtime-preview-service';
import {
  decideQualityGate,
  isPublishAllowedByQualityGate,
} from './quality-gate';
import { createValidationService } from './validation-service';
import { DEFAULT_VALIDATION_RULES } from './default-rules';

describe('createValidationService', () => {
  it('validates project and returns Quality Gate', () => {
    const assets = createAssetService();
    const build = createBuildService({
      getProject: (id) => assets.getActiveProject(id),
      now: () => new Date('2026-08-17T20:00:00.000Z'),
      createId: (prefix) => `${prefix}-val`,
    });
    const publish = createPublishService({
      getPackage: (id) => build.getPackage(id),
    });
    const preview = createRuntimePreviewService({
      getPublishedPackage: (id) => publish.getPublishedPackage(id),
    });
    const validation = createValidationService({
      getProject: (id) => assets.getActiveProject(id),
      getLatestBuild: (id) => build.getLatestBuild(id),
      getLatestPublish: (id) => {
        const latest = build.getLatestBuild(id);
        return latest
          ? publish.getLatestPublish(latest.package.packageId)
          : null;
      },
      getPreviewState: () => preview.getPreviewState(),
      now: () => new Date('2026-08-17T20:05:00.000Z'),
    });

    const beforeBuild = validation.validateProject('harmony-124');
    assert.equal(beforeBuild.qualityGate, 'Failed');
    assert.ok(beforeBuild.errors.some((item) => item.ruleId === 'build.completed'));

    const built = build.buildProject('harmony-124');
    assert.equal(built.success, true);
    const afterBuild = validation.validateProject('harmony-124');
    assert.ok(isPublishAllowedByQualityGate(afterBuild.qualityGate));
    assert.equal(afterBuild.passed, true);

    const published = publish.publishPackage(built.package.packageId);
    assert.equal(published.success, true);
    preview.openPreview(built.package.packageId);
    const afterPreview = validation.validateProject('harmony-124');
    assert.ok(afterPreview.score >= afterBuild.score);
    assert.equal(validation.getEvents('harmony-124')[0]?.type, 'ValidationFinished');
  });

  it('supports category validators independently', () => {
    const assets = createAssetService();
    const validation = createValidationService({
      getProject: (id) => assets.getActiveProject(id),
      getLatestBuild: () => null,
      getLatestPublish: () => null,
      getPreviewState: () => ({
        state: 'Idle',
        session: null,
        runtimeVersion: 'adapter-stub-1.0.0',
        loadedPackageId: null,
        lastError: null,
      }),
    });

    const assetsReport = validation.validateAssets('family-98');
    assert.ok(assetsReport.errors.some((item) => item.category === 'Assets'));
    const layoutReport = validation.validateLayouts('family-98');
    assert.ok(layoutReport.errors.some((item) => item.category === 'Layout'));
  });

  it('keeps extensible rule catalog', () => {
    assert.ok(DEFAULT_VALIDATION_RULES.length >= 10);
    const categories = new Set(
      DEFAULT_VALIDATION_RULES.map((rule) => rule.category),
    );
    assert.ok(categories.has('Assets'));
    assert.ok(categories.has('Layout'));
    assert.ok(categories.has('Knowledge'));
    assert.ok(categories.has('Build'));
    assert.ok(categories.has('Publish'));
    assert.ok(categories.has('Runtime Preview'));
  });

  it('maps findings to quality gate decisions', () => {
    assert.equal(decideQualityGate([], []), 'Passed');
    assert.equal(
      decideQualityGate(
        [],
        [
          {
            ruleId: 'w',
            category: 'Knowledge',
            severity: 'warning',
            message: 'w',
            recommendation: 'r',
          },
        ],
      ),
      'PassedWithWarnings',
    );
    assert.equal(
      decideQualityGate(
        [
          {
            ruleId: 'e',
            category: 'Build',
            severity: 'error',
            message: 'e',
            recommendation: 'r',
          },
        ],
        [],
      ),
      'Failed',
    );
    assert.equal(isPublishAllowedByQualityGate('Failed'), false);
    assert.equal(isPublishAllowedByQualityGate('PassedWithWarnings'), true);
  });
});
