import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

async function source(file: string): Promise<string> {
  return readFile(
    path.join(process.cwd(), file),
    'utf8',
  );
}

test(
  'Office Company Card persists street address as company authority',
  async () => {
    const model = await source(
      'src/office/officePartnerModel.ts',
    );

    const form = await source(
      'src/features/partners/PartnerFormDialog.tsx',
    );

    const registry = await source(
      'src/office/officePartnerRegistry.ts',
    );

    assert.match(
      model,
      /readonly streetAddress: string/,
    );

    assert.match(
      form,
      /Ulice a číslo/,
    );

    assert.match(
      form,
      /draft\.company\.streetAddress/,
    );

    assert.match(
      registry,
      /streetAddress/,
    );
  },
);

test(
  'proforma customer is composed only from Office Company Card',
  async () => {
    const resolver = await source(
      'src/office/commercialOrderPartnerDetails.ts',
    );

    assert.match(
      resolver,
      /activeCase\.companyId/,
    );

    assert.match(
      resolver,
      /partner\.company\.legalName/,
    );

    assert.match(
      resolver,
      /partner\.company\.ico/,
    );

    assert.match(
      resolver,
      /partner\.company\.streetAddress/,
    );

    assert.match(
      resolver,
      /partner\.company\.city/,
    );

    assert.match(
      resolver,
      /partner\.company\.country/,
    );

    assert.doesNotMatch(
      resolver,
      /Domy s energií s\.r\.o\./,
    );

    assert.doesNotMatch(
      resolver,
      /06123456/,
    );

    assert.doesNotMatch(
      resolver,
      /Praha/,
    );
  },
);

test(
  'Office rerenders after durable partner authority hydrates',
  async () => {
    const app = await source(
      'src/OfficeStudioApp.tsx',
    );

    assert.match(
      app,
      /hydrateOfficePartnersFromServer/,
    );

    assert.match(
      app,
      /setOfficePartnerAuthorityRevision/,
    );

    assert.match(
      app,
      /setOfficePartnerAuthorityRevision\(\(value\) => value \+ 1\)/,
    );
  },
);

test(
  'supplier and payment authority remain untouched',
  async () => {
    const payment = await source(
      'src/office/commercialPaymentExperience.ts',
    );

    assert.match(
      payment,
      /Stratilova 2/,
    );

    assert.match(
      payment,
      /746 01 Opava/,
    );
  },
);
