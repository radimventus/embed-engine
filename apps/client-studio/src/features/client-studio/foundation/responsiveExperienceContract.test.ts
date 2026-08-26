import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));

function read(relative: string): string {
  return readFileSync(join(here, relative), 'utf8');
}

describe('Responsive Client Experience canonical contract', () => {
  it('defines bounded presentation bands', () => {
    const source = read('../../../../tailwind.config.js');
    assert.match(source, /tabletMin:\s*\{\s*min:\s*'768px',\s*max:\s*'1199px'/);
    assert.match(source, /tabletMax:\s*\{\s*min:\s*'1200px',\s*max:\s*'1439px'/);
  });

  it('enforces a 16:9 main display on mobile', () => {
    const source = read('../sections/MediaExplorer/MediaExplorer.tsx');
    assert.match(source, /data-responsive-main-media="true"/);
    assert.match(source, /mobile:aspect-video/);
  });

  it('places Tablet Min TOUR in two explicit columns', () => {
    const media = read('../sections/MediaExplorer/MediaExplorer.tsx');
    const room = read('../sections/HouseNavigator/RoomIndex.tsx');
    const floor = read('../sections/HouseNavigator/FloorPlanExplorer.tsx');

    assert.match(media, /tabletMin:col-start-1 tabletMin:row-start-1/);
    assert.match(room, /tabletMin:col-start-1 tabletMin:row-start-2/);
    assert.match(
      floor,
      /tabletMin:col-start-2 tabletMin:row-start-1 tabletMin:row-span-2/,
    );
  });

  it('uses canonical RoomSelect authority', () => {
    const source = read('../sections/HouseNavigator/RoomSelect.tsx');
    assert.match(source, /selectRoom\(event\.target\.value\)/);
  });

  it('uses 3 thumbnails on mobile portrait', () => {
    const source = read('../sections/MediaExplorer/ThumbnailRail.tsx');
    assert.match(source, /MOBILE_VISIBLE_SLOTS = 3/);
    assert.match(source, /MOBILE_VIEWPORT_MAX_PX = 767/);
  });

  it('forces Tablet Max TOUR over the overlapping legacy desktop band', () => {
    const source = read('../sections/SpatialTerminal/SpatialTerminal.tsx');
    assert.match(source, /tabletMax:!grid-cols-/);
  });

  it('fully stacks RACIO at Tablet Min and keeps Tablet Max fluid', () => {
    const source = read('../sections/AIAdvisor/ai-advisor-layout.ts');
    assert.match(source, /tabletMin:grid-cols-1/);
    assert.match(source, /tabletMin:col-start-1/);
    assert.match(source, /tabletMax:!grid-cols-/);
    assert.match(source, /tabletMax:!max-w-none/);
  });

  it('uses Priority 4 / 3 / 3', () => {
    const source = read('../sections/PriorityEngine/PriorityCards.tsx');
    assert.match(source, /grid-cols-4/);
    assert.match(source, /tabletMin:grid-cols-3/);
    assert.match(source, /tabletMax:grid-cols-4/);
    assert.match(source, /mobile:grid-cols-3/);
  });

  it('stacks RACIO at Tablet Min', () => {
    const source = read('../sections/AIAdvisor/ai-advisor-layout.ts');
    assert.match(source, /tabletMin:grid-cols-1/);
  });

  it('keeps FORM panels side-by-side on mobile', () => {
    const source = read('../sections/AuditLeadCapture/SituationSelect.tsx');
    assert.equal(source.includes('mobile:grid-cols-1'), false);
    assert.match(source, /grid grid-cols-2/);
  });
});
