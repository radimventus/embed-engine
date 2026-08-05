/**
 * PT-CJ-02 — Lean Commercial Journey catalog + surface wiring (PT-VR-01 isolated).
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { getPilotWorkspaceCase } from './pilotWorkspaceModel';
import {
  activeCommercialJourneyStepId,
  buildCommercialJourneySteps,
  COMMERCIAL_JOURNEY_STEP_DEFS,
} from './commercialJourneyModel';

const root = dirname(fileURLToPath(import.meta.url));

function read(relative: string): string {
  return readFileSync(join(root, '..', relative), 'utf8');
}

describe('PT-CJ-02 lean commercial journey workflow runtime', () => {
  it('exposes five partner-facing Commercial Journey steps', () => {
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
    assert.equal(COMMERCIAL_JOURNEY_STEP_DEFS.length, 5);
  });

  it('projects case status into lean journey steps', () => {
    const waiting = buildCommercialJourneySteps(
      getPilotWorkspaceCase('case-dse-starter'),
    );
    assert.equal(activeCommercialJourneyStepId(waiting), 'payment');
    assert.equal(waiting.find((s) => s.id === 'welcome')?.state, 'done');
    assert.equal(waiting.find((s) => s.id === 'pilot_program')?.state, 'done');
    assert.equal(waiting.find((s) => s.id === 'complete_order')?.state, 'done');
    assert.equal(waiting.find((s) => s.id === 'payment')?.state, 'active');
    assert.equal(waiting.find((s) => s.id === 'conis_studio')?.state, 'waiting');

    const checkout = buildCommercialJourneySteps(
      getPilotWorkspaceCase('case-nord-pilot'),
    );
    assert.equal(activeCommercialJourneyStepId(checkout), 'complete_order');

    const offer = buildCommercialJourneySteps(
      getPilotWorkspaceCase('case-atelier-studio'),
    );
    assert.equal(activeCommercialJourneyStepId(offer), 'pilot_program');

    const ready = buildCommercialJourneySteps({
      ...getPilotWorkspaceCase('case-dse-starter')!,
      status: 'pilot_ready',
    });
    assert.equal(activeCommercialJourneyStepId(ready), 'conis_studio');
  });

  it('wires lean journey screens on isolated Partner Commercial Journey surface', () => {
    const navigator = read(
      'features/pilot-workspace/CommercialJourneyNavigator.tsx',
    );
    const surface = read(
      'features/pilot-workspace/CommercialJourneySurface.tsx',
    );
    const screen = read(
      'features/pilot-workspace/terminal/CommercialJourneyScreen.tsx',
    );
    const css = read('index.css');
    const work = read('features/pilot-workspace/OfficeWorkSurface.tsx');

    assert.match(navigator, /data-workflow-catalog="commercial-journey"/);
    assert.match(navigator, /Commercial Journey/);
    assert.match(surface, /CommercialJourneyScreen/);
    assert.match(screen, /CompleteOrderScreen/);
    assert.match(screen, /PaymentScreen/);
    assert.match(screen, /ConisStudioScreen/);
    assert.doesNotMatch(screen, /OfficeHandoff|PilotConfirmed|office_handoff/);
    assert.doesNotMatch(navigator, /Office Handoff|Pilot Confirmed/);
    assert.match(css, /office-cj-screen/);
    assert.doesNotMatch(work, /CommercialJourneyScreen/);
    assert.match(work, /data-office-mode="work"/);
  });
});
