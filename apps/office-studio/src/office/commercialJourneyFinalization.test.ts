/**
 * PT-CJ-05 — Commercial Journey Finalization inventory checks.
 */

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { COMMERCIAL_JOURNEY_STEP_DEFS } from './commercialJourneyModel';

const root = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(root, '../../../..');

function readRepo(relative: string): string {
  return readFileSync(join(repoRoot, relative), 'utf8');
}

describe('PT-CJ-05 Commercial Journey Finalization', () => {
  it('keeps partner path and inventory synchronized', () => {
    assert.deepEqual(
      COMMERCIAL_JOURNEY_STEP_DEFS.map((step) => step.label),
      [
        'Vítejte',
        'Pilotní program',
        'Dokončit objednávku',
        'Platba',
        'CONIS Studio',
      ],
    );

    const inventory = readRepo(
      'docs/architecture/office/COMMERCIAL-JOURNEY-IMPLEMENTATION-INVENTORY-v1.0.md',
    );
    const roadmap = readRepo(
      'docs/platform/office/COMMERCIAL-JOURNEY-ROADMAP-v1.0.md',
    );
    const officeRoadmap = readRepo(
      'docs/architecture/office/OFFICE-ROADMAP-v2.0.md',
    );
    const validation = readRepo(
      'docs/platform/office/PT-CJ-05-commercial-journey-finalization-validation.md',
    );

    assert.match(inventory, /7c26352/);
    assert.match(inventory, /No Office Handoff/);
    assert.match(roadmap, /Commercial Journey Roadmap v1\.0/);
    assert.match(officeRoadmap, /8\.1 Commercial Journey v1\.0/);
    assert.match(validation, /Closed · Commit `7b00d9c`/);
    assert.equal(
      existsSync(join(repoRoot, 'docs/ssot/PLATFORM ROADMAP.docx')),
      true,
    );
  });

  it('wires only five partner production screens', () => {
    const journey = readFileSync(
      join(root, '../features/pilot-workspace/terminal/CommercialJourneyScreen.tsx'),
      'utf8',
    );
    assert.match(journey, /PilotProgramScreen/);
    assert.match(journey, /CompleteOrderScreen/);
    assert.match(journey, /PaymentScreen/);
    assert.match(journey, /ConisStudioScreen/);
    assert.doesNotMatch(journey, /office_handoff|pilot_confirmed|OfficeHandoff/);
    assert.match(journey, /office-cj-pilot__continue/);
  });
});
