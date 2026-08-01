import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { compareReleaseProducts } from './compareReleases';
import {
  appendReleaseRecord,
  loadProjectReleases,
  rollbackToRelease,
} from './releaseHistoryStorage';
import { buildReleaseReadiness } from './releaseReadiness';
import {
  createReleaseRecord,
  emptyReleaseNotesDraft,
  type ReleaseProductSnapshot,
  type ReleaseRecord,
} from './releaseRecord';
import type { HousePackageReleaseSummary } from '../house-package/productionPublishGate';
import type { DecisionQaReport } from '../preview-center/decisionQa';

const summary = (
  version: string,
  fingerprint: string,
): HousePackageReleaseSummary => ({
  status: 'Publish OK',
  buildFingerprint: fingerprint,
  housePackageVersion: version,
  embedVersion: '1.0.0',
  releaseTimestamp: new Date().toISOString(),
  artifacts: {
    housePackage: 'docs/house-package',
    embed: 'docs/embed',
  },
  geometryRan: false,
});

const qa: DecisionQaReport = {
  items: [],
  passCount: 6,
  warnCount: 0,
  failCount: 0,
  readyForPublish: true,
  validationStatus: 'PASS',
  summaryLabel: 'Ready for Publish',
};

const product = (
  hero: string,
  gallery: readonly string[],
  modules: readonly string[],
): ReleaseProductSnapshot => ({
  heroPath: hero,
  galleryFiles: gallery,
  videoCount: 1,
  roomCount: 5,
  experienceModules: modules,
  knowledgeAreas: [
    { id: 'object', label: 'Object', health: 'complete' },
    { id: 'faq', label: 'FAQ', health: 'partial' },
  ],
});

function makeRecord(
  projectId: string,
  version: string,
  fingerprint: string,
  productSnap: ReleaseProductSnapshot,
): ReleaseRecord {
  return createReleaseRecord({
    projectId,
    summary: summary(version, fingerprint),
    notes: {
      ...emptyReleaseNotesDraft(),
      changed: `Release ${version}`,
    },
    product: productSnap,
    qa,
  });
}

describe('releaseCenter (EPIC-BX-07)', () => {
  it('appends release history from existing publish summary (no parallel publish)', () => {
    const projectId = `release-test-${Date.now()}`;
    const record = appendReleaseRecord({
      projectId,
      summary: summary('2.1.0', 'fp-a'),
      notes: { ...emptyReleaseNotesDraft(), changed: 'Hero update' },
      product: product('media/hero/hero.webp', ['01.webp'], [
        'hero',
        'priority',
        'faq',
        'lead-capture',
      ]),
      qa,
    });
    const loaded = loadProjectReleases(projectId);
    assert.equal(loaded.activeReleaseId, record.id);
    assert.equal(loaded.releases[0]?.version, '2.1.0');
    assert.equal(loaded.releases[0]?.notes.changed, 'Hero update');
  });

  it('rollback activates an existing release without new publish', () => {
    const projectId = `rollback-test-${Date.now()}`;
    const first = appendReleaseRecord({
      projectId,
      summary: summary('1.0.0', 'fp-1'),
      notes: emptyReleaseNotesDraft(),
      product: product('media/hero/a.webp', ['00.webp'], ['hero', 'priority']),
      qa,
    });
    appendReleaseRecord({
      projectId,
      summary: summary('2.0.0', 'fp-2'),
      notes: emptyReleaseNotesDraft(),
      product: product('media/hero/b.webp', ['00.webp', '01.webp'], [
        'hero',
        'priority',
        'faq',
      ]),
      qa,
    });
    const rolled = rollbackToRelease(projectId, first.id);
    assert.ok(rolled !== null);
    assert.equal(rolled?.status, 'active');
    const loaded = loadProjectReleases(projectId);
    assert.equal(loaded.activeReleaseId, first.id);
    assert.equal(
      loaded.releases.find((item) => item.id !== first.id)?.status,
      'rolled-back',
    );
  });

  it('compares product surfaces instead of files', () => {
    const left = makeRecord(
      'cmp',
      '1.0.0',
      'fp-l',
      product('media/hero/a.webp', ['00.webp'], ['hero', 'priority']),
    );
    const right = makeRecord(
      'cmp',
      '2.0.0',
      'fp-r',
      product('media/hero/b.webp', ['00.webp', '01.webp'], [
        'hero',
        'priority',
        'faq',
      ]),
    );
    const result = compareReleaseProducts(left, right);
    assert.ok(result.changeCount >= 2);
    assert.ok(result.changes.some((item) => item.area === 'Hero' && item.changed));
    assert.ok(result.changes.some((item) => item.area === 'Media' && item.changed));
    assert.ok(
      result.changes.some((item) => item.area === 'Experience' && item.changed),
    );
  });

  it('builds release readiness from Decision QA + content areas', () => {
    const readiness = buildReleaseReadiness({
      projectId: 'readiness-test',
      snapshot: null,
      validationReport: null,
    });
    assert.ok(readiness.items.some((item) => item.id === 'validation'));
    assert.ok(readiness.items.some((item) => item.id === 'decision-qa'));
    assert.ok(readiness.items.some((item) => item.id === 'media'));
    assert.ok(readiness.items.some((item) => item.id === 'knowledge'));
    assert.ok(readiness.items.some((item) => item.id === 'experience'));
    assert.equal(typeof readiness.readyToRelease, 'boolean');
  });
});
