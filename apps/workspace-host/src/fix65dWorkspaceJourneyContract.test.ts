import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const host = readFileSync(
  new URL('./WorkspaceHostApp.tsx', import.meta.url),
  'utf8',
);

test(
  'FIX65D partner Workspace exposes Client Sales Manager switcher contract',
  () => {
    assert.match(
      host,
      /const PARTNER_WORKSPACE_STUDIOS = \[\s*'client',\s*'sales',\s*'manager',/s,
    );

    assert.match(
      host,
      /availableStudioIds=\{partnerWorkspaceStudiosForRoles\(session\.user\.roles\)\}/,
    );

    assert.match(
      host,
      /workspaceStudiosForRoles\(roles\)/,
    );

    assert.doesNotMatch(
      host,
      /authorized\.add\(/,
    );

    const partnerStudiosStart = host.indexOf(
      'const PARTNER_WORKSPACE_STUDIOS = [',
    );
    const partnerStudiosEnd = host.indexOf(
      '] as const satisfies readonly WorkspaceStudioSurface[];',
      partnerStudiosStart,
    );

    assert.ok(partnerStudiosStart >= 0);
    assert.ok(partnerStudiosEnd > partnerStudiosStart);

    const partnerStudios = host.slice(
      partnerStudiosStart,
      partnerStudiosEnd,
    );

    assert.doesNotMatch(
      partnerStudios,
      /'office'/,
    );

    assert.doesNotMatch(
      partnerStudios,
      /'builder'/,
    );
  },
);

test(
  'FIX65D Commercial Journey exits before PlatformShell',
  () => {
    const journeyReturn = host.indexOf(
      'if (partnerJourneyOpen) {',
    );
    const shellReturn = host.indexOf(
      '<PlatformShell',
      journeyReturn,
    );

    assert.ok(journeyReturn >= 0);
    assert.ok(shellReturn > journeyReturn);

    const between = host.slice(
      journeyReturn,
      shellReturn,
    );

    assert.match(
      between,
      /workspace-partner-journey-standalone/,
    );

    assert.match(
      between,
      /<PartnerCommercialJourneyFrame/,
    );
  },
);

test(
  'FIX65D PlatformShell branch renders Studios only',
  () => {
    const shellStart = host.lastIndexOf(
      '<PlatformShell',
    );

    assert.ok(shellStart >= 0);

    const shell = host.slice(shellStart);

    assert.doesNotMatch(
      shell,
      /PartnerCommercialJourneyFrame/,
    );

    assert.match(
      shell,
      /WorkspaceStudioFrame/,
    );

    assert.match(
      shell,
      /workspace-host-client-root/,
    );
  },
);
