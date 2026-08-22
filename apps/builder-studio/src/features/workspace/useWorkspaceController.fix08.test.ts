import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));

test(
  'TASK-66VR-FIX-08 — Builder subscribes to authoritative registry revision',
  async () => {
    const source = await readFile(
      join(here, 'useWorkspaceController.ts'),
      'utf8',
    );

    assert.match(
      source,
      /registry:\s*platformRegistry\s*\}\s*=\s*usePlatformSession\(\)/,
      'Builder must consume SessionProvider registry as the canonical revision signal',
    );

    assert.match(
      source,
      /\[platformRegistry\]/,
      'recomposition effect must depend on the provider registry revision',
    );

    assert.match(
      source,
      /const recomposed = composeWorkspaceRegistry\(\{/,
      'Builder must recompose through the existing workspace registry projection',
    );

    assert.match(
      source,
      /folders:\s*current\.folders/,
    );

    assert.match(
      source,
      /houseFolderIds:\s*current\.houseFolderIds/,
    );

    assert.match(
      source,
      /houseLabels:\s*current\.houseLabels/,
    );

    assert.match(
      source,
      /houseMetadata:\s*current\.houseMetadata/,
    );

    assert.match(
      source,
      /housePackageRoots:\s*current\.housePackageRoots/,
    );

    assert.match(
      source,
      /activeFolderId:\s*current\.activeFolderId/,
    );

    assert.match(
      source,
      /activeProjectId:\s*current\.activeProjectId/,
    );

    assert.match(
      source,
      /recentProjectIds:\s*current\.recentProjectIds/,
    );

    assert.match(
      source,
      /lastOpenedProjectId:\s*current\.lastOpenedProjectId/,
    );

    assert.match(
      source,
      /registryRef\.current\s*=\s*recomposed/,
      'imperative Builder actions must immediately see the reconciled registry',
    );
  },
);

test(
  'TASK-66VR-FIX-08 — canonical recomposition is imported from Builder workspace registry only',
  async () => {
    const source = await readFile(
      join(here, 'useWorkspaceController.ts'),
      'utf8',
    );

    const platformImport =
      source.match(
        /import\s*\{[\s\S]*?\}\s*from '@embed-engine\/platform-access';/,
      )?.[0] ?? '';

    const localImport =
      source.match(
        /import\s*\{[\s\S]*?\}\s*from '\.\/workspaceRegistry';/,
      )?.[0] ?? '';

    assert.doesNotMatch(
      platformImport,
      /composeWorkspaceRegistry/,
    );

    assert.match(
      localImport,
      /composeWorkspaceRegistry/,
    );
  },
);
