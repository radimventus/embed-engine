import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));

describe('BuilderClickModelCanvas Hero authoring', () => {
  it('renders the canonical House Hero editor and save action in Media Hero', () => {
    const source = readFileSync(
      join(here, 'BuilderClickModelCanvas.tsx'),
      'utf8',
    );

    assert.match(source, /item\.area === 'hero'/);
    assert.match(source, /HouseHeroCopyEditor/);
    assert.match(source, /session\.setHeroCopy/);
    assert.match(source, /onClick=\{onSave\}/);
    assert.match(source, /Uložit Hero text/);
  });
});
