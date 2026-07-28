import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createAssetService } from '../asset-service';
import { createBuildService } from '../build/build-service';
import { createProjectRegistry } from '../project-registry-service';
import { createPublishService } from '../publish/publish-service';
import { createLifecycleService } from './lifecycle-service';
import { createPlatformEventBus, toTimelineEntries } from './platform-event-bus';
import { createReadinessService } from './readiness-service';
import { canTransition } from './lifecycle-transitions';

describe('lifecycle platform integration', () => {
  it('creates project and emits ProjectCreated', () => {
    const registry = createProjectRegistry([]);
    const events = createPlatformEventBus({
      now: () => new Date('2026-08-17T10:21:00.000Z'),
    });
    const lifecycle = createLifecycleService({ registry, events });
    const created = lifecycle.createProject({ name: 'Nordic 80' });
    assert.equal(created.status, 'Draft');
    assert.equal(lifecycle.getManifest(created.projectId)?.status, 'Draft');
    assert.equal(events.getHistory(created.projectId)[0]?.type, 'ProjectCreated');
  });

  it('orchestrates Draft → Built → Published via services', () => {
    const assets = createAssetService();
    const registry = createProjectRegistry();
    const events = createPlatformEventBus({
      now: () => new Date('2026-08-17T10:25:00.000Z'),
    });
    const lifecycle = createLifecycleService({ registry, events });
    const build = createBuildService({
      getProject: (id) => assets.getActiveProject(id),
      now: () => new Date('2026-08-17T10:25:00.000Z'),
      createId: (prefix) => `${prefix}-lc`,
    });
    const publish = createPublishService({
      getPackage: (id) => build.getPackage(id),
      now: () => new Date('2026-08-17T10:27:00.000Z'),
      createId: (prefix) => `${prefix}-lc`,
    });

    const built = build.buildProject('harmony-124');
    assert.equal(built.success, true);
    lifecycle.syncBuildVersion('harmony-124', built.manifest.version);
    lifecycle.changeStatus('harmony-124', 'ReadyForPublish');
    assert.equal(lifecycle.getManifest('harmony-124')?.status, 'ReadyForPublish');

    const published = publish.publishPackage(built.package.packageId);
    assert.equal(published.success, true);
    lifecycle.syncPublishVersion(
      'harmony-124',
      published.publishManifest!.version,
    );
    assert.equal(lifecycle.getManifest('harmony-124')?.status, 'Published');
    assert.equal(
      lifecycle.getVersionInfo('harmony-124')?.build,
      built.manifest.version,
    );
    assert.ok(
      events.getHistory('harmony-124').some((e) => e.type === 'BuildFinished'),
    );
    assert.ok(
      events
        .getHistory('harmony-124')
        .some((e) => e.type === 'PublishFinished'),
    );
  });

  it('archives and restores through lifecycle service', () => {
    const registry = createProjectRegistry();
    const events = createPlatformEventBus();
    const lifecycle = createLifecycleService({ registry, events });
    lifecycle.archive('family-98');
    assert.equal(lifecycle.getManifest('family-98')?.status, 'Archived');
    assert.equal(events.getHistory('family-98')[0]?.type, 'ProjectArchived');
    lifecycle.restore('family-98');
    assert.equal(lifecycle.getManifest('family-98')?.status, 'Draft');
  });

  it('duplicates a project as Draft', () => {
    const registry = createProjectRegistry();
    const events = createPlatformEventBus();
    const lifecycle = createLifecycleService({ registry, events });
    const copy = lifecycle.duplicate('harmony-124');
    assert.equal(copy.status, 'Draft');
    assert.match(copy.name, /Copy$/);
  });

  it('evaluates readiness without runtime interpretation', () => {
    const assets = createAssetService();
    const readiness = createReadinessService();
    const project = assets.getActiveProject('harmony-124');
    assert.ok(project !== null);
    const report = readiness.evaluate({
      project,
      latestBuild: null,
      latestPublish: null,
    });
    assert.ok(report.overallPercent > 0);
    assert.ok(report.mediaPercent > 0);
    assert.ok(report.recommendations.length > 0);
  });

  it('builds timeline from platform events', () => {
    const events = createPlatformEventBus({
      now: () => new Date('2026-08-17T10:29:00.000Z'),
    });
    events.publish('ProjectCreated', 'p1', 'created');
    events.publish('BuildFinished', 'p1', 'build');
    events.publish('PublishFinished', 'p1', 'publish');
    events.publish('PreviewOpened', 'p1', 'preview');
    const timeline = toTimelineEntries(events.getHistory('p1'));
    assert.deepEqual(
      timeline.map((item) => item.label),
      ['Preview', 'Publish', 'Build', 'Created'],
    );
  });

  it('rejects invalid lifecycle transitions', () => {
    assert.equal(canTransition('Draft', 'Published'), false);
    assert.equal(canTransition('Draft', 'ReadyForBuild'), true);
  });
});
