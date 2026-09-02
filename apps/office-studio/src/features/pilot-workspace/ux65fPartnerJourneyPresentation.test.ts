import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const navigatorSource = readFileSync(
  new URL('./CommercialJourneyNavigator.tsx', import.meta.url),
  'utf8',
);

const completionSource = readFileSync(
  new URL('./terminal/ConisStudioScreen.tsx', import.meta.url),
  'utf8',
);

const officeCss = readFileSync(
  new URL('../../index.css', import.meta.url),
  'utf8',
);

describe('UX65F partner journey presentation', () => {
  it('uses post-payment verification instructions without claiming receipt', () => {
    assert.match(
      completionSource,
      /Po ověření platby vám pošleme instrukce k podkladům/,
    );
    assert.doesNotMatch(
      completionSource,
      /Podklady můžete nahrát nyní nebo kdykoliv později/,
    );
  });

  it('guides blocked future steps back to the current incomplete step', () => {
    assert.match(navigatorSource, /blockedStepGuidance/);
    assert.match(
      navigatorSource,
      /Nejprve vyberte pilotní program\./,
    );
    assert.match(
      navigatorSource,
      /Nejprve dokončete objednávku\./,
    );
    assert.match(
      navigatorSource,
      /Nejprve potvrďte provedení platby\./,
    );
    assert.match(
      navigatorSource,
      /office-pilot-workflow-nav__guidance/,
    );
    assert.match(
      navigatorSource,
      /data-blocked=/,
    );
  });

  it('shows only hovered or focused blocked-step guidance', () => {
    assert.match(
      officeCss,
      /office-pilot-workflow-nav__step\[data-blocked='true'\]:hover/,
    );
    assert.match(
      officeCss,
      /office-pilot-workflow-nav__step\[data-blocked='true'\]:focus/,
    );
    assert.match(
      officeCss,
      /office-pilot-workflow-nav__guidance[\s\S]*display: none/,
    );
  });

  it('keeps bottom scroll reserve in the partner Commercial Journey', () => {
    assert.match(
      officeCss,
      /office-workspace--partner-commercial-journey[\s\S]*padding-bottom: max\(112px/,
    );
  });
});
