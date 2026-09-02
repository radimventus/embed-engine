import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

test(
  'Office boot hydrates durable commercial Project config before refreshed projection',
  async () => {
    const config = await readFile(
      path.join(
        process.cwd(),
        'src/office/commercialProjectConfig.ts',
      ),
      'utf8',
    );

    const context = await readFile(
      path.join(
        process.cwd(),
        'src/office/PilotWorkspaceContext.tsx',
      ),
      'utf8',
    );

    assert.match(
      config,
      /export async function hydrateCommercialProjectConfig\(/,
    );

    assert.match(
      config,
      /const config = await fetchProjectConfig\(projectId\);/,
    );

    assert.match(
      config,
      /applyDurableProjectConfig\(\{/,
    );

    assert.match(
      context,
      /void hydrateCommercialProjectConfig\(activeCaseId\)/,
    );

    const hydrate =
      context.indexOf(
        'void hydrateCommercialProjectConfig(activeCaseId)',
      );

    const refresh =
      context.indexOf(
        'setCaseRevision((current) => current + 1);',
        hydrate,
      );

    assert.ok(hydrate >= 0);
    assert.ok(refresh > hydrate);
  },
);
