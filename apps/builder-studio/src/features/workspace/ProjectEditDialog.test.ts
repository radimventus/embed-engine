import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const dialog = readFileSync(
  fileURLToPath(new URL('./ProjectEditDialog.tsx', import.meta.url)),
  'utf8',
);
const request = readFileSync(
  fileURLToPath(new URL('./requestProjectConfig.ts', import.meta.url)),
  'utf8',
);

describe('Builder Project privacy authoring', () => {
  it('Project edit UI contains the Project privacy field and identity', () => {
    assert.match(dialog, /Zásady ochrany osobních údajů/);
    assert.match(
      dialog,
      /Odkaz se zobrazí návštěvníkům u formulářů pro odeslání poptávky v tomto projektu\./,
    );
    assert.match(dialog, /canonicalProjectName/);
    assert.match(dialog, /canonicalProjectId/);
    assert.match(dialog, /data-testid="project-privacy-identity"/);
    assert.match(dialog, /data-testid="project-privacy-url"/);
    assert.match(dialog, /parseProjectPrivacyUrlInput\(privacyUrl\)/);
  });

  it('loads current server privacy value and saves through Platform API', () => {
    assert.match(dialog, /requestProjectConfig\(projectId/);
    assert.match(dialog, /saveProjectConfig\(/);
    assert.match(dialog, /setPrivacyUrl\(config\.privacyUrl \?\? ''\)/);
    assert.match(request, /\/public\/projects\/\$\{encodeURIComponent\(projectId\)\}\/config/);
    assert.match(request, /method: 'PUT'/);
    assert.match(request, /credentials: 'include'/);
  });

  it('shows success only after durable backend persistence and preserves input on failure', () => {
    assert.match(dialog, /setSaving\(true\)/);
    assert.match(dialog, /primaryLabel=\{saving \? 'Ukládám…' : 'Uložit změny'\}/);
    assert.match(dialog, /busy=\{saving\}/);
    assert.match(dialog, /\.then\(\(\) => \{/);
    assert.match(dialog, /onSubmit\(/);
    assert.match(dialog, /onClose\(\)/);
    assert.match(dialog, /\.catch\(\(error: unknown\) => \{/);
    assert.match(dialog, /setSaving\(false\)/);
    assert.match(dialog, /setPrivacyError\(/);
    assert.equal(dialog.includes('localStorage'), false);
    assert.equal(dialog.includes('upsertBuilderCompany'), false);
    assert.equal(dialog.includes('upsertBuilderCanonicalProject'), false);
  });

  it('is reachable from the normal Builder workspace Project path', () => {
    const app = readFileSync(
      fileURLToPath(new URL('../builder-studio/BuilderStudioApp.tsx', import.meta.url)),
      'utf8',
    );
    const sidebar = readFileSync(
      fileURLToPath(new URL('./WorkspaceSidebar.tsx', import.meta.url)),
      'utf8',
    );

    assert.match(sidebar, /onEditProject/);
    assert.match(sidebar, /Upravit projekt/);
    assert.match(sidebar, /data-testid="workspace-edit-project"/);
    assert.match(app, /onEditProject=\{\(\) => setEditOpen\(true\)\}/);
    assert.match(app, /<WorkspaceSidebar/);
    assert.match(app, /<ProjectEditDialog/);
    assert.match(app, /canonicalProjectId=/);
  });
});
