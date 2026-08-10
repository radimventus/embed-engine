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
    assert.match(source, /openPreview/);
  });

  it('PT-BS-01 — external projectId bind is one-shot so House Navigator can switch', () => {
    const source = readFileSync(
      join(appRoot, 'features/builder-studio/BuilderStudioApp.tsx'),
      'utf8',
    );
    assert.match(source, /externalHouseBindDoneRef/);
    assert.match(source, /openHouseStable/);
    assert.match(source, /requestOpenProject\(houseId/);
  });

  it('opens Náhled as a dedicated window entry (PR-024)', () => {
    const mainSource = readFileSync(join(appRoot, 'main.tsx'), 'utf8');
    assert.match(mainSource, /isBuilderNahledWindow/);
    assert.match(mainSource, /HousePackageRuntimePreview/);

    const openSource = readFileSync(
      join(appRoot, 'features/house-package/mountHousePackageRuntimePreview.ts'),
      'utf8',
    );
    assert.match(openSource, /openHousePackageRuntimePreviewWindow/);
    assert.match(openSource, /BUILDER_NAHLED_QUERY/);
  });
});
