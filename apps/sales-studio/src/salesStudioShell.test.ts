import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const salesRoot = join(here, '..');

describe('Sales Studio shell (EPIC-BX-11)', () => {
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
    assert.match(app, /CapabilityInspector/);
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

  it('projects Customer Success capability (EPIC-BX-17)', () => {
    const app = readFileSync(join(salesRoot, 'src/SalesStudioApp.tsx'), 'utf8');
    const pkg = readFileSync(join(salesRoot, 'package.json'), 'utf8');

    assert.match(app, /analyzeCustomerSuccess/);
    assert.match(app, /customer-success/);
    assert.match(pkg, /@embed-engine\/customer-success/);
  });
});
