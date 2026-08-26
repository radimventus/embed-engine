import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(process.cwd(), 'src/features/client-studio');

const read = (file: string) =>
  fs.readFileSync(path.join(root, file), 'utf8');

test('mobile TOUR keeps compact media and exactly three thumbnails', () => {
  const media = read('sections/MediaExplorer/MediaExplorer.tsx');
  const rail = read('sections/MediaExplorer/ThumbnailRail.tsx');

  assert.match(media, /mobile:aspect-video/);
  assert.match(rail, /MOBILE_VISIBLE_SLOTS = 3/);
});

test('mobile room selector is visibly interactive and keeps canonical state path', () => {
  const room = read('sections/HouseNavigator/RoomSelect.tsx');

  assert.match(room, /data-mobile-room-select/);
  assert.match(room, /border-\[#C89B2D\]/);
  assert.match(room, /text-\[#C89B2D\]/);
  assert.match(room, /▼/);
  assert.match(room, /selectRoom\(event\.target\.value\)/);
});

test('mobile navigation is not a fixed bottom navigation', () => {
  const nav = read('ClientStudioMobileNav.tsx');

  assert.doesNotMatch(nav, /fixed inset-x-0 bottom-0/);
});

test('RACIO responsive authority remains untouched by this task', () => {
  const racio = read('sections/AIAdvisor/ai-advisor-layout.ts');

  assert.match(racio, /tabletMin:grid-cols-1/);
});
