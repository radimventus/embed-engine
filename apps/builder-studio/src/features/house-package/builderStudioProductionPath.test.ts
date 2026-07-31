/**
 * CAP-BLD-07 — production path must not import legacy mock/stub authoring.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = join(here, '../..');

const FORBIDDEN = [
  'useBuilderStudioSession',
  'MOCK_PROJECTS',
  'createStubRuntimeAdapter',
  'createRuntimePreviewService',
  'createPublishService',
  'mock-data',
  'WorkspaceCanvas',
  'PublishPanel',
] as const;

describe('BuilderStudioApp production imports (CAP-BLD-07)', () => {
  it('does not depend on legacy mock/stub authoring modules', () => {
    const source = readFileSync(
      join(appRoot, 'features/builder-studio/BuilderStudioApp.tsx'),
      'utf8',
    );
    for (const token of FORBIDDEN) {
      assert.equal(
        source.includes(token),
        false,
        `BuilderStudioApp must not reference legacy token: ${token}`,
      );
    }
    assert.match(source, /useHousePackageEditController/);
    assert.match(source, /HousePackageRuntimePreview/);
  });
});
