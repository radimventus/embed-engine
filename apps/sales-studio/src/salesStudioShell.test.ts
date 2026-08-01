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
    assert.match(app, /Rozhodovací cesta \(Decision Journey\)/);
    assert.match(app, /Hledat zájemce/);
    assert.match(app, /Vysoká jistota/);
    assert.doesNotMatch(app, /CapabilityInspector/);
    assert.doesNotMatch(app, /platform-nav-rail/);
    assert.doesNotMatch(app, /platform-inspector-rail/);
    assert.match(css, /sales-desk__grid/);
    assert.match(clients, /Jan Novák/);
    assert.match(clients, /Hero Experience/);
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

    assert.match(app, /id: 'prospect'/);
    assert.match(app, /activeHouse\.houseName/);
    assert.match(app, /sales-desk__house-list/);
    assert.doesNotMatch(app, /id: 'company'/);
    assert.match(css, /25%/);
    assert.match(css, /50%/);
    assert.match(clients, /MODERN 01/);
    assert.match(shellCss, /\.platform-role-btn[\s\S]*?text-transform:\s*none/);
  });
});
