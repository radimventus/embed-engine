import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildHousePackageValidationReport } from './housePackageValidationReport';

describe('buildHousePackageValidationReport (CAP-BLD-05)', () => {
  it('PASS when object-house returns no errors', () => {
    const report = buildHousePackageValidationReport({
      errors: [],
      source: 'disk',
      now: () => new Date('2026-07-31T12:00:00.000Z'),
    });
    assert.equal(report.status, 'PASS');
    assert.equal(report.errorCount, 0);
    assert.equal(report.warningCount, 0);
    assert.equal(report.canPublish, true);
    assert.ok(report.passCount >= 10);
  });

  it('ERROR blocks publish; localizes file/item/type', () => {
    const report = buildHousePackageValidationReport({
      errors: [
        {
          code: 'BP_DUPLICATE_ROOM',
          message: 'Duplicate room id "kitchen"',
          path: 'rooms.csv:row 3',
        },
        {
          code: 'BP_ASSET_MISSING',
          message: 'Missing gallery asset',
          path: 'media/gallery/99.webp',
        },
      ],
      source: 'disk',
    });
    assert.equal(report.status, 'ERROR');
    assert.equal(report.errorCount, 2);
    assert.equal(report.canPublish, false);
    assert.equal(report.issues[0]?.type, 'BP_DUPLICATE_ROOM');
    assert.equal(report.issues[0]?.file, 'rooms.csv');
    assert.equal(report.issues[0]?.item, 'row 3');
    assert.equal(report.issues[0]?.editor, 'rooms');
    assert.equal(report.issues[1]?.category, 'missing-assets');
    assert.equal(report.issues[1]?.editor, 'gallery');
  });

  it('WARNING does not block publish', () => {
    const report = buildHousePackageValidationReport({
      errors: [],
      warnings: [
        {
          type: 'UNSAVED_WORKING_COPY',
          file: '(session)',
          item: 'working-copy',
          description: 'Unsaved edits on disk gate.',
          category: 'mandatory',
          editor: 'overview',
        },
      ],
      source: 'disk',
    });
    assert.equal(report.status, 'WARNING');
    assert.equal(report.warningCount, 1);
    assert.equal(report.errorCount, 0);
    assert.equal(report.canPublish, true);
  });

  it('healable geometry ERROR still allows publish attempt', () => {
    const report = buildHousePackageValidationReport({
      errors: [
        {
          code: 'HP003_GEOMETRY_MISSING',
          message: 'missing',
          path: 'media/plans/p1.geometry.json',
        },
      ],
      source: 'disk',
    });
    assert.equal(report.status, 'ERROR');
    assert.equal(report.canPublish, true);
  });

  it('maps CSV path to rooms/gallery/videos categories', () => {
    const report = buildHousePackageValidationReport({
      errors: [
        {
          code: 'BP_MISSING_FIELD',
          message: 'Missing field name',
          path: 'gallery.csv:row 2',
        },
      ],
      source: 'working',
    });
    assert.equal(report.issues[0]?.category, 'gallery');
    assert.equal(report.issues[0]?.editor, 'gallery');
  });
});
