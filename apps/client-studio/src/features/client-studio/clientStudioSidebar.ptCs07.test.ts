/**
 * CAP-PLAT-02c — Client sidebar: Scene Navigator + CPL house menu.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

describe('PT-CS-07 / CAP-PLAT-02c ClientStudioSidebar', () => {
  const source = readFileSync(join(here, 'ClientStudioSidebar.tsx'), 'utf8');

  it('wires hamburger to house list panel via CPL', () => {
    assert.match(source, /client-house-menu-toggle/);
    assert.match(source, /client-house-menu/);
    assert.match(source, /listClientHouses|listCanonicalHouses/);
    assert.match(source, /switchActiveHouse|updateSession/);
    assert.match(source, /toggleHouseMenu|setHouses/);
    assert.doesNotMatch(source, /listPublishedProjects/);
    assert.doesNotMatch(source, /\[PT-CS-07 house-menu\]/);
  });

  it('exposes Scene Navigator dots under hamburger', () => {
    assert.match(source, /client-scene-navigator/);
    assert.match(source, /journey-scene-orientation/);
    assert.match(source, /journey-scene-interpretation/);
    assert.match(source, /journey-scene-decision/);
    assert.match(source, /activeSceneId === item\.sceneId/);
    assert.match(source, /border-2 border-embed-brand-gold bg-embed-brand-gold/);
  });

  it('uses gold / white on navy — never platform blue action tokens on rail', () => {
    assert.match(source, /text-embed-brand-gold/);
    assert.doesNotMatch(source, /embed-action-primary/);
    assert.doesNotMatch(source, /#18428[Ff]/);
  });
});
