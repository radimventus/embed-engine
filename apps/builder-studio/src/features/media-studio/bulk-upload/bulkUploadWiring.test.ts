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

  it('polishes completion and deferred progress (BU-001A)', () => {
    const dialog = readFileSync(join(here, 'BulkUploadDialog.tsx'), 'utf8');
    assert.match(dialog, /Hotovo – Zavřít/);
    assert.match(dialog, /BULK_UPLOAD_PROGRESS_REVEAL_MS\s*=\s*300/);
    assert.match(dialog, /showProgress/);
    assert.match(dialog, /hideSecondary=\{phase === 'done'\}/);
  });

  it('supports drag-and-drop asset manager (BU-002)', () => {
    const view = readFileSync(join(here, '../MediaStudioView.tsx'), 'utf8');
    const zone = readFileSync(join(here, 'AssetDropZone.tsx'), 'utf8');
    const ghost = readFileSync(join(here, 'FileDragGhost.tsx'), 'utf8');
    const dialog = readFileSync(join(here, 'BulkUploadDialog.tsx'), 'utf8');
    const shell = readFileSync(
      join(
        here,
        '../../../../../../packages/platform-shell/src/PlatformDialog.tsx',
      ),
      'utf8',
    );

    assert.match(view, /AssetDropZone/);
    assert.match(view, /FileDragGhost/);
    assert.match(view, /onDropFiles/);
    assert.match(view, /addInputRef\.current\?\.click/);
    assert.match(zone, /Pusťte soubory pro nahrání/);
    assert.match(ghost, /\+/);
    assert.match(dialog, /initialFiles/);
    assert.match(dialog, /autoStart/);
    assert.match(shell, /hideSecondary/);
  });
});
