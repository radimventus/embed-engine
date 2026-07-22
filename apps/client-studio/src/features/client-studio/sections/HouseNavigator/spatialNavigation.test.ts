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

describe('Spatial Navigation (CSCB-03)', () => {
  it('House Navigator mutates Runtime only via SelectRoom', () => {
    const files = [
      'FloorPlan.tsx',
      'FloorSelector.tsx',
      'RoomPanel.tsx',
      'useHouseNavigator.ts',
      'SpatialContextPanel.tsx',
    ];

    for (const name of files) {
      const source = stripComments(read(name));
      assert.equal(
        source.includes('ChangePriority'),
        false,
        `${name} must not dispatch priority semantics`,
      );
      assert.equal(
        source.includes('composeDecision'),
        false,
        `${name} must not compose Decision semantics`,
      );
      assert.equal(
        source.includes('presentation-assets'),
        false,
        `${name} must not import presentation catalog`,
      );
    }

    const navigator = stripComments(read('useHouseNavigator.ts'));
    assert.match(navigator, /SelectRoom/);
    assert.equal(navigator.includes('ChangeFloor'), false);
  });

  it('FloorPlan filters hotspots by selected floor and uses House Navigator', () => {
    const floorPlan = read('FloorPlan.tsx');
    assert.match(floorPlan, /useHouseNavigator/);
    assert.match(floorPlan, /selectedFloor/);
    assert.match(floorPlan, /floorKey\(room\.floor\) === selectedFloor/);
    assert.match(floorPlan, /onPointerEnter/);
  });

  it('Spatial Context Panel reads projected room facts only', () => {
    const panel = stripComments(read('SpatialContextPanel.tsx'));
    assert.match(panel, /activeRoom\.room/);
    assert.match(panel, /roomMedia/);
    assert.equal(panel.includes('dispatch'), false);
  });

  it('exposes the spatial deliverable surface area', () => {
    const names = readdirSync(here);
    assert.ok(names.includes('FloorSelector.tsx'));
    assert.ok(names.includes('FloorPlan.tsx'));
    assert.ok(names.includes('RoomPanel.tsx'));
    assert.ok(names.includes('SpatialContextPanel.tsx'));
  });
});
