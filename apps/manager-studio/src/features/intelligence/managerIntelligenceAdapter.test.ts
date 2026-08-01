import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  analyzeViaManagerAdapter,
  createEmptyIntelligenceContext,
} from '@embed-engine/intelligence';

const here = dirname(fileURLToPath(import.meta.url));

describe('managerIntelligenceAdapter (EPIC-BX-12)', () => {
  it('exposes Manager adapter over shared Intelligence Core', () => {
    const source = readFileSync(
      join(here, 'managerIntelligenceAdapter.ts'),
      'utf8',
    );
    assert.match(source, /createManagerIntelligenceAdapter/);
    assert.match(source, /@embed-engine\/intelligence/);
  });

  it('runs the shared engine', () => {
    const analysis = analyzeViaManagerAdapter(createEmptyIntelligenceContext());
    assert.equal(analysis.coaches.length, 4);
  });
});
