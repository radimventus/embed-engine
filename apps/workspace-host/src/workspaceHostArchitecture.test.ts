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
  it('TASK-81 — keeps persistent Pilot Program CTA above Workspace content', () => {
    const app = read('src/WorkspaceHostApp.tsx');
    const cta = app.indexOf('<SelectPilotProgramCta variant="bar" />');
    const main = app.indexOf(
      '<main className="workspace-shell__main" data-testid="workspace-shell-main">',
    );

    assert.ok(cta >= 0);
    assert.ok(main > cta);
  });


  it('TASK-80 — explicit invite enters Platform Access before session restore', () => {
    const main = read('src/main.tsx');
    const inviteGate = main.indexOf('if (hasExplicitInviteRoute())');

    const inviteAccess = main.indexOf(
      '<PlatformAccessRoot',
      inviteGate,
    );

    const entryRenderer = main.indexOf(
      'renderWorkspaceEntry=',
      inviteAccess,
    );

    const entryShell = main.indexOf(
      '<WorkspaceHostEntryShell',
      entryRenderer,
    );

    const serverRestore = main.indexOf(
      'createPlatformAccessAuthClient().restoreSession()',
    );

    assert.ok(inviteGate >= 0);
    assert.ok(inviteAccess > inviteGate);
    assert.ok(entryRenderer > inviteAccess);
    assert.ok(entryShell > entryRenderer);
    assert.ok(serverRestore > entryShell);

    assert.match(
      main,
      /PlatformAccessRoot[\s\S]*renderWorkspaceEntry[\s\S]*WorkspaceHostEntryShell/,
    );

  });

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
    assert.match(
      app,
      /initialContextRef\.current\?\.activeStudio \?\? 'client'/,
    );
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
      /sessionProjectId[\s\S]*isCanonicalProjectId\(sessionProjectId\)[\s\S]*return sessionProjectId/,
    );
    assert.match(
      app,
      /contextProjectId[\s\S]*isCanonicalProjectId\(contextProjectId\)[\s\S]*return contextProjectId/,
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

  it('TASK-42AC — cold partner Workspace restores canonical scope without admin-only ENTER', () => {
    const main = read('src/main.tsx');

    assert.match(
      main,
      /const isConisAdmin = session\.user\.roles\.includes\('conis-admin'\)/,
    );

    assert.match(
      main,
      /restoreAuthenticatedPartnerEnvironment\(\)/,
    );

    assert.match(
      main,
      /if \(isConisAdmin && requiresAuthoritativePartnerEnvironment\)/,
    );

    assert.match(
      main,
      /if \(isConisAdmin && requiresAuthoritativePartnerEnvironment\)[\s\S]*enterOperatorPartnerEnvironmentAuthoritatively\(\{/,
    );

    const partnerRestoreIndex =
      main.indexOf('restoreAuthenticatedPartnerEnvironment();');
    const adminGuardIndex =
      main.indexOf(
        'if (isConisAdmin && requiresAuthoritativePartnerEnvironment)',
      );
    const renderIndex =
      main.indexOf('<WorkspaceHostApp />', adminGuardIndex);

    assert.ok(partnerRestoreIndex >= 0);
    assert.ok(adminGuardIndex > partnerRestoreIndex);
    assert.ok(renderIndex > adminGuardIndex);
  });


  it('TASK-42M — complete authenticated Workspace does not require authoritative cold reconciliation', () => {
    const main = read('src/main.tsx');

    assert.match(
      main,
      /const requiresAuthoritativePartnerEnvironment =[\s\S]*session\.workspaceContext === null[\s\S]*session\.activeHouseId === null/,
    );

    assert.match(
      main,
      /if \(isConisAdmin && requiresAuthoritativePartnerEnvironment\) \{/,
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

  it('preserves the Workspace-only initial Client landing contract', () => {
    const app = read('src/WorkspaceHostApp.tsx');
    assert.match(
      app,
      /data-client-initial-landing-offset="20"/,
    );
  });

  it('TASK-42F — Client Studio mount survives Workspace scope effect cleanup', () => {
    const app = read('src/WorkspaceHostApp.tsx');

    const effectStart = app.indexOf(
      "  useEffect(() => {\n    if (surface !== 'client') {",
    );
    assert.notEqual(effectStart, -1);

    const effectEnd = app.indexOf(
      "  }, [surface, sharedActiveHouseId, sharedProjectId]);",
      effectStart,
    );
    assert.notEqual(effectEnd, -1);

    const mountEffect = app.slice(
      effectStart,
      effectEnd +
        "  }, [surface, sharedActiveHouseId, sharedProjectId]);".length,
    );

    assert.match(
      mountEffect,
      /Embed\.mount\(\{/,
    );

    assert.doesNotMatch(
      mountEffect,
      /return \(\) => \{[\s\S]*?Embed\.unmount/,
    );

    assert.match(
      app,
      /clientFinalDisposeTimerRef = useRef<number \| null>\(null\)/,
    );

    assert.match(
      app,
      /window\.clearTimeout\(clientFinalDisposeTimerRef\.current\)/,
    );

    assert.match(
      app,
      /clientFinalDisposeTimerRef\.current = window\.setTimeout\(\(\) => \{[\s\S]*?Embed\.unmount/,
    );

    assert.doesNotMatch(
      app,
      /useEffect\(\(\) => \{\s*return \(\) => \{\s*if \(clientMountedRef\.current\) \{\s*Embed\.unmount/,
    );
  });

  it('TASK-42I — cold-session trace is opt-in and observes scope reconciliation', () => {
    const app = read('src/WorkspaceHostApp.tsx');

    assert.match(app, /get\('task42trace'\) !== '1'/);
    assert.match(app, /\[TASK-42-TRACE\]/);

    assert.match(app, /workspace-bootstrap/);

    assert.match(app, /authoritative-mutation:start/);
    assert.match(app, /authoritative-mutation:response/);
    assert.match(app, /authoritative-mutation:applied/);

    assert.match(app, /house-change:received/);
    assert.match(app, /house-change:local-session-updated/);
    assert.match(app, /house-change:persistence-fail/);
    assert.match(app, /project-change:persistence-fail/);

    assert.match(app, /project-change:received/);

    assert.match(app, /surface-select:start/);
    assert.match(app, /surface-select:applied/);
  });

  it('TASK-42P — Studio Switcher stays above sibling header hit-target layers', () => {
    const css = read('../../packages/platform-shell/src/platform-shell.css');

    assert.match(
      css,
      /\.platform-header__cluster\s*\{[\s\S]*?z-index:\s*2;/,
    );

    assert.match(
      css,
      /\.platform-header__actions\s*\{[\s\S]*?z-index:\s*2;/,
    );

    assert.match(
      css,
      /\.platform-role-switcher\s*\{[\s\S]*?z-index:\s*3;/,
    );
  });

  it('TASK-42AJ — Workspace consumes one normalized cold session snapshot before Client mount', () => {
    const main = read('src/main.tsx');
    const app = read('src/WorkspaceHostApp.tsx');

    const restore = main.indexOf(
      'restoreAuthenticatedPartnerEnvironment()',
    );
    const render = main.indexOf('<WorkspaceHostApp />', restore);

    assert.ok(restore >= 0);
    assert.ok(render > restore);

    assert.match(app, /initialSessionRef = useRef\(loadPlatformSession\(\)\)/);
    assert.match(
      app,
      /initialContextRef = useRef\(getSharedWorkspaceContext\(\)\)/,
    );
    assert.match(
      app,
      /session\?\.activeHouseId[\s\S]*context\?\.activeHouseId/,
    );
  });

  it('TASK-42AC — visible Studio switch is not blocked by authoritative persistence', () => {
    const app = read('src/WorkspaceHostApp.tsx');

    const selectStart = app.indexOf(
      'const selectSurface = useCallback',
    );
    const selectEnd = app.indexOf(
      'useEffect(() => {',
      selectStart,
    );

    assert.ok(selectStart >= 0);
    assert.ok(selectEnd > selectStart);

    const select = app.slice(selectStart, selectEnd);

    const localSwitchIndex =
      select.indexOf('switchOperatorPartnerStudio(next');
    const setSurfaceIndex =
      select.indexOf('setSurface(next)');
    const authoritativeIndex =
      select.indexOf('void enqueueAuthoritativeMutation({');

    assert.ok(localSwitchIndex >= 0);
    assert.ok(setSurfaceIndex > localSwitchIndex);
    assert.ok(authoritativeIndex > setSurfaceIndex);

    assert.doesNotMatch(
      select,
      /await enqueueAuthoritativeMutation\(\{/,
    );
  });

  it('TASK-42N — Studio switch trace exposes local switch result and resulting session', () => {
    const app = read('src/WorkspaceHostApp.tsx');

    assert.match(app, /surface-select:local-result/);
    assert.match(app, /surface-select:local-session/);

    const resultTrace = app.indexOf('surface-select:local-result');
    const resultGuard = app.indexOf('if (!result.ok) return;', resultTrace);
    const sessionTrace = app.indexOf('surface-select:local-session', resultGuard);
    const applied = app.indexOf('surface-select:applied', sessionTrace);
    const mutation = app.indexOf(
      'void enqueueAuthoritativeMutation',
      applied,
    );

    assert.notEqual(resultTrace, -1);
    assert.notEqual(resultGuard, -1);
    assert.notEqual(sessionTrace, -1);
    assert.notEqual(applied, -1);
    assert.notEqual(mutation, -1);

    assert.ok(resultTrace < resultGuard);
    assert.ok(resultGuard < sessionTrace);
    assert.ok(sessionTrace < applied);
    assert.ok(applied < mutation);
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
      /currentHouseId[\s\S]*isHouseInProject\(currentHouseId, requestedProjectId\)[\s\S]*activeHouseId: nextActiveHouseId/,
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

    assert.match(
      app,
      /initialSessionRef = useRef\(loadPlatformSession\(\)\)/,
    );
    assert.match(
      app,
      /initialContextRef = useRef\(getSharedWorkspaceContext\(\)\)/,
    );
    assert.match(
      app,
      /sessionProjectId[\s\S]*isCanonicalProjectId\(sessionProjectId\)[\s\S]*return sessionProjectId/,
    );
    assert.match(
      app,
      /contextProjectId[\s\S]*isCanonicalProjectId\(contextProjectId\)[\s\S]*return contextProjectId/,
    );
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
    assert.match(app, /applyHouseChange\(detail\.houseId,\s*'direct-client'\)/);
    assert.match(app, /WORKSPACE_HOUSE_CHANGE_MESSAGE_TYPE/);
  });
});


describe('TASK-81-83 partner journey cutover', () => {
  it('hosts Commercial Journey inside Workspace without making it a Studio', () => {
    const app = read('src/WorkspaceHostApp.tsx');

    assert.match(app, /partnerJourneyOpen/);
    assert.match(app, /PartnerCommercialJourneyFrame/);
    assert.match(app, /partnerJourney=1|partnerJourney', '1'/);
    assert.match(app, /SelectPilotProgramCta/);
    assert.doesNotMatch(app, /setSurface\(['"]commercial-journey['"]\)/);
  });

  it('keeps Studio switching separate from temporary Commercial Journey', () => {
    const app = read('src/WorkspaceHostApp.tsx');

    assert.match(app, /setPartnerJourneyOpen\(false\)/);
    assert.match(app, /url\.searchParams\.delete\(['"]journey['"]\)/);
    assert.match(app, /if\s*\(partnerJourneyOpen\)\s*\{[\s\S]*?workspace-partner-journey-standalone[\s\S]*?<PartnerCommercialJourneyFrame/);
  });
});
