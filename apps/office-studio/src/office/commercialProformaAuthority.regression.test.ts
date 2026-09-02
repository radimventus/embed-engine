import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

test(
  'commercial proforma uses contractual supplier address',
  async () => {
    const source = await readFile(
      path.join(
        process.cwd(),
        'src/office/commercialPaymentExperience.ts',
      ),
      'utf8',
    );

    assert.match(
      source,
      /746 01 Opava/,
    );

    assert.doesNotMatch(
      source,
      /747 19 Bohuslavice/,
    );
  },
);

test(
  'commercial customer resolver is Office-company scoped and contains no DSE fixture',
  async () => {
    const source = await readFile(
      path.join(
        process.cwd(),
        'src/office/commercialOrderPartnerDetails.ts',
      ),
      'utf8',
    );

    assert.match(
      source,
      /companyId/,
    );

    assert.doesNotMatch(
      source,
      /Domy s energií s\.r\.o\./,
    );

    assert.doesNotMatch(
      source,
      /06123456/,
    );

    assert.doesNotMatch(
      source,
      /Jana Energetická/,
    );
  },
);
