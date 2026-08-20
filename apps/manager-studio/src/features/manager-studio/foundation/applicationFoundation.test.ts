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
    const bind = readSource(
      'src/features/manager-studio/runtime/managerCanonicalBind.ts',
    );
    const page = readSource(
      'src/features/manager-studio/ManagerStudioPage.tsx',
    );
    const app = stripComments(
      readSource('src/features/manager-studio/ManagerStudioApp.tsx'),
    );

    assert.match(provider, /createDecisionSessionRuntime/);
    assert.match(provider, /createSystemClock/);
    assert.match(provider, /loadPublicBuilderHousePackage/);
    assert.match(provider, /resolveCanonicalRuntimeBindingFromSession/);
    assert.match(bind, /resolveCanonicalRuntimeBinding/);
    assert.doesNotMatch(provider, /\bopenProject\b/);
    assert.doesNotMatch(bind, /\bopenProject\b/);
    assert.equal(provider.includes('REFERENCE_HOUSE_PACKAGE'), false);
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

  it('keeps all partner views navigable after the runtime gate resolves', () => {
    const partnerNav = readSource(
      'src/features/manager-studio/partnerNav.ts',
    );
    const activeSection = readSource(
      'src/features/manager-studio/foundation/useActiveSection.ts',
    );
    const operations = readSource(
      'src/features/manager-studio/operations/OperationsCanvas.tsx',
    );
    const operationsCenter = readSource(
      'src/features/manager-studio/operations-center/OperationsCenterCanvas.tsx',
    );
    const productLearning = readSource(
      'src/features/manager-studio/product-learning/ProductLearningCanvas.tsx',
    );

    for (const sectionId of [
      'live-overview',
      'poc-metrics',
      'pl-executive',
      'pl-insights',
    ]) {
      assert.match(partnerNav, new RegExp(`id: '${sectionId}'`));
    }
    assert.match(operations, /<LiveOverview/);
    assert.match(operationsCenter, /PLATFORM_OPS_SECTION_IDS\.metrics/);
    assert.match(productLearning, /PRODUCT_LEARNING_SECTION_IDS\.executive/);
    assert.match(productLearning, /PRODUCT_LEARNING_SECTION_IDS\.insights/);
    assert.match(activeSection, /MutationObserver/);
    assert.match(activeSection, /observeSections/);
  });

  it('keeps platform and product views navigable without a House runtime', () => {
    const page = readSource('src/features/manager-studio/ManagerStudioPage.tsx');

    const gateStart = page.indexOf('<RuntimeBootstrapGate>');
    const gateEnd = page.indexOf('</RuntimeBootstrapGate>');
    const operationsCenter = page.indexOf('<OperationsCenterCanvas partnerOnly />');
    const productLearning = page.indexOf('<ProductLearningCanvas partnerOnly />');

    assert.ok(gateStart >= 0);
    assert.ok(gateEnd > gateStart);
    assert.ok(operationsCenter > gateEnd);
    assert.ok(productLearning > gateEnd);
  });

  it('keeps the Manager navigation rail outside the content scrollport', () => {
    const shell = readSource('src/components/layout/AppShell.tsx');
    const styles = readSource('src/index.css');

    assert.match(shell, /flex h-full min-h-0 flex-1 overflow-hidden/);
    assert.match(
      shell,
      /platform-nav-rail sticky top-0 h-full shrink-0 self-stretch overflow-y-auto/,
    );
    assert.match(shell, /min-h-0 min-w-0 flex-1 overflow-y-auto/);
    assert.match(
      styles,
      /@apply h-full min-h-screen overflow-hidden overscroll-none/,
    );
  });

  it('uses the active House session binding in every partner view', () => {
    const liveOverview = readSource(
      'src/features/manager-studio/operations/surfaces/LiveOverview.tsx',
    );
    const operationsCenter = readSource(
      'src/features/manager-studio/operations-center/OperationsCenterCanvas.tsx',
    );
    const productLearning = readSource(
      'src/features/manager-studio/product-learning/ProductLearningCanvas.tsx',
    );
    const provider = readSource(
      'src/features/manager-studio/runtime/DecisionSessionRuntimeProvider.tsx',
    );

    assert.match(liveOverview, /useManagerStudioRuntime/);
    assert.match(operationsCenter, /usePlatformSession/);
    assert.match(productLearning, /session\?\.activeHouseId/);
    assert.match(provider, /session\?\.activeHouseId/);
    assert.match(provider, /resolveWorkspaceHouseBinding/);
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

  it('PT-PLATFORM-01 / PT-CS-07 — incomplete Experience fails soft (no render throw)', () => {
    const provider = readSource(
      'src/features/manager-studio/runtime/DecisionSessionRuntimeProvider.tsx',
    );
    assert.doesNotMatch(
      provider,
      /throw new Error\('DecisionSessionRuntime produced no Experience projection\.'\)/,
    );
    assert.match(provider, /House Package je neúplný|Canonical Projection Layer/);
    assert.match(provider, /resolveCanonicalRuntimeBindingFromSession/);
    assert.doesNotMatch(provider, /\bopenProject\b/);
    assert.doesNotMatch(provider, /resolveActiveProjectView/);
  });

  it('CAP-PLAT-02d.1 / CAP-PLAT-04i — shared Project and House resolve via CPL', async () => {
    const { resolveCanonicalRuntimeBindingFromSession } = await import(
      '../runtime/managerCanonicalBind.ts'
    );
    const binding = resolveCanonicalRuntimeBindingFromSession(
      'project-ac-modular',
      'villa-168',
    );
    assert.equal(binding.bindSource, 'explicit');
    assert.equal(binding.runtimeHouseId, 'villa-168');
    assert.equal(binding.runtimeProjectId, 'project-ac-modular');
    assert.ok(binding.project);
    assert.equal(binding.project.project.projectId, 'project-ac-modular');
    assert.equal(binding.project.house.houseId, 'villa-168');
    assert.equal(binding.project.house.name, 'Villa 168');
    assert.notEqual(
      binding.project.project.name,
      binding.project.house.name,
    );
    assert.ok(binding.project.partner.companyId.length > 0);
    assert.ok(
      (binding.packagePublicRoot?.length ?? 0) > 0 ||
        binding.project.house.packagePublicRoot.length > 0,
    );

    const unbound = resolveCanonicalRuntimeBindingFromSession(null);
    assert.equal(unbound.bindSource, 'none');
    assert.equal(unbound.project, null);
  });

  it('CAP-REF-07c — MODERN 4KK consumes canonical House Runtime Context without CSV', async () => {
    const provider = readSource(
      'src/features/manager-studio/runtime/DecisionSessionRuntimeProvider.tsx',
    );
    const { resolveCanonicalRuntimeBindingFromSession } = await import(
      '../runtime/managerCanonicalBind.ts'
    );
    const { getCanonicalHouseRuntimeContext } = await import(
      '@embed-engine/object-house'
    );
    const binding = resolveCanonicalRuntimeBindingFromSession(
      'project-domy-s-energii',
      'modern-4kk',
    );
    const context = getCanonicalHouseRuntimeContext(
      binding.runtimeHouseId ?? '',
    );

    assert.match(provider, /getCanonicalHouseRuntimeContext/);
    assert.match(provider, /if \(canonicalHouseContext !== null\)/);
    assert.match(provider, /const projectId = runtimeProjectId/);
    assert.equal(binding.runtimeHouseId, 'modern-4kk');
    assert.equal(binding.runtimeProjectId, 'project-domy-s-energii');
    assert.ok(context);
    assert.equal(context.specification.identity.houseId, 'modern-4kk');
    assert.equal(context.knowledge.length, 20);
    assert.equal(context.priorityFaq.length, 100);
  });

  it('CAP-VR38d1 — Manager keeps Project scope distinct from shared House scope', async () => {
    const sidebar = readSource(
      'src/features/manager-studio/ManagerStudioSidebar.tsx',
    );
    const scopeControls = readSource(
      'src/features/manager-studio/ManagerWorkspaceScopeControls.tsx',
    );
    const provider = readSource(
      'src/features/manager-studio/runtime/DecisionSessionRuntimeProvider.tsx',
    );
    const { resolveCanonicalRuntimeBindingFromSession } = await import(
      '../runtime/managerCanonicalBind.ts'
    );
    const projectScope = resolveCanonicalRuntimeBindingFromSession(
      'project-domy-s-energii',
      null,
    );
    const houseScope = resolveCanonicalRuntimeBindingFromSession(
      'project-domy-s-energii',
      'modern-4kk',
    );

    assert.equal(projectScope.runtimeProjectId, 'project-domy-s-energii');
    assert.equal(projectScope.runtimeHouseId, null);
    assert.equal(houseScope.runtimeHouseId, 'modern-4kk');
    assert.match(scopeControls, /Celý projekt/);
    assert.match(scopeControls, />\s*Projekt\s*</);
    assert.match(scopeControls, />\s*Objekt\s*</);
    assert.doesNotMatch(scopeControls, /Dům \/ objekt/);
    assert.match(scopeControls, /updateWorkspaceScope\(\{ projectId: nextProjectId \}\)/);
    assert.match(
      scopeControls,
      /activeHouseId: nextHouseId\.length > 0 \? nextHouseId : null/,
    );
    assert.match(scopeControls, /createWorkspaceHouseChangeMessage/);
    assert.match(scopeControls, /listWorkspaceHouses\(projectId\)/);
    assert.doesNotMatch(scopeControls, /registry\.projects\.filter/);
    assert.match(provider, /resolveWorkspaceHouseBinding/);
    assert.match(provider, /runtimeContentAvailable === false/);
  });

  it('CAP-VR39R1 — Project scope renders controls before any House runtime gate', () => {
    const page = readSource('src/features/manager-studio/ManagerStudioPage.tsx');
    const sidebar = readSource(
      'src/features/manager-studio/ManagerStudioSidebar.tsx',
    );
    const scopeControls = readSource(
      'src/features/manager-studio/ManagerWorkspaceScopeControls.tsx',
    );
    const provider = readSource(
      'src/features/manager-studio/runtime/DecisionSessionRuntimeProvider.tsx',
    );
    const gate = readSource(
      'src/features/manager-studio/foundation/RuntimeBootstrapGate.tsx',
    );

    assert.match(scopeControls, /data-testid="manager-workspace-scope"/);
    assert.match(scopeControls, /Celý projekt/);
    assert.match(scopeControls, /listWorkspaceHouses\(projectId\)/);
    assert.ok(
      sidebar.indexOf('<ManagerWorkspaceScopeControls />') <
        sidebar.indexOf('PARTNER_NAV_GROUPS.map'),
    );
    assert.match(scopeControls, /PlatformScopeSelect/);
    assert.doesNotMatch(scopeControls, /<select\b/);
    assert.match(
      scopeControls,
      /bg-\[var\(--platform-cream-light\)\]/,
    );
    assert.doesNotMatch(page, /ManagerWorkspaceScopeControls/);
    assert.doesNotMatch(provider, /manager-runtime-bootstrap-error/);
    assert.match(provider, /<ManagerStudioRuntimeContext\.Provider value=\{value\}>/);
    assert.match(provider, /\{children\}/);
    assert.match(provider, /if \(sessionActiveHouseId === null\)/);
    assert.match(provider, /Vyberte dům \/ objekt pro provozní projekci/);
    assert.match(gate, /runtime\.bootstrapStatus !== null/);
  });

  it('CAP-VR35b — operational empty state follows zero canonical cases', () => {
    const workCenter = readSource(
      'src/features/manager-studio/ManagerWorkCenterHome.tsx',
    );

    assert.match(workCenter, /useHouseOperationalCases/);
    assert.match(workCenter, /aggregate\.caseCount === 0/);
    assert.match(workCenter, /manager-operational-empty/);
    assert.match(
      workCenter,
      /zatím nejsou žádná provozní ani zákaznická data/,
    );
    assert.match(workCenter, /Data vzniknou používáním Client Experience/);
    assert.doesNotMatch(workCenter, /Ukázkové metriky/);
    assert.doesNotMatch(workCenter, /houseDataMode !== 'REFERENCE_DEMO'/);
  });

  it('CAP-PLAT-02d.2 / CAP-PLAT-04i — shell Company / Project / House presentation from CPL only', async () => {
    const shell = readSource('src/components/layout/AppShell.tsx');
    const workspace = readSource('src/components/layout/Workspace.tsx');
    const presentation = readSource(
      'src/features/manager-studio/runtime/managerCanonicalPresentation.ts',
    );

    assert.match(shell, /resolveManagerCanonicalIdentity/);
    assert.match(presentation, /resolveCanonicalRuntimeBindingFromSession/);
    assert.doesNotMatch(shell, /useStudioBrandProjection/);
    assert.doesNotMatch(shell, /usePilotWorkspace/);
    assert.doesNotMatch(shell, /bootstrap\?\.project/);
    assert.doesNotMatch(workspace, /StudioBrandProjection/);
    assert.match(workspace, /data-canonical-company/);
    assert.match(workspace, /data-canonical-project/);
    assert.match(workspace, /data-canonical-house/);

    const { resolveManagerCanonicalIdentity } = await import(
      '../runtime/managerCanonicalPresentation.ts'
    );
    const identity = resolveManagerCanonicalIdentity('villa-168');
    assert.ok(identity.projection);
    assert.equal(identity.projection.project.projectId, 'project-ac-modular');
    assert.equal(identity.projection.house.houseId, 'villa-168');
    assert.equal(identity.houseLabel, 'Villa 168');
    assert.equal(identity.projectLabel, 'AC Modular');
    assert.equal(identity.companyLabel, 'AC Modular');
    assert.notEqual(identity.houseLabel, identity.projectLabel);
    assert.match(identity.helperLine, /AC Modular/);
    assert.match(identity.helperLine, /Villa 168 Hero|Villa 168/);
    assert.match(identity.helperLine, /AC Modular/);
    assert.equal(
      identity.helperLine,
      'AC Modular · Villa 168 Hero · AC Modular',
    );
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
