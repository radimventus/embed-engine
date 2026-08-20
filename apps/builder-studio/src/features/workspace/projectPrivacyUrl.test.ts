import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseProjectPrivacyUrlInput } from './projectPrivacyUrl';

describe('Builder Project privacy URL validation', () => {
  it('allows empty values', () => {
    assert.deepEqual(parseProjectPrivacyUrlInput(''), {
      ok: true,
      privacyUrl: null,
    });
    assert.deepEqual(parseProjectPrivacyUrlInput('   '), {
      ok: true,
      privacyUrl: null,
    });
  });

  it('accepts absolute HTTPS URLs', () => {
    assert.deepEqual(parseProjectPrivacyUrlInput('https://dse.example/privacy'), {
      ok: true,
      privacyUrl: 'https://dse.example/privacy',
    });
  });

  it('rejects HTTP, relative, and malformed values', () => {
    assert.equal(parseProjectPrivacyUrlInput('http://dse.example/privacy').ok, false);
    assert.equal(parseProjectPrivacyUrlInput('/privacy').ok, false);
    assert.equal(parseProjectPrivacyUrlInput('not a url').ok, false);
    assert.equal(parseProjectPrivacyUrlInput('javascript:alert(1)').ok, false);
    assert.equal(parseProjectPrivacyUrlInput('data:text/html,hi').ok, false);
  });
});
