import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

function read(relative: string): string {
  return readFileSync(join(here, relative), 'utf8');
}

test(
  'Commercial Journey cannot consume seed customer before durable Partner hydration',
  () => {
    const context = read('./PilotWorkspaceContext.tsx');
    const resolver = read('./commercialOrderPartnerDetails.ts');
    const complete = read(
      '../features/pilot-workspace/terminal/CompleteOrderScreen.tsx',
    );
    const payment = read(
      '../features/pilot-workspace/terminal/PaymentScreen.tsx',
    );

    assert.match(
      context,
      /const \[partnerAuthorityReady, setPartnerAuthorityReady\] = useState\(false\)/,
    );

    assert.match(
      context,
      /setPartnerAuthorityReady\(true\)/,
    );

    assert.match(
      complete,
      /partnerAuthorityReady[\s\S]*\? buildCommercialOrderPartnerDetails\(activeCase\)[\s\S]*: null/,
    );

    assert.match(
      complete,
      /data-cj-customer-authority="loading"/,
    );

    assert.match(
      payment,
      /partnerAuthorityReady[\s\S]*\? buildCommercialProformaForCase\(activeCase\)[\s\S]*: null/,
    );

    assert.match(
      payment,
      /data-cj-customer-authority="loading"/,
    );

    // Resolver stays a pure projection of Office Partner registry.
    // Readiness belongs to the runtime consumers, not to invoice/domain helpers.
    assert.doesNotMatch(
      resolver,
      /partnerAuthorityReady|isOfficePartnerServerAuthority/,
    );

    assert.doesNotMatch(
      resolver,
      /06123456|Domy s energií s\.r\.o\.|Praha/,
    );
  },
);
