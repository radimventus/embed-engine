import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));

describe('Media Hero canonical persistence', () => {
  it('passes the updated House Package snapshot to canonical save', () => {
    const mediaStudio = readFileSync(join(here, 'MediaStudioView.tsx'), 'utf8');
    const canvas = readFileSync(
      join(here, '../workspace/BuilderClickModelCanvas.tsx'),
      'utf8',
    );

    assert.match(mediaStudio, /const next = session\.setHeroRelativePath/);
    assert.match(mediaStudio, /onPersist\?\.\(next\)/);
    assert.match(canvas, /onPersist=\{onSave\}/);
  });
});
