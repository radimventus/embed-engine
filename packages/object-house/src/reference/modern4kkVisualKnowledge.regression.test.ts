import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import {
  listHouseKnowledge,
  resetHouseKnowledgeForTests,
} from '../knowledge/houseKnowledgeStore';
import { bootstrapModern4kkReferenceContent } from './modern4kkContentBootstrap';

const EXPECTED_VISUAL_ATOM_IDS = [
  'modern-4kk-roof-bratex-click',
  'modern-4kk-architectural-form',
  'modern-4kk-garden-glazing',
  'modern-4kk-anthracite-shading',
  'modern-4kk-wooden-terraces',
  'modern-4kk-two-car-shelter',
  'modern-4kk-layout-4kk',
  'modern-4kk-secondary-room-use',
  'modern-4kk-built-in-storage',
  'modern-4kk-kitchen-island',
  'modern-4kk-bathroom-equipment',
  'modern-4kk-interior-palette',
] as const;

describe('MODERN 4KK visual House Knowledge regression', () => {
  beforeEach(() => {
    resetHouseKnowledgeForTests();
  });

  it('registers all additions only under the canonical reference House', () => {
    bootstrapModern4kkReferenceContent();

    const atoms = listHouseKnowledge('modern-4kk');
    const byId = new Map(atoms.map((atom) => [atom.id, atom]));

    for (const id of EXPECTED_VISUAL_ATOM_IDS) {
      const atom = byId.get(id);
      assert.ok(atom, `Missing canonical House Knowledge atom: ${id}`);
      assert.equal(atom.houseId, 'modern-4kk');
      assert.equal(atom.scope, 'PRODUCT');
      assert.equal(atom.temporalStatus, 'CURRENT');
      assert.notEqual(atom.category, 'guardrail');
    }

    assert.equal(listHouseKnowledge('dse').length, 0);
  });

  it('records roof and shading as confirmed owner-provided facts', () => {
    bootstrapModern4kkReferenceContent();

    const atoms = listHouseKnowledge('modern-4kk');
    const roof = atoms.find(
      (atom) => atom.id === 'modern-4kk-roof-bratex-click',
    );
    const shading = atoms.find(
      (atom) => atom.id === 'modern-4kk-anthracite-shading',
    );

    assert.ok(roof);
    assert.ok(shading);
    assert.equal(roof.confidence, 'CONFIRMED');
    assert.equal(roof.source.kind, 'CURRENT_CONFIRMED');
    assert.match(roof.statement, /BRATEX CLICK/);
    assert.match(roof.statement, /antracitovou/);

    assert.equal(shading.confidence, 'CONFIRMED');
    assert.equal(shading.source.kind, 'CURRENT_CONFIRMED');
    assert.match(shading.statement, /antracitovými roletovými žaluziemi/);
  });

  it('keeps visual documentation qualified without blocking technical truth', () => {
    bootstrapModern4kkReferenceContent();

    const atoms = listHouseKnowledge('modern-4kk').filter((atom) =>
      EXPECTED_VISUAL_ATOM_IDS.includes(
        atom.id as (typeof EXPECTED_VISUAL_ATOM_IDS)[number],
      ),
    );

    const serialized = JSON.stringify(atoms);

    assert.doesNotMatch(serialized, /součástí ceny|základní cen/i);
    assert.doesNotMatch(serialized, /nelze určit tepeln/i);
    assert.doesNotMatch(serialized, /nelze určit akust/i);
    assert.doesNotMatch(serialized, /nelze určit požár/i);
  });
});
