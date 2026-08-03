import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  isDecisionSection,
  isInterpretationSection,
  isOrientationSection,
} from './journeyNavigation';

const here = dirname(fileURLToPath(import.meta.url));
const clientStudioRoot = join(here, '../../../..');

function readSource(relativeFromClientStudio: string): string {
  return readFileSync(join(clientStudioRoot, relativeFromClientStudio), 'utf8');
}

describe('Responsive Decision Journey (RCS-05)', () => {
  it('maps shell section ids to journey reveal bands', () => {
    assert.equal(isOrientationSection('hero'), true);
    assert.equal(isOrientationSection('walkthrough'), true);
    assert.equal(isInterpretationSection('priority-experience'), true);
    assert.equal(isInterpretationSection('ai-advisor'), true);
    assert.equal(isDecisionSection('audit-lead-capture'), true);
    assert.equal(isDecisionSection('hero'), false);
  });

  it('unifies mobile navigation reveal, CTA chrome, and scene rhythm', () => {
    const page = readSource(
      'src/features/client-studio/ClientStudioPage.tsx',
    );
    const mobileNav = readSource(
      'src/features/client-studio/ClientStudioMobileNav.tsx',
    );
    const scene = readSource(
      'src/features/client-studio/foundation/JourneySceneFrame.tsx',
    );
    const cta = readSource(
      'src/features/client-studio/foundation/journeyCta.ts',
    );
    const faq = readSource(
      'src/features/client-studio/sections/AIAdvisor/SuggestedQuestions.tsx',
    );
    const canvas = readSource(
      'src/features/client-studio/DesktopCanvas.tsx',
    );
    const active = readSource(
      'src/features/client-studio/foundation/useActiveSection.ts',
    );

    assert.match(page, /registerJourneySectionNavigator/);
    assert.match(page, /isInterpretationSection/);
    assert.match(page, /isDecisionSection/);
    assert.match(mobileNav, /navigateToJourneySection/);
    assert.match(scene, /JOURNEY_CTA_PRIMARY_CLASS/);
    assert.match(scene, /guided-journey-bottom-nav-offset/);
    assert.match(cta, /min-h-11/);
    assert.match(cta, /desktop:min-h-\[38px\]/);
    assert.match(faq, /JOURNEY_CTA_PRIMARY_CLASS/);
    assert.match(canvas, /overflow-x-hidden/);
    assert.match(active, /desktopMinPx/);
  });
});
