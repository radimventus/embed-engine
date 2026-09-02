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
  'durable Office Partner response becomes customer authority before canonical sync',
  () => {
    const registry = read('./officePartnerRegistry.ts');

    const remote =
      registry.indexOf('const remote = await requestOfficePartners();');

    const replace =
      registry.indexOf('replaceMemory(remotePartners);');

    const durable =
      registry.indexOf('dropLocalPartnerAuthority();', replace);

    const canonical =
      registry.indexOf(
        'await ensureOfficePartnerCanonicalAuthority(partner);',
        replace,
      );

    const sync =
      registry.indexOf(
        'await syncCanonicalRegistryFromAuthority();',
        replace,
      );

    assert.ok(remote >= 0);
    assert.ok(replace > remote);
    assert.ok(durable > replace);
    assert.ok(canonical > durable);
    assert.ok(sync > canonical);

    // Secondary canonical synchronization must be detached from the durable
    // Office Partner hydration promise.
    assert.match(
      registry,
      /void \(async \(\) => \{/,
    );
  },
);
