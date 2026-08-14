import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '../../../../../../');

function readRepo(relative: string): string {
  return readFileSync(join(repoRoot, relative), 'utf8');
}

describe('PE-02 Brand Projection studio wiring', () => {
  it('projects brand into Client / Manager / Sales without Office or Builder chrome', () => {
    const clientHeader = readRepo(
      'apps/client-studio/src/features/client-studio/ClientStudioHeader.tsx',
    );
    const hero = readRepo(
      'apps/client-studio/src/features/client-studio/sections/Hero/HeroContent.tsx',
    );
    const manager = readRepo(
      'apps/manager-studio/src/components/layout/AppShell.tsx',
    );
    const sales = readRepo('apps/sales-studio/src/SalesStudioApp.tsx');
    const officeApp = readRepo('apps/office-studio/src/OfficeStudioApp.tsx');
    const projection = readRepo(
      'packages/platform-access/src/pilot/projectPartnerBrand.ts',
    );

    assert.match(clientHeader, /projection\.branding\.logoLabel/);
    assert.match(clientHeader, /projection\.partner\.companyName/);
    assert.match(clientHeader, /PartnerBrandMark/);
    assert.doesNotMatch(clientHeader, /AstavLogo/);
    assert.doesNotMatch(clientHeader, /['"]ASTAV['"]/);
    assert.match(hero, /client-partner-hero/);
    assert.match(hero, /projectPartnerBrand/);
    assert.doesNotMatch(hero, /@embed-engine\/runtime/);

    assert.match(manager, /useStudioBrandProjection/);
    assert.match(manager, /partnerBrandLabel/);
    assert.match(sales, /useStudioBrandProjection/);
    assert.match(sales, /sales-partner-brand/);

    assert.doesNotMatch(officeApp, /useStudioBrandProjection/);
    assert.doesNotMatch(officeApp, /partnerBrandLabel/);
    assert.match(projection, /Manager \/ Sales chrome/);
    assert.match(projection, /Client chrome uses/);
    assert.match(projection, /Builder/);
  });
});
