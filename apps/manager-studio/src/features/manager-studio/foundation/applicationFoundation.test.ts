import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const managerStudioRoot = join(here, '../../../..');

function readSource(relativeFromManagerStudio: string): string {
  return readFileSync(join(managerStudioRoot, relativeFromManagerStudio), 'utf8');
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('Application Foundation (MSCB-01)', () => {
  it('mounts through a single main entry and AppShell', () => {
    const main = readSource('src/main.tsx');
    const app = readSource(
      'src/features/manager-studio/ManagerStudioApp.tsx',
    );

    assert.match(main, /ErrorBoundary/);
    assert.match(main, /ManagerStudioApp/);
    assert.match(main, /PlatformAccessRoot/);
    assert.equal(main.includes('createRoot'), true);
    assert.match(app, /AppShell/);
    assert.match(app, /ManagerStudioSidebar/);
    assert.match(app, /ManagerStudioPage/);
  });

  it('uses the shared Platform Shell header (EPIC-BX-11)', () => {
    const shell = readSource('src/components/layout/AppShell.tsx');
    const pkg = readSource('package.json');

    assert.match(shell, /@embed-engine\/platform-shell/);
    assert.match(shell, /PlatformShell/);
    assert.match(shell, /activeStudioId="manager"/);
    assert.match(pkg, /@embed-engine\/platform-shell/);
  });

  it('composes Manager from Capability Registry (EPIC-BX-13)', () => {
    const shell = readSource('src/components/layout/AppShell.tsx');
    const composition = readSource('src/studio/managerStudioComposition.ts');
    const pkg = readSource('package.json');

    assert.match(composition, /MANAGER_STUDIO_COMPOSITION/);
    assert.match(composition, /composeStudio/);
    assert.match(shell, /capabilityHost/);
    assert.match(pkg, /@embed-engine\/capabilities/);
  });

  it('uses shared Platform Access Session Provider (EPIC-BX-14)', () => {
    const main = readSource('src/main.tsx');
    const shell = readSource('src/components/layout/AppShell.tsx');
    const pkg = readSource('package.json');

    assert.match(main, /PlatformAccessRoot/);
    assert.match(shell, /usePlatformSession/);
    assert.match(pkg, /@embed-engine\/platform-access/);
  });

  it('bootstraps Decision Session Runtime only via the Provider', () => {
    const provider = readSource(
      'src/features/manager-studio/runtime/DecisionSessionRuntimeProvider.tsx',
    );
    const page = readSource(
      'src/features/manager-studio/ManagerStudioPage.tsx',
    );
    const app = stripComments(
      readSource('src/features/manager-studio/ManagerStudioApp.tsx'),
    );

    assert.match(provider, /createDecisionSessionRuntime/);
    assert.match(provider, /createSystemClock/);
    assert.match(page, /DecisionSessionRuntimeProvider/);
    assert.match(page, /RuntimeBootstrapGate/);
    assert.equal(app.includes('createDecisionSessionRuntime'), false);
  });

  it('keeps partner navigation wired to partner section ids (PR-026)', () => {
    const partnerNav = readSource(
      'src/features/manager-studio/partnerNav.ts',
    );
    const sidebar = readSource(
      'src/features/manager-studio/ManagerStudioSidebar.tsx',
    );
    const canvas = readSource(
      'src/features/manager-studio/operations/OperationsCanvas.tsx',
    );
    const page = readSource(
      'src/features/manager-studio/ManagerStudioPage.tsx',
    );

    assert.match(partnerNav, /Místa ztráty zákazníků/);
    assert.match(partnerNav, /Živý přehled/);
    assert.match(partnerNav, /Metriky platformy/);
    assert.match(partnerNav, /Manažerské shrnutí/);
    assert.match(partnerNav, /Produktové poznatky/);
    assert.match(sidebar, /PARTNER_NAV_GROUPS/);
    assert.match(sidebar, /useManagerNav/);
    assert.match(sidebar, /scrollToSection/);
    assert.equal(sidebar.includes('LAUNCH_SECTION_NAV'), false);
    assert.equal(sidebar.includes('CUSTOMER_SUCCESS_SECTION_NAV'), false);
    assert.equal(sidebar.includes('COMMERCIAL_SECTION_NAV'), false);
    assert.match(canvas, /LiveOverview/);
    assert.match(canvas, /partnerOnly/);
    assert.match(page, /OperationsCanvas/);
    assert.match(page, /ManagerWorkCenterHome/);
    assert.equal(page.includes('CustomerSuccessCanvas'), false);
    assert.equal(page.includes('LaunchCenterCanvas'), false);
    assert.equal(page.includes('CommercialPlatformCanvas'), false);
  });

  it('still depends on Customer Success package for composition (EPIC-BX-17)', () => {
    const shell = readSource('src/components/layout/AppShell.tsx');
    const pkg = readSource('package.json');

    assert.match(shell, /activeCapabilityId/);
    assert.match(pkg, /@embed-engine\/customer-success/);
  });

  it('projects Platform Operations Center metrics for partners (EPIC-BX-19)', () => {
    const page = readSource(
      'src/features/manager-studio/ManagerStudioPage.tsx',
    );
    const partnerNav = readSource(
      'src/features/manager-studio/partnerNav.ts',
    );
    const pkg = readSource('package.json');

    assert.match(page, /OperationsCenterCanvas/);
    assert.match(page, /partnerOnly/);
    assert.match(partnerNav, /title: 'Provoz'/);
    assert.match(pkg, /@embed-engine\/operations-center/);
  });

  it('projects Product Learning summary for partners (EPIC-BX-20)', () => {
    const page = readSource(
      'src/features/manager-studio/ManagerStudioPage.tsx',
    );
    const partnerNav = readSource(
      'src/features/manager-studio/partnerNav.ts',
    );
    const pkg = readSource('package.json');

    assert.match(page, /ProductLearningCanvas/);
    assert.match(partnerNav, /title: 'Shrnutí'/);
    assert.match(pkg, /@embed-engine\/product-learning/);
  });

  it('keeps Commercial Platform package for composition (EPIC-BX-21)', () => {
    const pkg = readSource('package.json');
    assert.match(pkg, /@embed-engine\/commercial-platform/);
  });

  it('keeps Launch Center package for composition (EPIC-BX-23)', () => {
    const pkg = readSource('package.json');
    assert.match(pkg, /@embed-engine\/launch-center/);
  });

  it('does not expose Interpretation or compose semantics in the Provider', () => {
    const provider = stripComments(
      readSource(
        'src/features/manager-studio/runtime/DecisionSessionRuntimeProvider.tsx',
      ),
    );

    assert.match(provider, /projectOperationsOverview/);
    assert.equal(provider.includes('getInterpretation'), false);
    assert.equal(provider.includes('interpretDecisionSession'), false);
    assert.equal(provider.includes('composeDecision'), false);
  });

  it('does not depend on Client Studio application modules', () => {
    const page = readSource(
      'src/features/manager-studio/ManagerStudioPage.tsx',
    );
    const provider = readSource(
      'src/features/manager-studio/runtime/DecisionSessionRuntimeProvider.tsx',
    );

    assert.equal(page.includes('client-studio'), false);
    assert.equal(provider.includes('client-studio'), false);
    assert.equal(provider.includes('synchronizedExperience'), false);
  });
});
