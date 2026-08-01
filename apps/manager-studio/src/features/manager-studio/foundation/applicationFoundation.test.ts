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
    assert.match(shell, /CapabilityInspector/);
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

  it('keeps shell navigation wired to operations section ids', () => {
    const vocabulary = readSource(
      'src/features/manager-studio/operations/operationsVocabulary.ts',
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

    assert.match(vocabulary, /OPERATIONS_SECTION_NAV/);
    assert.match(vocabulary, /live-overview/);
    assert.match(vocabulary, /attention-queue/);
    assert.match(sidebar, /Pracovní centrum/);
    assert.match(sidebar, /Konverzní přehled/);
    assert.match(sidebar, /useManagerNav/);
    assert.match(sidebar, /scrollToSection/);
    assert.match(canvas, /LiveOverview/);
    assert.match(canvas, /Timeline/);
    assert.match(canvas, /Actions/);
    assert.match(page, /CustomerSuccessCanvas/);
    assert.match(page, /OperationsCanvas/);
    assert.match(page, /ManagerWorkCenterHome/);
  });

  it('projects Customer Success capability (EPIC-BX-17)', () => {
    const page = readSource(
      'src/features/manager-studio/ManagerStudioPage.tsx',
    );
    const shell = readSource('src/components/layout/AppShell.tsx');
    const pkg = readSource('package.json');

    assert.match(page, /CustomerSuccessCanvas/);
    assert.match(shell, /activeCapabilityId/);
    assert.match(pkg, /@embed-engine\/customer-success/);
  });

  it('projects Platform Operations Center capability (EPIC-BX-19)', () => {
    const page = readSource(
      'src/features/manager-studio/ManagerStudioPage.tsx',
    );
    const sidebar = readSource(
      'src/features/manager-studio/ManagerStudioSidebar.tsx',
    );
    const pkg = readSource('package.json');

    assert.match(page, /OperationsCenterCanvas/);
    assert.match(sidebar, /Pracovní centrum/);
    assert.match(pkg, /@embed-engine\/operations-center/);
  });

  it('projects Product Learning capability (EPIC-BX-20)', () => {
    const page = readSource(
      'src/features/manager-studio/ManagerStudioPage.tsx',
    );
    const sidebar = readSource(
      'src/features/manager-studio/ManagerStudioSidebar.tsx',
    );
    const pkg = readSource('package.json');

    assert.match(page, /ProductLearningCanvas/);
    assert.match(sidebar, /Konverzní přehled/);
    assert.match(pkg, /@embed-engine\/product-learning/);
  });

  it('projects Commercial Platform capability (EPIC-BX-21)', () => {
    const page = readSource(
      'src/features/manager-studio/ManagerStudioPage.tsx',
    );
    const sidebar = readSource(
      'src/features/manager-studio/ManagerStudioSidebar.tsx',
    );
    const pkg = readSource('package.json');

    assert.match(page, /CommercialPlatformCanvas/);
    assert.match(sidebar, /mwc-improvements/);
    assert.match(pkg, /@embed-engine\/commercial-platform/);
  });

  it('projects Launch Center capability (EPIC-BX-23)', () => {
    const page = readSource(
      'src/features/manager-studio/ManagerStudioPage.tsx',
    );
    const sidebar = readSource(
      'src/features/manager-studio/ManagerStudioSidebar.tsx',
    );
    const pkg = readSource('package.json');

    assert.match(page, /LaunchCenterCanvas/);
    assert.match(sidebar, /Přehled/);
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
