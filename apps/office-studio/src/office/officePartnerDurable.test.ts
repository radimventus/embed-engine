import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DSE_COMPANY_ID, resetCompanyRegistryExtras } from '@embed-engine/platform-access';

import {
  draftFromPartner,
  getPartner,
  hydrateOfficePartnersFromServer,
  isOfficePartnerServerAuthority,
  listPartners,
  persistUpdatedPartner,
  resetPartnerRegistryForTests,
} from './officePartnerRegistry.ts';
import { OFFICE_STORAGE_KEYS } from './officeStorageKeys.ts';
import { loadJson, saveJson } from './officeLocalStore.ts';
import { canonicalPartnerIdForOfficePartner } from './officeReferencePartner.ts';

const dseDraft = {
  name: 'Domy s energií',
  status: 'active' as const,
  nextStep: 'Referenční šablona · Reference House',
  company: {
    legalName: 'Radim Věntus – Domy s energií',
    ico: '62288474',
    streetAddress: '',
    city: 'Opava',
    country: 'Česko',
  },
  contact: {
    name: 'Radim Věntus',
    email: 'kontakt@domysenergii.cz',
    phone: '+420 725 020 757',
    role: 'Majitel',
  },
};

describe('Office Partner durable SSOT (TASK 49G)', () => {
  it('maps existing Office fields onto the Partner form model', () => {
    resetPartnerRegistryForTests();
    const partner = getPartner('p-dse');
    assert.ok(partner !== undefined);
    const draft = draftFromPartner(partner!);
    assert.equal(draft.name, partner!.name);
    assert.equal(draft.status, partner!.status);
    assert.equal(draft.nextStep, partner!.nextStep);
    assert.deepEqual(draft.company, partner!.company);
    assert.deepEqual(draft.contact, partner!.contact);
    assert.equal(canonicalPartnerIdForOfficePartner(partner!.id), DSE_COMPANY_ID);
  });

  it('hydrates server records, migrates local data once, then drops local authority', async () => {
    resetPartnerRegistryForTests();
    resetCompanyRegistryExtras();
    saveJson(OFFICE_STORAGE_KEYS.partners, {
      partners: [
        {
          id: 'p-dse',
          ...dseDraft,
          createdAt: '2026-08-01T08:00:00.000Z',
          updatedAt: '2026-08-20T10:00:00.000Z',
        },
      ],
      idSeq: 100,
    });

    const stored = {
      partners: [
        {
          id: 'p-dse',
          companyId: DSE_COMPANY_ID,
          ...dseDraft,
          createdAt: '2026-08-01T08:00:00.000Z',
          updatedAt: '2026-08-20T10:00:00.000Z',
        },
      ],
    };

    const originalFetch = globalThis.fetch;
    let listed = false;
    let created = false;
    const writes: unknown[] = [];
    globalThis.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.endsWith('/office/partners') && (init?.method === undefined || init.method === 'GET')) {
        if (!listed) {
          listed = true;
          return new Response(JSON.stringify({ partners: [] }), { status: 200 });
        }
        return new Response(JSON.stringify(stored), { status: 200 });
      }
      if (url.endsWith('/office/partners/p-dse') && init?.method === 'PUT') {
        if (!created) {
          return new Response(JSON.stringify({ error: 'Partner neexistuje.' }), {
            status: 404,
          });
        }
        writes.push(JSON.parse(String(init.body)));
        return new Response(
          JSON.stringify({
            id: 'p-dse',
            companyId: DSE_COMPANY_ID,
            ...dseDraft,
            createdAt: '2026-08-01T08:00:00.000Z',
            updatedAt: '2026-08-20T10:00:00.000Z',
          }),
          { status: 200 },
        );
      }
      if (url.endsWith('/office/partners') && init?.method === 'POST') {
        created = true;
        writes.push(JSON.parse(String(init.body)));
        return new Response(
          JSON.stringify({
            id: 'p-dse',
            companyId: DSE_COMPANY_ID,
            ...dseDraft,
            createdAt: '2026-08-01T08:00:00.000Z',
            updatedAt: '2026-08-20T10:00:00.000Z',
          }),
          { status: 201 },
        );
      }
      return new Response(null, { status: 404 });
    };

    try {
      await hydrateOfficePartnersFromServer();
      const partner = getPartner('p-dse');
      assert.equal(partner?.company.legalName, 'Radim Věntus – Domy s energií');
      assert.equal(partner?.company.ico, '62288474');
      assert.equal(partner?.contact.email, 'kontakt@domysenergii.cz');
      assert.equal(isOfficePartnerServerAuthority(), true);
      assert.equal(loadJson(OFFICE_STORAGE_KEYS.partners, null), null);
      assert.ok(writes.length >= 1);

      const saved = await persistUpdatedPartner('p-dse', dseDraft);
      assert.equal(saved.company.city, 'Opava');
    } finally {
      globalThis.fetch = originalFetch;
      resetPartnerRegistryForTests();
    }
  });

  it('preserves entered values when save fails', async () => {
    resetPartnerRegistryForTests();
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: 'Neplatný partner.' }), {
        status: 400,
      });
    try {
      await assert.rejects(
        () => persistUpdatedPartner('p-dse', dseDraft),
        /Neplatný partner/,
      );
      assert.equal(listPartners().some((partner) => partner.id === 'p-dse'), true);
    } finally {
      globalThis.fetch = originalFetch;
      resetPartnerRegistryForTests();
    }
  });
});
