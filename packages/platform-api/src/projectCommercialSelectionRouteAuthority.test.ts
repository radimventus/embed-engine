import assert from 'node:assert/strict';
import { test } from 'node:test';

import { readFile } from 'node:fs/promises';

test(
  'commercial selection route is authenticated POST authority',
  async () => {
    const source = await readFile(
      new URL('./index.ts', import.meta.url),
      'utf8',
    );

    assert.match(
      source,
      /commercial-selection/,
    );

    assert.match(
      source,
      /request\.method\s*===\s*["']POST["']/,
    );

    assert.match(
      source,
      /PARTNER_SESSION_COOKIE/,
    );

    assert.match(
      source,
      /projectConfigs\s*\.\s*selectCommercialProgram\s*\(/s,
    );

    assert.match(
      source,
      /applyDurableProjectConfigs\s*\(\s*await projectConfigs\.list\(\)\s*\)/s,
    );
  },
);
