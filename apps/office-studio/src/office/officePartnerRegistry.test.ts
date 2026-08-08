import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  findCompany,
  findWorkspace,
  getDefaultCompanyRegistry,
  resetCompanyRegistryExtras,
} from '@embed-engine/platform-access';

import { filterPartners } from './officePartnerFilters.ts';
import { emptyPartnerDraft } from './officePartnerRegistry.ts';
import {
  applyPartnerQuickAction,
  createPartner,
  listPartners,
  resetPartnerRegistryForTests,
  updatePartner,
} from './officePartnerRegistry.ts';
import {
  listPartnerTimeline,
  resetOfficeEventCatalogForTests,
} from './officeEventCatalog.ts';

describe('officePartnerRegistry (OF-02)', () => {
  it('seeds Partner Registry and supports create / update', () => {
    resetPartnerRegistryForTests();
    resetOfficeEventCatalogForTests();
    resetCompanyRegistryExtras();

    const before = listPartners().length;
    const created = createPartner({
      ...emptyPartnerDraft(),
      name: 'Acme Domů',
      contact: {
        name: 'Anna Acme',
        email: 'anna@acme.cz',
        phone: '+420 111 222 333',
        role: 'Jednatelka',
      },
      company: {
        legalName: 'Acme Domů s.r.o.',
        ico: '11223344',
        city: 'Plzeň',
        country: 'Česko',
      },
    });

    assert.equal(listPartners().length, before + 1);
    assert.equal(created.name, 'Acme Domů');
    const canonical = getDefaultCompanyRegistry();
    assert.equal(created.id, 'company-acme-domu');
    assert.equal(findCompany(canonical, created.id)?.name, 'Acme Domů');
    assert.equal(
      findWorkspace(canonical, 'workspace-acme-domu')?.companyId,
      created.id,
    );
    assert.ok(
      listPartnerTimeline(created.id).some(
        (event) => event.kind === 'partner.created',
      ),
    );

    const updated = updatePartner(created.id, {
      ...emptyPartnerDraft(),
      name: 'Acme Domů+',
      status: 'offer',
      nextStep: 'Sledovat odpověď',
      company: created.company,
      contact: { ...created.contact, role: 'CEO' },
    });
    assert.ok(updated !== null);
    assert.equal(updated?.name, 'Acme Domů+');
    assert.equal(updated?.status, 'offer');
    assert.ok(
      listPartnerTimeline(created.id).some(
        (event) => event.kind === 'partner.updated',
      ),
    );
  });

  it('applies Quick Actions and appends timeline events', () => {
    resetPartnerRegistryForTests();
    resetOfficeEventCatalogForTests();

    const partner = listPartners().find((entry) => entry.id === 'p-dse');
    assert.ok(partner !== undefined);
    const updated = applyPartnerQuickAction(partner!.id, 'confirm-order');
    assert.equal(updated?.status, 'order');
    assert.ok(
      listPartnerTimeline(partner!.id).some(
        (event) => event.kind === 'order.confirmed',
      ),
    );
  });

  it('filters partners by query and status', () => {
    resetPartnerRegistryForTests();
    const all = listPartners();
    assert.equal(all.length, 1);
    const byName = filterPartners(all, 'energi', 'all');
    assert.equal(byName.length, 1);
    assert.equal(byName[0]?.id, 'p-dse');

    const byStatus = filterPartners(all, '', 'active');
    assert.equal(byStatus.length, 1);
    assert.equal(byStatus[0]?.id, 'p-dse');
  });
});
