import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import { buildProjectDashboardModel } from './projectDashboardModel';

function fakeSnapshot(
  overrides: Partial<HousePackageEditSnapshot> = {},
): HousePackageEditSnapshot {
  return {
    packageRootLabel: '/house-package',
    diskRoot: 'apps/client-studio/public/house-package',
    mountedAt: '2026-07-31T12:52:00.000Z',
    dirtyState: 'clean',
    dirty: [],
    canUndo: false,
    saveError: null,
    sectionErrors: [],
    geometryByFloor: {},
    working: {
      roomsCsv: 'floor,room,name,area\n',
      galleryCsv: 'order,room,file\n',
      videosCsv: 'order,room,provider,mediaId\n',
      manifestJson: JSON.stringify({
        version: '1.0.8',
        rooms: [
          { id: 'a', decisionCanvas: 'decision-canvas/a.svg' },
          { id: 'b', decisionCanvas: 'decision-canvas/b.svg' },
        ],
      }),
      heroRelativePath: 'media/hero/hero.webp',
    },
    validation: {
      ok: true,
      builderImport: {
        rooms: { rooms: [{}, {}, {}] },
        gallery: { entries: [{}, {}] },
        videos: { entries: [{}] },
        floors: { floors: [{}, {}] },
        svg: { entries: [{}, {}, {}] },
        manifest: { version: '1' },
      },
    },
    ...overrides,
  } as unknown as HousePackageEditSnapshot;
}

describe('buildProjectDashboardModel (EPIC-BX-02)', () => {
  it('reads stats and version from HP snapshot / manifest', () => {
    const model = buildProjectDashboardModel({
      project: {
        id: 'harmony-124',
        name: 'Harmony 124',
        packageRoot: 'apps/client-studio/public/house-packages/harmony-124',
        companyId: 'ac-modular',
        description: '',
        status: 'ready',
        slug: 'harmony-124',
        objectType: 'harmony',
        metadata: '',
      },
      companyName: 'AC Modular',
      snapshot: fakeSnapshot(),
      validationReport: {
        status: 'PASS',
        errorCount: 0,
        warningCount: 0,
        passCount: 4,
        issues: [],
        passes: [],
        canPublish: true,
        source: 'working',
        validatedAt: '2026-07-31T12:52:00.000Z',
      },
      releaseSummary: null,
    });

    assert.equal(model.projectName, 'Harmony 124');
    assert.equal(model.companyName, 'AC Modular');
    assert.equal(model.companyInitials, 'AM');
    assert.equal(model.publishHeadline.version, 'v1.0.8');
    assert.equal(model.readinessStateLabel, 'Ready for Publish');
    assert.equal(model.stats.rooms, 3);
    assert.equal(model.stats.photos, 2);
    assert.equal(model.stats.videos, 1);
    assert.equal(model.stats.svgPlans, 3);
    assert.equal(model.stats.experienceModules, 2);
    assert.equal(model.stats.validationLabel, 'Validation PASS');
    assert.ok(model.readiness.some((item) => item.label === 'Galerie'));
    assert.ok(model.readiness.some((item) => item.label === 'Experience'));
  });
});
