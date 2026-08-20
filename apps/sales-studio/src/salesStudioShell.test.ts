import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const salesRoot = join(here, '..');

describe('Sales Studio shell (EPIC-BX-11 / SR-001)', () => {
  it('hosts the shared Platform Shell on port 4179', () => {
    const app = readFileSync(join(salesRoot, 'src/SalesStudioApp.tsx'), 'utf8');
    const pkg = readFileSync(join(salesRoot, 'package.json'), 'utf8');
    const vite = readFileSync(join(salesRoot, 'vite.config.ts'), 'utf8');

    assert.match(app, /@embed-engine\/platform-shell/);
    assert.match(app, /PlatformShell/);
    assert.match(app, /activeStudioId="sales"/);
    assert.match(pkg, /@embed-engine\/platform-shell/);
    assert.match(vite, /port:\s*4179/);
  });

  it('composes Sales from Capability Registry (EPIC-BX-13)', () => {
    const app = readFileSync(join(salesRoot, 'src/SalesStudioApp.tsx'), 'utf8');
    const composition = readFileSync(
      join(salesRoot, 'src/studio/salesStudioComposition.ts'),
      'utf8',
    );
    const pkg = readFileSync(join(salesRoot, 'package.json'), 'utf8');

    assert.match(composition, /SALES_STUDIO_COMPOSITION/);
    assert.match(app, /capabilityHost/);
    assert.match(pkg, /@embed-engine\/capabilities/);
  });

  it('uses shared Platform Access Session Provider (EPIC-BX-14)', () => {
    const main = readFileSync(join(salesRoot, 'src/main.tsx'), 'utf8');
    const app = readFileSync(join(salesRoot, 'src/SalesStudioApp.tsx'), 'utf8');
    const pkg = readFileSync(join(salesRoot, 'package.json'), 'utf8');

    assert.match(main, /PlatformAccessRoot/);
    assert.match(app, /usePlatformSession/);
    assert.match(pkg, /@embed-engine\/platform-access/);
  });

  it('implements the click-model 3-column sales desk (SR-001)', () => {
    const app = readFileSync(join(salesRoot, 'src/SalesStudioApp.tsx'), 'utf8');
    const css = readFileSync(join(salesRoot, 'src/index.css'), 'utf8');
    const clients = readFileSync(
      join(salesRoot, 'src/sales/salesClients.ts'),
      'utf8',
    );

    assert.match(app, /Případy k hovoru/);
    assert.match(app, /Detail nákupního záměru/);
    assert.match(app, /Rozhodovací cesta/);
    assert.match(app, /Hledat zájemce/);
    assert.match(app, /Vysoká jistota/);
    assert.match(app, /useHouseOperationalCases/);
    assert.match(app, /toSalesClients/);
    assert.match(app, /sales-operational-empty/);
    assert.doesNotMatch(app, /CapabilityInspector/);
    assert.doesNotMatch(app, /platform-nav-rail/);
    assert.doesNotMatch(app, /platform-inspector-rail/);
    assert.match(css, /sales-desk__grid/);
    assert.match(clients, /toSalesClients/);
    assert.doesNotMatch(clients, /SALES_CLIENTS/);
  });

  it('applies Sales IA hierarchy (SR-002)', () => {
    const app = readFileSync(join(salesRoot, 'src/SalesStudioApp.tsx'), 'utf8');
    const css = readFileSync(join(salesRoot, 'src/index.css'), 'utf8');
    const clients = readFileSync(
      join(salesRoot, 'src/sales/salesClients.ts'),
      'utf8',
    );
    const shellCss = readFileSync(
      join(
        salesRoot,
        '../../packages/platform-shell/src/platform-shell.css',
      ),
      'utf8',
    );
    const userMenu = readFileSync(
      join(salesRoot, '../../packages/platform-shell/src/UserMenu.tsx'),
      'utf8',
    );
    const landing = readFileSync(
      join(
        salesRoot,
        '../../packages/platform-access/src/react/PlatformLanding.tsx',
      ),
      'utf8',
    );

    assert.match(app, /id: 'prospect'/);
    assert.match(app, /sales-desk__center/);
    assert.match(app, /sales-desk__context/);
    assert.match(app, /activeHouse\?\.houseName/);
    assert.match(app, /sales-desk__house-list/);
    assert.match(app, /Profil zájemce/);
    assert.doesNotMatch(app, /id: 'company'/);
    assert.doesNotMatch(app, /Decision Journey/);
    assert.doesNotMatch(app, /Decision Signals/);
    assert.match(css, /25%/);
    assert.match(css, /50%/);
    assert.match(css, /sales-desk__center/);
    assert.match(css, /text-align:\s*center/);
    assert.match(clients, /toSalesClients/);
    assert.match(shellCss, /\.platform-role-btn[\s\S]*?text-transform:\s*none/);
    assert.match(userMenu, /Vstupní stránka/);
    assert.doesNotMatch(userMenu, /Platform Landing/);
    assert.match(landing, /Vstupní stránka/);
    assert.doesNotMatch(landing, />Platform Landing</);
  });

  it('CAP-PLAT-04j — shell Project list from CPL Projects; fixtures are Houses', async () => {
    const app = readFileSync(join(salesRoot, 'src/SalesStudioApp.tsx'), 'utf8');
    const clients = readFileSync(
      join(salesRoot, 'src/sales/salesClients.ts'),
      'utf8',
    );

    assert.match(app, /listSalesCanonicalProjects/);
    assert.doesNotMatch(app, /listPublishedProjects/);
    assert.doesNotMatch(app, /usePilotWorkspace/);
    assert.match(clients, /listCanonicalProjects/);
    assert.match(clients, /listCanonicalHouses/);

    const {
      listSalesCanonicalHouses,
      listSalesCanonicalProjects,
      resolveSalesActiveProjectId,
      toSalesClients,
    } = await import('./sales/salesClients.ts');

    const projects = listSalesCanonicalProjects();
    assert.ok(projects.length >= 1);
    assert.equal(projects[0]?.id, 'project-ac-modular');
    assert.equal(projects[0]?.label, 'AC Modular');
    assert.ok(
      projects.every(
        (project) =>
          project.id !== 'villa-168' &&
          project.id !== 'harmony-124' &&
          project.id !== 'family-98' &&
          project.label !== 'Villa 168' &&
          project.label !== 'Harmony 124' &&
          project.label !== 'Family 98',
      ),
    );

    const houses = listSalesCanonicalHouses('project-ac-modular');
    assert.ok(houses.length >= 3);
    assert.ok(
      houses.every(
        (house) =>
          house.id !== house.projectId &&
          house.projectId === 'project-ac-modular',
      ),
    );
    assert.ok(houses.some((house) => house.id === 'villa-168'));
    assert.equal(typeof toSalesClients, 'function');

    assert.equal(
      resolveSalesActiveProjectId('project-domy-s-energii', projects),
      'project-domy-s-energii',
    );
    assert.equal(
      resolveSalesActiveProjectId('project-ac-modular', projects),
      'project-ac-modular',
    );
    assert.equal(
      resolveSalesActiveProjectId('modern-4kk', projects),
      'project-ac-modular',
    );
    assert.match(app, /session\?\.projectId/);
    assert.match(app, /activeProject\?\.label/);
  });

  it('CAP-VR38d2 — uses shared Project and House scope separately from fixture detail', () => {
    const app = readFileSync(join(salesRoot, 'src/SalesStudioApp.tsx'), 'utf8');
    const scopeControls = readFileSync(
      join(salesRoot, 'src/SalesWorkspaceScope.tsx'),
      'utf8',
    );
    const css = readFileSync(join(salesRoot, 'src/index.css'), 'utf8');
    const html = readFileSync(join(salesRoot, 'index.html'), 'utf8');

    assert.match(app, /session\?\.activeHouseId/);
    assert.match(scopeControls, /Celý projekt/);
    assert.match(scopeControls, />\s*Projekt\s*</);
    assert.match(scopeControls, />\s*Objekt\s*</);
    assert.doesNotMatch(scopeControls, /Dům \/ objekt/);
    assert.match(
      scopeControls,
      /updateWorkspaceScope\(\{ projectId: nextProjectId \}\)/,
    );
    assert.match(
      scopeControls,
      /activeHouseId:\s*nextHouseId\.length > 0 \? nextHouseId : null/,
    );
    assert.match(scopeControls, /createWorkspaceProjectChangeMessage/);
    assert.match(scopeControls, /createWorkspaceHouseChangeMessage/);
    assert.match(app, /useHouseOperationalCases/);
    assert.match(app, /activeInterestHouseId/);
    assert.doesNotMatch(app, /setActiveHouseId/);
    assert.match(scopeControls, /listWorkspaceHouses\(activeProjectId\)/);
    assert.doesNotMatch(scopeControls, /registry\.projects\.filter/);
    assert.match(scopeControls, /PlatformScopeSelect/);
    assert.doesNotMatch(scopeControls, /<select\b/);
    assert.match(scopeControls, /sales-workspace-scope/);
    assert.match(scopeControls, /sales-workspace-scope__label/);
    assert.ok(
      app.indexOf('<SalesWorkspaceScope') >
        app.indexOf('title="Případy k hovoru"'),
    );
    assert.ok(
      app.indexOf('<SalesWorkspaceScope') <
        app.indexOf('className="sales-desk__search"'),
    );
    assert.match(
      css,
      /\.sales-workspace-scope\s*\{[\s\S]*?margin-bottom:\s*16px/,
    );
    assert.match(
      css,
      /\.sales-workspace-scope__field\s*\{[\s\S]*?display:\s*grid/,
    );
    assert.match(css, /font-family:\s*'Inter'/);
    assert.match(html, /family=Inter/);
    assert.doesNotMatch(html, /IBM\+Plex\+Sans/);
  });

  it('keeps the sales desk as the single vertical scroll owner', () => {
    const app = readFileSync(join(salesRoot, 'src/SalesStudioApp.tsx'), 'utf8');
    const css = readFileSync(join(salesRoot, 'src/index.css'), 'utf8');

    assert.match(app, /data-testid="sales-desk-scroll"/);
    assert.match(app, /sales-profile-priorities/);
    assert.match(app, /sales-profile-faq/);
    assert.match(app, /Otevřené FAQ/);
    assert.match(app, /Priority a odpovědi/);
    assert.match(css, /\.sales-desk\s*\{[\s\S]*?overflow-y:\s*auto/);
    assert.match(css, /#root\s*\{[\s\S]*?overflow:\s*hidden/);
    assert.doesNotMatch(app, /overflow-y-auto/);
  });
});
