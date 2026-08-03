import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  listPartnerTimeline,
  resetOfficeEventCatalogForTests,
} from './officeEventCatalog.ts';
import {
  confirmClickWrap,
  getDocumentPackage,
  issueProforma,
  prepareDocumentPackage,
  resetDocumentRegistryForTests,
  sendDocumentPackage,
} from './officeDocumentRegistry.ts';
import { resetPartnerRegistryForTests } from './officePartnerRegistry.ts';
import { resetSalesRegistryForTests } from './officeSalesRegistry.ts';

describe('officeDocumentRegistry (OF-04)', () => {
  it('prepares Document Center package and records DocumentsPrepared', () => {
    resetPartnerRegistryForTests();
    resetOfficeEventCatalogForTests();
    resetSalesRegistryForTests();
    resetDocumentRegistryForTests();

    const pack = prepareDocumentPackage('p-dse');
    assert.ok(pack !== null);
    assert.equal(pack?.status, 'prepared');
    assert.ok((pack?.documents.length ?? 0) >= 5);
    assert.ok(
      pack?.documents.some((doc) => doc.type === 'offer'),
    );
    assert.ok(
      pack?.documents.some((doc) => doc.type === 'framework'),
    );
    assert.ok(
      listPartnerTimeline('p-dse').some(
        (event) => event.kind === 'documents.prepared',
      ),
    );
  });

  it('runs Email Delivery, Click-wrap and ProformaIssued', () => {
    resetPartnerRegistryForTests();
    resetOfficeEventCatalogForTests();
    resetSalesRegistryForTests();
    resetDocumentRegistryForTests();

    prepareDocumentPackage('p-dse');
    sendDocumentPackage('p-dse', 'partner@domysenergii.cz');
    assert.equal(getDocumentPackage('p-dse')?.status, 'sent');
    assert.equal(getDocumentPackage('p-dse')?.emailTo, 'partner@domysenergii.cz');
    assert.ok(
      listPartnerTimeline('p-dse').some(
        (event) => event.kind === 'documents.sent',
      ),
    );

    confirmClickWrap('p-dse');
    assert.equal(
      getDocumentPackage('p-dse')?.status,
      'clickwrap_confirmed',
    );
    assert.ok(
      listPartnerTimeline('p-dse').some(
        (event) => event.kind === 'clickwrap.confirmed',
      ),
    );

    issueProforma('p-dse');
    const pack = getDocumentPackage('p-dse');
    assert.equal(pack?.status, 'proforma_issued');
    assert.ok(pack?.proforma !== null);
    assert.match(pack?.proforma?.number ?? '', /^PF-/);
    assert.ok(
      pack?.documents.some(
        (doc) => doc.type === 'proforma' && doc.status === 'issued',
      ),
    );
    assert.ok(
      listPartnerTimeline('p-dse').some(
        (event) => event.kind === 'proforma.issued',
      ),
    );
  });
});
