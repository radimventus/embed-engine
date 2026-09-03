import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const host = readFileSync(
  new URL('./WorkspaceHostApp.tsx', import.meta.url),
  'utf8',
);

describe('FIX65E Workspace shell / Journey contract', () => {
  it('START entry exposes authoritative partner Studio switcher', () => {
    assert.match(
      host,
      /const entryStudios =[\s\S]*?stage === 'start'[\s\S]*?partnerWorkspaceStudiosForRoles\(session\.user\.roles\)/,
    );

    assert.match(
      host,
      /availableStudioIds=\{entryStudios\}/,
    );

    assert.match(
      host,
      /onSelectStudio=\{\(studioId\) => \{[\s\S]*?handleEntryStudioSelect\(studioId\)/,
    );

    assert.match(
      host,
      /finishWelcomeJourney\(session\.user\.email\)/,
    );

    assert.match(
      host,
      /href\.searchParams\.set\('studio', studioId\)/,
    );
  });

  it('activation entry keeps Studio switcher disabled', () => {
    assert.match(
      host,
      /stage === 'start' && session !== null[\s\S]*?: \[\]/,
    );
  });

  it('partner Studio list is Client Sales Manager only and RBAC-filtered', () => {
    const start = host.indexOf(
      'const PARTNER_WORKSPACE_STUDIOS = [',
    );
    const end = host.indexOf(
      '] as const satisfies readonly WorkspaceStudioSurface[];',
      start,
    );

    assert.notEqual(start, -1);
    assert.notEqual(end, -1);

    const block = host.slice(start, end);

    assert.match(block, /'client'/);
    assert.match(block, /'sales'/);
    assert.match(block, /'manager'/);
    assert.doesNotMatch(block, /'builder'/);
    assert.doesNotMatch(block, /'office'/);

    assert.match(
      host,
      /workspaceStudiosForRoles\(roles\)/,
    );
  });

  it('Commercial Journey keeps PlatformShell chrome but hides Studio switcher', () => {
    assert.doesNotMatch(
      host,
      /workspace-partner-journey-standalone/,
    );

    assert.match(
      host,
      /availableStudioIds=\{[\s\S]*?partnerJourneyOpen[\s\S]*?\? \[\][\s\S]*?: workspaceStudiosForRoles/,
    );

    assert.match(
      host,
      /partnerJourneyOpen \? \([\s\S]*?workspace-partner-journey-shell-content[\s\S]*?PartnerCommercialJourneyFrame/,
    );

    const shellPos = host.indexOf('<PlatformShell');
    const journeyContentPos = host.indexOf(
      'workspace-partner-journey-shell-content',
    );

    assert.ok(shellPos >= 0);
    assert.ok(journeyContentPos > shellPos);
  });

  it('Commercial Journey hides persistent pilot CTA only', () => {
    assert.match(
      host,
      /\{!partnerJourneyOpen && \([\s\S]*?<SelectPilotProgramCta variant="bar" \/>/,
    );
  });

  it('Commercial Journey breadcrumb identifies Pilotní program', () => {
    assert.match(
      host,
      /partnerJourneyOpen[\s\S]*?\? 'Pilotní program'/,
    );
  });
});
