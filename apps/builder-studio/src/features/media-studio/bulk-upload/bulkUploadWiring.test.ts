import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));

describe('BU-001 bulk upload wiring', () => {
  it('exposes per-section bulk upload in Media Studio', () => {
    const view = readFileSync(join(here, '../MediaStudioView.tsx'), 'utf8');
    assert.match(view, /Nahrát více souborů/);
    assert.match(view, /BulkUploadDialog/);
    assert.match(view, /setBulkKind\('images'\)/);
    assert.match(view, /setBulkKind\('svg'\)/);
    assert.match(view, /setBulkKind\('documents'\)/);
    assert.doesNotMatch(view, /univerzální upload/i);
  });

  it('hosts Builder upload endpoint without Package Layer persist changes', () => {
    const vite = readFileSync(
      join(here, '../../../../vite.config.js'),
      'utf8',
    );
    assert.match(vite, /\/api\/house-package\/upload/);
    assert.match(vite, /media\/gallery/);
    assert.match(vite, /media\/plans/);
    assert.match(vite, /media\/documents/);
  });
});
