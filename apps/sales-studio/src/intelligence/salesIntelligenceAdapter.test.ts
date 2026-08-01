import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  analyzeViaSalesAdapter,
  createEmptyIntelligenceContext,
} from '@embed-engine/intelligence';

const here = dirname(fileURLToPath(import.meta.url));

describe('salesIntelligenceAdapter (EPIC-BX-12)', () => {
  it('exposes Sales adapter over shared Intelligence Core', () => {
    const source = readFileSync(
      join(here, 'salesIntelligenceAdapter.ts'),
      'utf8',
    );
    assert.match(source, /createSalesIntelligenceAdapter/);
    assert.match(source, /@embed-engine\/intelligence/);
  });

  it('runs the shared engine', () => {
    const analysis = analyzeViaSalesAdapter(createEmptyIntelligenceContext());
    assert.equal(analysis.coaches.length, 4);
  });
});
