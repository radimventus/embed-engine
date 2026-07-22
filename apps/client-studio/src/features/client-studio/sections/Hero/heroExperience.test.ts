import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));

function read(relative: string): string {
  return readFileSync(join(here, relative), 'utf8');
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('Hero Experience (CSCB-02 / SR-002)', () => {
  it('reads Runtime Context only — no semantic composition', () => {
    const files = readdirSync(here).filter(
      (name) => name.endsWith('.tsx') || name.endsWith('.ts'),
    );

    for (const name of files) {
      if (name.endsWith('.test.ts')) {
        continue;
      }
      const source = stripComments(read(name));
      assert.equal(
        source.includes('composeDecision'),
        false,
        `${name} must not compose Decision semantics`,
      );
      assert.equal(
        source.includes('interpretDecision'),
        false,
        `${name} must not interpret`,
      );
      assert.equal(
        source.includes('dispatch('),
        false,
        `${name} must not dispatch Runtime commands`,
      );
      assert.equal(
        source.includes('presentation-assets'),
        false,
        `${name} must not import presentation catalog`,
      );
      assert.equal(
        source.includes('@embed-engine/object-house'),
        false,
        `${name} must not import Object Package directly`,
      );
    }
  });

  it('binds object identity, Runtime Focus, and Decision Entry CTAs', () => {
    const content = read('HeroContent.tsx');
    const entries = read('HeroDecisionEntries.tsx');
    const image = read('HeroImage.tsx');

    assert.match(content, /context\.object/);
    assert.match(content, /hero\.primaryReason/);
    assert.match(content, /hero-runtime-focus/);
    assert.match(content, /formatDecisionKeyCs/);
    assert.match(content, /HeroDecisionEntries/);
    assert.match(entries, /Prozkoumat dům/);
    assert.match(entries, /PILOT_SECTION_IDS\.propertyExplorer/);
    assert.match(entries, /Podívat se na dispozici/);
    assert.match(entries, /Objevit priority/);
    assert.match(entries, /PILOT_SECTION_IDS\.floorPlan/);
    assert.match(entries, /PILOT_SECTION_IDS\.priority/);
    assert.match(image, /media\.kind === 'video'/);
  });

  it('does not mount hardcoded SocialProof on the opening surface', () => {
    const hero = read('Hero.tsx');
    assert.equal(hero.includes('SocialProof'), false);
  });
});
