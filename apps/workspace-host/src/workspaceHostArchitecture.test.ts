/**
 * ARCH-01 / VR-04 / VR-05 / VR-005 / PT-VR-06 — Workspace Host architecture guards.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const hostRoot = join(here, '..');

function read(relative: string): string {
  return readFileSync(join(hostRoot, relative), 'utf8');
}

describe('VR-04 Canonical Workspace Shell', () => {
  it('keeps a single Workspace Shell with PlatformShell chrome only', () => {
    const app = read('src/WorkspaceHostApp.tsx');
    const html = read('index.html');

    assert.match(app, /PlatformShell/);
    assert.match(app, /onSelectStudio/);
    assert.match(app, /retainWorkspace:\s*true/);
    assert.match(app, /navigate:\s*false/);
    assert.match(app, /workspace-shell-frame-/);
    assert.match(app, /withWorkspaceShellEmbed/);
    assert.doesNotMatch(app, /WorkspaceStudioNavigation/);
    assert.doesNotMatch(app, /workspace-shell__header/);
    assert.doesNotMatch(app, /Workspace · Partner Environment/);
    assert.doesNotMatch(app, /mode:\s*'launcher'/);
    assert.doesNotMatch(html, /Prozkoumat dům/);
    assert.doesNotMatch(html, /Reference House/);
  });

  it('defaults to Client Studio and keeps Office as a switchable view', () => {
    const app = read('src/WorkspaceHostApp.tsx');
    assert.match(app, /readActiveSurface\(\)[\s\S]*'client'/);
    assert.match(
      app,
      /studioFrameSrc\('office'\)|surface === 'office'|WORKSPACE_STUDIO_LABELS\[surface\]/,
    );
  });

  it('VR-05 / TASK-42 — Workspace entry does not require Partner Environment activation', () => {
    const main = read('src/main.tsx');

    assert.match(main, /if \(session !== null\)/);
    assert.match(main, /<WorkspaceHostApp \/>/);

    assert.doesNotMatch(main, /workspaceContext !== null/);
    assert.doesNotMatch(main, /Otevřít Partner Environment/);
    assert.doesNotMatch(
      main,
      /Workspace Host vyžaduje aktivní Partner Environment/,
    );

    assert.doesNotMatch(
      main,
      /location\.replace\(resolveCloudStudioHref\('office'\)\)/,
    );
  });

  it('TASK-42 — durable session opens Workspace without explicit Partner Environment activation', () => {
    const app = read('src/WorkspaceHostApp.tsx');

    // Authenticated Platform session is the Workspace activation boundary.
    assert.match(app, /if \(session === null\)/);
    assert.doesNotMatch(app, /if \(ctx === null \|\| session === null\)/);

    // Durable session scope wins; workspaceContext is compatibility fallback only.
    assert.match(
      app,
      /effectiveCompanyId = session\?\.companyId \?\? ctx\?\.companyId \?\? null/,
    );
    assert.match(
      app,
      /effectiveProjectId = session\?\.projectId \?\? ctx\?\.projectId \?\? null/,
    );

    // Project and House bootstrap are derived from the persisted session scope.
    assert.match(
      app,
      /candidates = \[session\?\.projectId, ctx\?\.projectId\]/,
    );
    assert.match(
      app,
      /session\?\.activeHouseId[\s\S]*isHouseInProject\(houseId, projectId\)/,
    );

    // Workspace rendering must not directly require ctx fields.
    assert.doesNotMatch(app, /ctx\.companyId/);
    assert.doesNotMatch(app, /ctx\.projectId/);
  });

  it('TASK-42B — authenticated Workspace auto-restores Partner Environment context', () => {
    const main = read('src/main.tsx');

    assert.match(
      main,
      /if \(session !== null\)[\s\S]*restoreAuthenticatedPartnerEnvironment\(\)[\s\S]*<WorkspaceHostApp \/>/,
    );
    assert.doesNotMatch(main, /workspaceContext !== null/);
    assert.doesNotMatch(main, /Otevřít Partner Environment/);
    assert.doesNotMatch(
      main,
      /Workspace Host vyžaduje aktivní Partner Environment/,
    );
  });

  it('PT-VR-06 — Workspace Shell hosts studios without redesign chrome', () => {
    const app = read('src/WorkspaceHostApp.tsx');
    const css = read('src/workspace-host.css');

    assert.doesNotMatch(app, /workspace-shell__rail/);
    assert.doesNotMatch(app, /workspace-shell__body/);
    assert.doesNotMatch(app, /conisWorkspaceHost/);
    assert.doesNotMatch(css, /workspace-shell__rail/);
    assert.doesNotMatch(css, /workspace-shell__header/);
    assert.match(app, /workspace-shell__main/);
    assert.match(app, /Embed\.mount/);
    assert.match(app, /mode:\s*'standalone'/);
  });

  it('TASK-42 — Studio scope updates do not reload the active iframe', () => {
    const app = read('src/WorkspaceHostApp.tsx');

    assert.match(app, /function WorkspaceStudioFrame/);
    assert.match(
      app,
      /const \[src\] = useState\(\(\) =>[\s\S]*studioFrameSrc\(surface, projectId, activeHouseId\)/,
    );
    assert.match(
      app,
      /currentHouseId[\s\S]*isHouseInProject\(currentHouseId, event\.data\.projectId\)[\s\S]*activeHouseId: nextActiveHouseId/,
    );
    assert.doesNotMatch(
      app,
      /<iframe[\s\S]*src=\{studioFrameSrc\(/,
    );
  });

  it('PT-BS-01 — Client surface unlocks document scrollport', () => {
    const css = read('src/workspace-host.css');
    assert.match(
      css,
      /data-workspace-surface='client'[\s\S]*overflow:\s*visible/,
    );
    assert.match(
      css,
      /\[data-workspace-surface='client'\][\s\S]*\.workspace-shell__view[\s\S]*position:\s*static/,
    );
  });

  it('CAP-VR33E — accepts canonical Builder Project changes in Workspace Host', () => {
    const app = read('src/WorkspaceHostApp.tsx');

    assert.match(app, /function boundSharedProjectId\(\)/);
    assert.match(app, /candidates = \[session\?\.projectId, ctx\?\.projectId\]/);
    assert.match(app, /isCanonicalProjectId\(id\)/);
    assert.doesNotMatch(app, /getSharedProject\(id\)/);
    assert.match(app, /addEventListener\('message', onWorkspaceChange\)/);
    assert.match(app, /isWorkspaceProjectChangeMessage\(event\.data\)/);
    assert.match(app, /isCanonicalProjectId\(event\.data\.projectId\)/);
    assert.match(
      app,
      /workspaceContext:\s*\{[\s\S]*projectId:\s*event\.data\.projectId/,
    );
    assert.match(app, /setSharedProjectId\(next\.projectId\)/);
    assert.match(app, /studioFrameSrc\([\s\S]*sharedProjectId,[\s\S]*sharedActiveHouseId/);
  });

  it('CAP-VR38c — scopes Builder House changes under the active Project', () => {
    const app = read('src/WorkspaceHostApp.tsx');

    assert.match(app, /isWorkspaceHouseChangeMessage\(event\.data\)/);
    assert.match(
      app,
      /houseId !== null[\s\S]*!isHouseInProject\(houseId, projectId\)/,
    );
    assert.match(app, /updateSession\(\{[\s\S]*activeHouseId: houseId/);
    assert.match(app, /setSharedActiveHouseId\(next\.activeHouseId\)/);
    assert.match(app, /url\.searchParams\.set\('houseId', activeHouseId\)/);
    assert.match(app, /sharedActiveHouseId \?\? sharedProjectId/);
  });

  it('CAP-VR38e — accepts scope changes from trusted embedded Studios', () => {
    const app = read('src/WorkspaceHostApp.tsx');

    assert.match(app, /WORKSPACE_SCOPE_WRITER_SURFACES/);
    assert.match(app, /'builder',[\s\S]*'manager',[\s\S]*'sales',[\s\S]*'client'/);
    assert.match(app, /scopeWriterOrigins\.has\(event\.origin\)/);
  });

  it('CAP-VR38d4 — accepts direct-mounted Client House changes', () => {
    const app = read('src/WorkspaceHostApp.tsx');

    assert.match(app, /onDirectClientHouseChange/);
    assert.match(app, /isWorkspaceHouseChangeMessage\(detail\)/);
    assert.match(app, /applyHouseChange\(detail\.houseId\)/);
    assert.match(app, /WORKSPACE_HOUSE_CHANGE_MESSAGE_TYPE/);
  });
});
