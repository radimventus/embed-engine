import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  OFFICE_NAV_ITEMS,
  officeHref,
  parseOfficeLocation,
  parseOfficeRoute,
} from './office/officeRoutes';

const root = dirname(fileURLToPath(import.meta.url));

describe('officeStudioShell (OF-01 / OF-02 / CAP-OP-10A)', () => {
  it('exposes IA navigation labels without Pilot Workspace', () => {
    assert.deepEqual(
      OFFICE_NAV_ITEMS.map((item) => item.label),
      [
        'Dashboard',
        'Partneři',
        'Obchod',
        'Dokumenty',
        'Implementace',
        'Aktivita',
        'Nastavení',
      ],
    );
  });

  it('parses Office routes under /studio/office base', () => {
    assert.equal(parseOfficeRoute('/studio/office/', '/studio/office/'), 'work');
    assert.equal(
      parseOfficeRoute('/studio/office/dashboard', '/studio/office/'),
      'dashboard',
    );
    assert.equal(
      parseOfficeRoute('/studio/office/partners', '/studio/office/'),
      'partners',
    );
    assert.equal(
      parseOfficeRoute('/studio/office/sales/', '/studio/office/'),
      'sales',
    );
    assert.equal(
      parseOfficeRoute('/studio/office/documents', '/studio/office/'),
      'documents',
    );
    assert.equal(
      parseOfficeRoute('/studio/office/implementation', '/studio/office/'),
      'implementation',
    );
    assert.equal(
      parseOfficeRoute('/studio/office/pilot-workspace', '/studio/office/'),
      'work',
    );
    assert.equal(
      parseOfficeRoute('/studio/office/settings', '/studio/office/'),
      'settings',
    );
  });

  it('parses partner detail deep-links', () => {
    assert.deepEqual(
      parseOfficeLocation('/studio/office/partners/p-dse', '/studio/office/'),
      { routeId: 'partners', partnerId: 'p-dse' },
    );
    assert.deepEqual(
      parseOfficeLocation('/studio/office/sales/p-dse', '/studio/office/'),
      { routeId: 'sales', partnerId: 'p-dse' },
    );
    assert.deepEqual(
      parseOfficeLocation(
        '/studio/office/documents/p-dse',
        '/studio/office/',
      ),
      { routeId: 'documents', partnerId: 'p-dse' },
    );
    assert.deepEqual(
      parseOfficeLocation(
        '/studio/office/implementation/p-dse',
        '/studio/office/',
      ),
      { routeId: 'implementation', partnerId: 'p-dse' },
    );
    assert.equal(officeHref('partners', 'p-dse'), '/partners/p-dse');
    assert.equal(officeHref('sales', 'p-dse'), '/sales/p-dse');
    assert.equal(officeHref('documents', 'p-dse'), '/documents/p-dse');
    assert.equal(
      officeHref('implementation', 'p-dse'),
      '/implementation/p-dse',
    );
  });

  it('builds office hrefs from route ids', () => {
    assert.equal(officeHref('work'), '/');
    assert.equal(officeHref('dashboard'), '/dashboard');
    assert.equal(officeHref('partners'), '/partners');
    assert.equal(officeHref('sales'), '/sales');
    assert.equal(officeHref('documents'), '/documents');
    assert.equal(officeHref('implementation'), '/implementation');
    assert.equal(officeHref('settings'), '/settings');
  });

  it('wires Platform Shell, global project provider and work surface', () => {
    const app = readFileSync(join(root, 'OfficeStudioApp.tsx'), 'utf8');
    const main = readFileSync(join(root, 'main.tsx'), 'utf8');
    const pkg = readFileSync(join(root, '../package.json'), 'utf8');
    assert.match(app, /PlatformShell/);
    assert.match(app, /activeStudioId="office"/);
    assert.match(app, /OfficeSidebar/);
    assert.match(app, /OfficeDashboardPage/);
    assert.match(app, /PartnersWorkspacePage/);
    assert.match(app, /SalesWorkspacePage/);
    assert.match(app, /DocumentsWorkspacePage/);
    assert.match(app, /ImplementationWorkspacePage/);
    assert.match(app, /OfficeWorkSurface/);
    assert.match(app, /PilotWorkspaceProvider/);
    assert.match(app, /PilotRuntimePage/);
    assert.doesNotMatch(app, /PilotCasesPanel/);
    assert.match(main, /studioId="office"/);
    assert.match(pkg, /@embed-engine\/platform-shell/);
    assert.match(pkg, /@embed-engine\/platform-access/);
  });

  it('VR-05 — PE mode does not render Legacy Platform Studio Switcher', () => {
    const app = readFileSync(join(root, 'OfficeStudioApp.tsx'), 'utf8');
    assert.match(app, /isOperatorWorkspaceMode/);
    assert.match(app, /contentOnly/);
    assert.match(
      app,
      /if \(isOperatorWorkspaceMode\(\)\) \{\s*return workspaceBody;/,
    );
  });

  it('does not ship Coming Soon placeholders', () => {
    const section = readFileSync(
      join(root, 'features/OfficeSectionPage.tsx'),
      'utf8',
    );
    const dashboard = readFileSync(
      join(root, 'features/OfficeDashboardPage.tsx'),
      'utf8',
    );
    const partners = readFileSync(
      join(root, 'features/partners/PartnersWorkspacePage.tsx'),
      'utf8',
    );
    const sales = readFileSync(
      join(root, 'features/sales/SalesWorkspacePage.tsx'),
      'utf8',
    );
    const documents = readFileSync(
      join(root, 'features/documents/DocumentsWorkspacePage.tsx'),
      'utf8',
    );
    const implementation = readFileSync(
      join(root, 'features/implementation/ImplementationWorkspacePage.tsx'),
      'utf8',
    );
    const pilot = readFileSync(
      join(root, 'features/pilot/PilotRuntimePage.tsx'),
      'utf8',
    );
    assert.doesNotMatch(section, /Coming Soon/i);
    assert.doesNotMatch(dashboard, /Coming Soon/i);
    assert.doesNotMatch(partners, /Coming Soon/i);
    assert.doesNotMatch(sales, /Coming Soon/i);
    assert.doesNotMatch(documents, /Coming Soon/i);
    assert.doesNotMatch(implementation, /Coming Soon/i);
    assert.doesNotMatch(pilot, /Coming Soon/i);
  });
});
