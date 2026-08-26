import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  matchViewportBand,
  resolveViewportBand,
  usesDesktopSidebarRail,
  usesFixedDesktopCanvas,
  usesGuidedScrollSnap,
  usesMobileSectionNav,
  VIEWPORT_BREAKPOINTS,
} from './responsiveLayout';

const here = dirname(fileURLToPath(import.meta.url));
const clientStudioRoot = join(here, '../../../..');

function readSource(relativeFromClientStudio: string): string {
  return readFileSync(join(clientStudioRoot, relativeFromClientStudio), 'utf8');
}

describe('Responsive Foundation (RCS-01)', () => {
  it('defines desktop / tablet / mobile breakpoint bands', () => {
    assert.equal(VIEWPORT_BREAKPOINTS.mobileMaxPx, 767);
    assert.equal(VIEWPORT_BREAKPOINTS.tabletMinPx, 768);
    assert.equal(VIEWPORT_BREAKPOINTS.desktopMinPx, 1280);

    assert.equal(resolveViewportBand(375), 'mobile');
    assert.equal(resolveViewportBand(767), 'mobile');
    assert.equal(resolveViewportBand(768), 'tablet');
    assert.equal(resolveViewportBand(1279), 'tablet');
    assert.equal(resolveViewportBand(1280), 'desktop');
    assert.equal(matchViewportBand(1440), 'desktop');
  });

  it('keeps desktop as SSOT for canvas and sidebar rail', () => {
    assert.equal(usesFixedDesktopCanvas('desktop'), true);
    assert.equal(usesFixedDesktopCanvas('tablet'), false);
    assert.equal(usesFixedDesktopCanvas('mobile'), false);

    assert.equal(usesDesktopSidebarRail('desktop'), true);
    assert.equal(usesDesktopSidebarRail('tablet'), false);
    assert.equal(usesDesktopSidebarRail('mobile'), false);

    assert.equal(usesMobileSectionNav('mobile'), true);
    assert.equal(usesMobileSectionNav('tablet'), true);
    assert.equal(usesMobileSectionNav('desktop'), false);

    assert.equal(usesGuidedScrollSnap('desktop'), true);
    assert.equal(usesGuidedScrollSnap('tablet'), true);
    assert.equal(usesGuidedScrollSnap('mobile'), false);
  });

  it('adapts shell layout without changing section destinations', () => {
    const tailwind = readSource('tailwind.config.js');
    const canvas = readSource('src/features/client-studio/DesktopCanvas.tsx');
    const shell = readSource('src/components/layout/AppShell.tsx');
    const sidebar = readSource(
      'src/features/client-studio/ClientStudioSidebar.tsx',
    );
    const mobileNav = readSource(
      'src/features/client-studio/ClientStudioMobileNav.tsx',
    );
    const header = readSource(
      'src/features/client-studio/ClientStudioHeader.tsx',
    );
    const workspace = readSource('src/components/layout/Workspace.tsx');
    const journeyRoot = readSource(
      'src/features/client-studio/foundation/GuidedJourneyRoot.tsx',
    );

    assert.match(tailwind, /mobile:\s*\{\s*max:\s*'767px'/);
    assert.match(tailwind, /tablet:\s*\{\s*min:\s*'768px'/);
    assert.match(tailwind, /desktop:\s*\{\s*min:\s*'1280px'/);

    assert.match(canvas, /desktop:w-canvas/);
    assert.match(canvas, /desktop:min-w-canvas/);
    assert.match(canvas, /w-full/);

    // AppShell owns responsive visibility of the sidebar slot:
    // hidden on mobile/tablet, restored only at desktop.
    assert.match(shell, /hidden sticky/);
    assert.match(shell, /desktop:block/);
    assert.match(shell, /data-studio-shell="sidebar-slot"/);

    // Mobile/tablet navigation retains the canonical section authority,
    // but lives at the top instead of a fixed bottom bar.
    assert.match(mobileNav, /PILOT_SECTION_NAV/);
    assert.match(mobileNav, /navigateToJourneySection/);
    assert.match(mobileNav, /desktop:hidden/);
    assert.match(mobileNav, /sticky top-/);
    assert.doesNotMatch(mobileNav, /fixed inset-x-0 bottom-0/);

    assert.match(header, /desktop:w-canvas/);
    assert.match(workspace, /desktop:pb-0/);
    assert.match(journeyRoot, /usesGuidedScrollSnap/);
  });

});
