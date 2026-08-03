import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  clampFloorPlanPan,
  clampFloorPlanScale,
  FLOOR_PLAN_IDENTITY_TRANSFORM,
  FLOOR_PLAN_MAX_SCALE,
  isFloorPlanTap,
} from './floorPlanViewportMath';

const here = dirname(fileURLToPath(import.meta.url));

function read(name: string): string {
  return readFileSync(join(here, name), 'utf8');
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('Responsive House Navigator (RCS-03)', () => {
  it('clamps floor-plan zoom/pan without inventing Runtime commands', () => {
    assert.equal(clampFloorPlanScale(0.2), 1);
    assert.equal(clampFloorPlanScale(9), FLOOR_PLAN_MAX_SCALE);
    assert.deepEqual(
      clampFloorPlanPan({ scale: 1, x: 40, y: -20 }, 320, 240),
      FLOOR_PLAN_IDENTITY_TRANSFORM,
    );
    const panned = clampFloorPlanPan({ scale: 2, x: 999, y: -999 }, 200, 100);
    assert.equal(panned.scale, 2);
    assert.equal(panned.x, 100);
    assert.equal(panned.y, -50);
    assert.equal(isFloorPlanTap({ x: 0, y: 0 }, { x: 3, y: 4 }), true);
    assert.equal(isFloorPlanTap({ x: 0, y: 0 }, { x: 40, y: 0 }), false);
  });

  it('wires pinch/pan viewport while keeping SelectRoom hotspot path', () => {
    const floorPlan = read('FloorPlan.tsx');
    const viewport = read('FloorPlanViewport.tsx');
    const navigator = stripComments(read('useHouseNavigator.ts'));
    const roomIndex = read('RoomIndex.tsx');
    const roomPanel = read('RoomPanel.tsx');
    const segmented = read('TourSegmentedControl.tsx');
    const shell = read('../SpatialTerminal/SpatialTerminal.tsx');

    assert.match(floorPlan, /FloorPlanViewport/);
    assert.match(floorPlan, /onPointerEnter/);
    assert.match(floorPlan, /selectRoom/);
    assert.match(viewport, /data-floorplan-viewport/);
    assert.match(viewport, /touch-none/);
    assert.match(viewport, /floorplan-reset-zoom/);
    assert.match(navigator, /SelectRoom/);
    assert.equal(navigator.includes('ChangeFloor'), false);
    assert.match(roomIndex, /SpatialContextPanel/);
    assert.match(roomIndex, /desktop:hidden/);
    assert.match(roomPanel, /min-h-11/);
    assert.match(segmented, /min-h-11/);
    assert.match(shell, /overflow-x-hidden/);
    assert.match(shell, /desktop:grid-cols-\[var\(--spatial-terminal-cols\)\]/);
  });
});
