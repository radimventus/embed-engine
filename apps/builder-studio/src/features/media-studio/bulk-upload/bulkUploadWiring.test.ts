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
    assert.match(view, /openBulkUpload\('images'\)/);
    assert.match(view, /openBulkUpload\('svg'\)/);
    assert.match(view, /openBulkUpload\('documents'\)/);
    assert.doesNotMatch(view, /univerzální upload/i);
  });

  it('uses authenticated, house-scoped Platform media uploads', () => {
    const request = readFileSync(
      join(here, 'requestBulkMediaUpload.ts'),
      'utf8',
    );
    assert.match(request, /requestPlatformHousePackageMediaUpload/);
    assert.match(request, /houseId/);
    assert.match(request, /relativeDir/);
    assert.doesNotMatch(request, /\/api\/house-package\/upload/);
    assert.doesNotMatch(request, /base64/);
  });

  it('polishes completion and deferred progress (BU-001A)', () => {
    const dialog = readFileSync(join(here, 'BulkUploadDialog.tsx'), 'utf8');
    assert.match(dialog, /Hotovo – Zavřít/);
    assert.match(dialog, /BULK_UPLOAD_PROGRESS_REVEAL_MS\s*=\s*300/);
    assert.match(dialog, /showProgress/);
    assert.match(dialog, /hideSecondary=\{phase === 'done'\}/);
  });

  it('uses gallery DnD for ordering only (BU-002A)', () => {
    const view = readFileSync(join(here, '../MediaStudioView.tsx'), 'utf8');
    const ghost = readFileSync(join(here, 'createGalleryDragGhost.ts'), 'utf8');

    assert.match(view, /createGalleryDragGhost/);
    assert.match(view, /Přetáhněte miniatury pro změnu pořadí/);
    assert.match(view, /overIndex/);
    assert.match(view, /title=\{area === 'svg' \? 'SVG' : 'Půdorys'\}/);
    assert.match(view, /onPickFiles/);
    assert.doesNotMatch(view, /AssetDropZone/);
    assert.doesNotMatch(view, /FileDragGhost/);
    assert.doesNotMatch(view, /Pusťte soubory pro nahrání/);
    assert.match(ghost, /opacity: 0\.72/);
  });
});
