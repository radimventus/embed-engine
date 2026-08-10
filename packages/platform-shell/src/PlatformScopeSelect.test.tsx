import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const source = readFileSync(
  fileURLToPath(new URL('./PlatformScopeSelect.tsx', import.meta.url)),
  'utf8',
);

describe('PlatformScopeSelect', () => {
  it('uses a deterministic custom listbox rather than a native picker', () => {
    assert.doesNotMatch(source, /<select\b/);
    assert.match(source, /role="combobox"/);
    assert.match(source, /role="listbox"/);
    assert.match(source, /role="option"/);
    assert.match(source, /aria-expanded=\{open\}/);
    assert.match(source, /aria-activedescendant=/);
    assert.match(source, /top: 'calc\(100% \+ 6px\)'/);
    assert.match(source, /width: '100%'/);
  });

  it('implements the canonical keyboard, selection, and dismissal contract', () => {
    assert.match(source, /event\.key === 'Enter'/);
    assert.match(source, /event\.key === ' '/);
    assert.match(source, /event\.key !== 'ArrowDown'/);
    assert.match(source, /event\.key !== 'ArrowUp'/);
    assert.match(source, /event\.key === 'Escape'/);
    assert.match(source, /document\.addEventListener\('mousedown', onPointerDown\)/);
    assert.match(source, /onChange\(option\.value\)/);
    assert.match(source, /triggerRef\.current\?\.focus\(\)/);
  });

  it('keeps the approved compact Manager scope-control dimensions', () => {
    assert.match(source, /height: 44/);
    assert.match(source, /borderRadius: 12/);
    assert.match(source, /var\(--platform-navy\)/);
    assert.match(source, /var\(--platform-blue\)/);
  });
});
