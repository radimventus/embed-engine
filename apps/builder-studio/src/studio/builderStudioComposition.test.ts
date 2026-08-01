import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { getBuilderCapabilityHost } from './builderStudioComposition';

const here = dirname(fileURLToPath(import.meta.url));

describe('builderStudioComposition (EPIC-BX-13)', () => {
  it('registers Builder capabilities from the shared registry', () => {
    const host = getBuilderCapabilityHost();
    for (const id of [
      'media',
      'experience',
      'knowledge',
      'ai',
      'release',
    ] as const) {
      assert.ok(host.isDeclared(id), `missing ${id}`);
      assert.equal(host.health(id)?.active, true);
    }
  });

  it('Builder app wires Capability Host into Platform Shell', () => {
    const app = readFileSync(
      join(here, '../features/builder-studio/BuilderStudioApp.tsx'),
      'utf8',
    );
    assert.match(app, /capabilityHost/);
    assert.match(app, /CapabilityInspector/);
    assert.match(app, /getBuilderCapabilityHost/);
  });
});
