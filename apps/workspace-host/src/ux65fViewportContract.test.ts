import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const css = readFileSync(
  new URL('./workspace-host.css', import.meta.url),
  'utf8',
);

describe('UX65F Workspace vertical reachability', () => {
  it('keeps Workspace main vertically reachable', () => {
    assert.match(
      css,
      /\.workspace-shell__main[\s\S]*overflow-y: auto/,
    );
    assert.match(
      css,
      /\.workspace-shell__main[\s\S]*padding-bottom: max\(72px/,
    );
  });

  it('adds larger bottom reserve to activation and START entry stages', () => {
    assert.match(
      css,
      /\.workspace-shell\[data-workspace-entry-stage\] main[\s\S]*padding-bottom: max\(96px/,
    );
  });
});
