import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
  new URL('./clientCanonicalBind.ts', import.meta.url),
  'utf8',
);

test('public Embed accepts URL Project scope only when no stronger session scope exists', () => {
  assert.match(
    source,
    /candidates\.sessionProjectId \?\? candidates\.urlProjectId/,
  );
  assert.doesNotMatch(
    source,
    /candidates\.urlProjectId \?\? candidates\.sessionProjectId/,
  );
});
