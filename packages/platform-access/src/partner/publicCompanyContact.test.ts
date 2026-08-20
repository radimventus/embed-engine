import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DSE_COMPANY_ID, DEFAULT_COMPANY_ID } from '../registry/defaults';
import { canonicalCompanyIdForOfficePartner } from './canonicalOfficePartner';
import { normalizeDurableOfficePartner } from './officePartnerRecord';
import { projectPublicCompanyContact } from './publicCompanyContact';

const dse = normalizeDurableOfficePartner({
  id: 'p-dse',
  draft: {
    name: 'Domy s energií',
    status: 'active',
    nextStep: 'Referenční šablona · Reference House',
    company: {
      legalName: 'Radim Věntus – Domy s energií',
      ico: '62288474',
      city: 'Opava',
      country: 'Česko',
    },
    contact: {
      name: 'Radim Věntus',
      email: 'kontakt@domysenergii.cz',
      phone: '+420 725 020 757',
      role: 'Majitel',
    },
  },
  now: '2026-08-20T10:00:00.000Z',
});

describe('Public Company contact projection', () => {
  it('maps Office Partner identity through canonical Company id', () => {
    assert.equal(canonicalCompanyIdForOfficePartner('p-dse'), DSE_COMPANY_ID);
    assert.equal(canonicalCompanyIdForOfficePartner(DSE_COMPANY_ID), DSE_COMPANY_ID);
    assert.equal(
      canonicalCompanyIdForOfficePartner(DEFAULT_COMPANY_ID),
      DEFAULT_COMPANY_ID,
    );
  });

  it('projects the public subset and excludes CRM / workflow fields', () => {
    const publicContact = projectPublicCompanyContact({
      companyId: DSE_COMPANY_ID,
      displayName: 'Domy s energií',
      partner: dse,
    });

    assert.equal(publicContact.companyId, DSE_COMPANY_ID);
    assert.equal(publicContact.displayName, 'Domy s energií');
    assert.equal(publicContact.legalName, 'Radim Věntus – Domy s energií');
    assert.equal(publicContact.ico, '62288474');
    assert.equal(publicContact.city, 'Opava');
    assert.equal(publicContact.country, 'Česko');
    assert.equal(publicContact.email, 'kontakt@domysenergii.cz');
    assert.equal(publicContact.phone, '+420 725 020 757');

    const serialized = JSON.stringify(publicContact);
    assert.equal(serialized.includes('Majitel'), false);
    assert.equal(serialized.includes('active'), false);
    assert.equal(serialized.includes('Referenční šablona'), false);
    assert.equal(serialized.includes('"name":"Radim Věntus"'), false);
    assert.equal('status' in publicContact, false);
    assert.equal('nextStep' in publicContact, false);
    assert.equal('contact' in publicContact, false);
  });

  it('does not inherit another Company when Partner data is absent', () => {
    const empty = projectPublicCompanyContact({
      companyId: DEFAULT_COMPANY_ID,
      displayName: 'AC Modular',
      partner: null,
    });
    assert.equal(empty.companyId, DEFAULT_COMPANY_ID);
    assert.equal(empty.legalName, null);
    assert.equal(empty.email, null);
    assert.equal(empty.phone, null);
    assert.notEqual(empty.email, dse.contact.email);
  });
});
