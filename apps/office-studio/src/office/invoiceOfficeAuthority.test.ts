import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import {
  canonicalCompanyIdForOfficePartner,
} from '@embed-engine/platform-access';

import {
  buildCommercialOrderPartnerDetails,
} from './commercialOrderPartnerDetails';

import {
  listPartners,
} from './officePartnerRegistry';

import {
  listOfficeSelectProjects,
} from './pilotWorkspaceModel';

describe('Invoice Office company authority', () => {
  it('uses canonical company identity, never company-name guessing', () => {
    const source = readFileSync(
      new URL('./commercialOrderPartnerDetails.ts', import.meta.url),
      'utf8',
    );

    assert.match(
      source,
      /canonicalCompanyIdForOfficePartner\(item\.id\) === activeCase\.companyId/,
    );

    assert.doesNotMatch(
      source,
      /item\.company\.legalName === activeCase\.companyName/,
    );

    assert.doesNotMatch(
      source,
      /item\.name === activeCase\.partnerName/,
    );

    assert.doesNotMatch(source, /seedIco/);
    assert.doesNotMatch(source, /contactPhoneFallback/);
    assert.doesNotMatch(source, /\|\| 'Praha'/);
    assert.doesNotMatch(source, /`CZ\$\{ico\}`/);
  });

  it('projects billing data for the partner owning the active company scope', () => {
    const partner = listPartners().find(
      (item) =>
        item.company.ico.trim().length > 0 &&
        item.contact.email.includes('@'),
    );

    assert.ok(partner);

    const companyId =
      partner.id.startsWith('company-')
        ? partner.id
        : canonicalCompanyIdForOfficePartner(partner.id);

    const activeCase = listOfficeSelectProjects().find(
      (item) => item.companyId === companyId,
    );

    assert.ok(activeCase);

    const details =
      buildCommercialOrderPartnerDetails(activeCase);

    assert.equal(
      details.companyName,
      partner.company.legalName.trim() || activeCase.companyName,
    );

    assert.equal(
      details.ico,
      partner.company.ico.trim(),
    );

    assert.equal(
      details.email,
      partner.contact.email.trim(),
    );
  });

  it('does not leak another partner into an unmatched company scope', () => {
    const activeCase = listOfficeSelectProjects()[0];

    assert.ok(activeCase);

    const foreignCase = {
      ...activeCase,
      companyId: 'company-does-not-exist',
      companyName: 'Same-looking display name',
      partnerName: 'Same-looking display name',
    };

    const details =
      buildCommercialOrderPartnerDetails(foreignCase);

    assert.equal(details.ico, '');
    assert.equal(details.email, '');
    assert.equal(details.phone, '');
    assert.equal(details.address, '');
  });
});
