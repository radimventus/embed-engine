import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));

function read(name: string): string {
  return readFileSync(join(here, name), 'utf8');
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('Property Explorer (CSCB-02 / SR-003)', () => {
  it('reads Runtime Context only — no Object Package or dispatch', () => {
    const files = readdirSync(here).filter(
      (name) =>
        (name.endsWith('.tsx') || name.endsWith('.ts')) &&
        !name.endsWith('.test.ts'),
    );

    for (const name of files) {
      const source = stripComments(read(name));
      assert.equal(
        source.includes('@embed-engine/object-house'),
        false,
        `${name} must not import Object Package`,
      );
      assert.equal(
        source.includes('dispatch('),
        false,
        `${name} must not dispatch Runtime commands`,
      );
      assert.equal(
        source.includes('composeDecision'),
        false,
        `${name} must not compose semantics`,
      );
    }
  });

  it('exposes Object Summary, Key Metrics, Feature Groups and section nav', () => {
    const names = readdirSync(here);
    assert.ok(names.includes('ObjectSummary.tsx'));
    assert.ok(names.includes('KeyMetrics.tsx'));
    assert.ok(names.includes('FeatureGroups.tsx'));
    assert.ok(names.includes('PropertyExplorerNav.tsx'));
    assert.ok(names.includes('PropertyExplorer.tsx'));

    const explorer = read('PropertyExplorer.tsx');
    assert.match(explorer, /ObjectSummary/);
    assert.match(explorer, /KeyMetrics/);
    assert.match(explorer, /PropertyExplorerNav/);
    assert.match(explorer, /FeatureGroups/);
    assert.match(explorer, /useState/);
  });

  it('binds identity and metrics to Runtime object / house projection', () => {
    const summary = stripComments(read('ObjectSummary.tsx'));
    const metrics = stripComments(read('KeyMetrics.tsx'));
    const groups = stripComments(read('usePropertyFeatureGroups.ts'));

    assert.match(summary, /context\.object/);
    assert.match(summary, /experience\.house/);
    assert.match(metrics, /house\.price/);
    assert.match(metrics, /object\.usableArea/);
    assert.equal(metrics.includes('/ house.'), false);
    assert.match(groups, /Dispozice/);
    assert.match(groups, /Konstrukce/);
    assert.match(groups, /Pozemek/);
    assert.match(groups, /Energetika/);
    assert.match(groups, /Lokalita/);
  });
});
