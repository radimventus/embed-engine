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

  it('allows only approved same-site HTTPS Studio development origins', () => {
    const origins = platformApiAllowedOrigins();

    assert.equal(origins.has('https://conis.cz:4177'), true);
    assert.equal(origins.has('https://conis.cz:4175'), true);
    assert.equal(origins.has('https://conis.cz:4179'), true);
    assert.equal(origins.has('https://conis.cz:4173'), false);
  });
});
