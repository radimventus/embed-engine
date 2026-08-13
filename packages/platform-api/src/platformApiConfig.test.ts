import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { platformApiAllowedOrigins } from './platformApiConfig.ts';

describe('Platform API local CORS origins', () => {
  it('allows the Office development origin on port 4177', () => {
    assert.equal(
      platformApiAllowedOrigins().has('http://127.0.0.1:4177'),
      true,
    );
  });
});
