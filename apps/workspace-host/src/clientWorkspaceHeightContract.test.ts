import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

const root = process.cwd();

function source(path: string): string {
  return readFileSync(join(root, path), 'utf8');
}

describe('TASK 74 FIX-02 — Workspace Client full-height contract', () => {
  it('unlocks every Client Workspace wrapper from viewport height', () => {
    const css = source('src/workspace-host.css');

    assert.match(
      css,
      /workspace-shell\[data-workspace-surface='client'\][\s\S]*?\[data-platform-shell\][\s\S]*?height:\s*auto !important/,
    );

    assert.match(
      css,
      /workspace-shell\[data-workspace-surface='client'\][\s\S]*?\.platform-body[\s\S]*?height:\s*auto !important/,
    );

    assert.match(
      css,
      /workspace-shell\[data-workspace-surface='client'\][\s\S]*?\.workspace-shell__main[\s\S]*?height:\s*auto !important/,
    );

    assert.match(
      css,
      /workspace-shell\[data-workspace-surface='client'\][\s\S]*?\.workspace-shell__view[\s\S]*?position:\s*static !important/,
    );
  });

  it('lets the Workspace Client desktop sidebar span the full journey', () => {
    const css = source('src/workspace-host.css');

    assert.match(
      css,
      /workspace-shell\[data-workspace-surface='client'\][\s\S]*?\[data-studio-shell='sidebar-slot'\][\s\S]*?position:\s*relative !important/,
    );

    assert.match(
      css,
      /workspace-shell\[data-workspace-surface='client'\][\s\S]*?\[data-studio-shell='sidebar-slot'\][\s\S]*?height:\s*auto !important/,
    );

    assert.match(
      css,
      /workspace-shell\[data-workspace-surface='client'\][\s\S]*?\[data-studio-shell='sidebar'\][\s\S]*?height:\s*100% !important/,
    );
  });

  it('does not touch Embed standalone presentation', () => {
    const css = source('src/workspace-host.css');

    assert.doesNotMatch(
      css,
      /(^|\n)\s*body\s*\{[\s\S]*?padding-bottom:\s*max\(300px/,
    );
  });
});
