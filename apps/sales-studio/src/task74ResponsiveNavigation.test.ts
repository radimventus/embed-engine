import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

const root = process.cwd();

function source(path: string): string {
  return readFileSync(join(root, path), 'utf8');
}

describe('TASK 74 — Sales responsive navigation', () => {
  it('renders House + Client without a Project selector', () => {
    const app = source('src/SalesStudioApp.tsx');
    const scope = source('src/SalesWorkspaceScope.tsx');

    assert.match(scope, /activeProjectId/);
    assert.match(scope, /listWorkspaceHouses\(activeProjectId\)/);
    assert.match(scope, />\s*Dům\s*</);
    assert.doesNotMatch(scope, />\s*Projekt\s*</);
    assert.doesNotMatch(scope, /createWorkspaceProjectChangeMessage/);

    const house = app.indexOf('<SalesWorkspaceScope');
    const client = app.indexOf('sales-desk__client-select-wrap');
    const search = app.indexOf('sales-desk__search');

    assert.ok(house >= 0);
    assert.ok(client > house);
    assert.ok(search > client);
  });

  it('stacks Sales content and preserves one desk scroll owner', () => {
    const css = source('src/index.css');

    assert.match(css, /@media \(max-width: 1100px\)/);
    assert.match(
      css,
      /\.sales-desk__grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)/,
    );
    assert.match(css, /@media \(max-width: 767px\)/);
    assert.match(css, /overflow-x:\s*hidden/);
    assert.match(css, /padding-bottom:\s*max\(48px/);
  });
});
