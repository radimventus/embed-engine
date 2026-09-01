/**
 * PT-CJ-04 — Commercial Journey Completion.
 * Full partner path polish · no BA / SMTP / IMAP / bank settlement.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { COMMERCIAL_JOURNEY_STEP_DEFS } from './commercialJourneyModel';

const root = dirname(fileURLToPath(import.meta.url));

function read(relative: string): string {
  return readFileSync(join(root, '..', relative), 'utf8');
}

describe('PT-CJ-04 Commercial Journey Completion', () => {
  it('keeps the five-step partner path in order', () => {
    assert.deepEqual(
      COMMERCIAL_JOURNEY_STEP_DEFS.map((step) => step.id),
      [
        'welcome',
        'pilot_program',
        'complete_order',
        'payment',
        'conis_studio',
      ],
    );
  });

  it('closes on CONIS Studio with production copy and one CTA', () => {
    const studio = read(
      'features/pilot-workspace/terminal/ConisStudioScreen.tsx',
    );
    const journey = read(
      'features/pilot-workspace/terminal/CommercialJourneyScreen.tsx',
    );
    const css = read('index.css');

    assert.match(studio, /Děkujeme\. Platba byla oznámena/);
    assert.match(studio, /Vítejte v CONIS Studio/);
    assert.match(studio, /Podklady můžete nahrát nyní nebo kdykoliv později/);
    assert.match(studio, /Otevřít CONIS Studio/);
    assert.match(studio, /\/studio\/manager\//);
    assert.doesNotMatch(
      studio,
      /Office mezitím|handoff|Business Automation|SMTP|IMAP/i,
    );

    assert.match(journey, /office-cj-pilot__continue/);
    assert.match(journey, /Vybrat pilotní program/);
    assert.doesNotMatch(journey, /office-cj-screen__cta/);

    assert.match(css, /office-cj-enter/);
    assert.match(css, /office-cj-screen--conis-studio/);
    assert.match(css, /--cj-cta-radius/);
  });
});
