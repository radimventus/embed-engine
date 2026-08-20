import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  projectFooterFromRuntime,
  projectFooterHasContact,
  projectFooterHasContent,
  projectFooterHasIdentity,
} from './projectFooter';

describe('Project footer runtime mapping', () => {
  it('maps the public Partner projection for the active Company', () => {
    const dse = projectFooterFromRuntime({
      companyName: 'Domy s energií',
      legalName: 'Radim Věntus – Domy s energií',
      city: 'Opava',
      country: 'Česko',
      ico: '62288474',
      phone: '+420 725 020 757',
      email: 'kontakt@domysenergii.cz',
    });
    const ac = projectFooterFromRuntime({
      companyName: 'AC Modular',
      legalName: null,
      city: null,
      country: null,
      ico: null,
      phone: null,
      email: null,
    });

    assert.equal(dse.legalName, 'Radim Věntus – Domy s energií');
    assert.equal(dse.address, 'Opava, Česko');
    assert.equal(dse.ico, '62288474');
    assert.equal(dse.phone, '+420 725 020 757');
    assert.equal(dse.email, 'kontakt@domysenergii.cz');
    assert.equal(ac.legalName, 'AC Modular');
    assert.equal(ac.address, null);
    assert.equal(ac.phone, null);
    assert.notEqual(dse.email, ac.email);
    assert.equal(projectFooterHasIdentity(dse), true);
    assert.equal(projectFooterHasContact(dse), true);
    assert.equal(projectFooterHasContact(ac), false);
  });

  it('omits empty optional fields and does not inherit another Company', () => {
    const empty = projectFooterFromRuntime({
      companyName: '  ',
      legalName: ' ',
      city: '',
      country: '',
      ico: '',
      phone: '',
      email: '',
    });
    assert.equal(empty.legalName, null);
    assert.equal(empty.address, null);
    assert.equal(projectFooterHasContent(empty), false);
  });

  it('does not surface CRM contact person or role', () => {
    const source = projectFooterFromRuntime.toString();
    assert.equal(source.includes('contactName'), false);
    assert.equal(source.includes('role'), false);
    const mapped = projectFooterFromRuntime({
      companyName: 'Domy s energií',
      legalName: 'Radim Věntus – Domy s energií',
      city: 'Opava',
      country: 'Česko',
      ico: '62288474',
      phone: '+420 725 020 757',
      email: 'kontakt@domysenergii.cz',
    });
    assert.equal(JSON.stringify(mapped).includes('Majitel'), false);
    assert.equal(JSON.stringify(mapped).includes('"name":"Radim Věntus"'), false);
  });
});
