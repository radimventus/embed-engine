import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  canUseStorage,
  clearOfficeMemoryMirrorForTests,
  loadJson,
  saveJson,
  removeJson,
} from './officeLocalStore.ts';
import { OFFICE_STORAGE_KEYS } from './officeStorageKeys.ts';
import { emptyPartnerDraft } from './officePartnerRegistry.ts';
import {
  createPartner,
  listPartners,
  resetPartnerRegistryForTests,
} from './officePartnerRegistry.ts';
import {
  listRecentOfficeEvents,
  resetOfficeEventCatalogForTests,
} from './officeEventCatalog.ts';
import {
  getSalesCase,
  resetSalesRegistryForTests,
  selectSalesPackage,
} from './officeSalesRegistry.ts';
import {
  getDocumentPackage,
  prepareDocumentPackage,
  resetDocumentRegistryForTests,
} from './officeDocumentRegistry.ts';
import {
  getHandoff,
  receivePayment,
  resetHandoffRegistryForTests,
} from './officeHandoffRegistry.ts';
import {
  activatePartnerEnvironment,
  getPartnerEnvironmentRecord,
  resetPartnerEnvironmentLifecycleForTests,
  suspendPartnerEnvironment,
} from './officePartnerEnvironmentLifecycle.ts';
import {
  addPartnerInternalNote,
  buildPartnerAdminProfile,
  resetPartnerAdministrationForTests,
} from './officePartnerAdministration.ts';

describe('officeLocalStore (OF-10)', () => {
  it('saves, loads, and removes JSON via memory fallback', () => {
    clearOfficeMemoryMirrorForTests();
    const key = 'conis.office.test.v1';
    assert.equal(canUseStorage(), typeof localStorage !== 'undefined');
    assert.equal(loadJson(key, 'fallback'), 'fallback');
    saveJson(key, { ok: true, n: 1 });
    assert.deepEqual(loadJson(key, null), { ok: true, n: 1 });
    removeJson(key);
    assert.equal(loadJson(key, 'gone'), 'gone');
  });

  it('exposes the unified Office STORAGE_KEY convention', () => {
    assert.equal(OFFICE_STORAGE_KEYS.partners, 'conis.office.partners.v1');
    assert.equal(OFFICE_STORAGE_KEYS.sales, 'conis.office.sales.v1');
    assert.equal(OFFICE_STORAGE_KEYS.documents, 'conis.office.documents.v1');
    assert.equal(OFFICE_STORAGE_KEYS.events, 'conis.office.events.v1');
    assert.equal(OFFICE_STORAGE_KEYS.handoffs, 'conis.office.handoffs.v1');
    assert.equal(OFFICE_STORAGE_KEYS.lifecycle, 'conis.office.lifecycle.v1');
    assert.equal(
      OFFICE_STORAGE_KEYS.administration,
      'conis.office.administration.v1',
    );
  });
});

describe('office persistence registries (OF-10)', () => {
  function resetAll(): void {
    resetPartnerRegistryForTests();
    resetOfficeEventCatalogForTests();
    resetSalesRegistryForTests();
    resetDocumentRegistryForTests();
    resetHandoffRegistryForTests();
    resetPartnerEnvironmentLifecycleForTests();
    resetPartnerAdministrationForTests();
  }

  it('persists partner, sales, documents, and timeline to storage keys', () => {
    resetAll();

    const created = createPartner({
      ...emptyPartnerDraft(),
      name: 'Persist Partner',
      contact: {
        name: 'Pera',
        email: 'pera@persist.cz',
        phone: '+420 777 000 111',
        role: 'CEO',
      },
      company: {
        legalName: 'Persist s.r.o.',
        ico: '99887766',
        streetAddress: '',
        city: 'Brno',
        country: 'Česko',
      },
    });

    assert.ok(listPartners().some((partner) => partner.id === created.id));
    assert.equal(
      loadJson(OFFICE_STORAGE_KEYS.partners, null),
      null,
      'Office Partner memory cache is not a durable localStorage authority',
    );

    selectSalesPackage(created.id, 'pilot');
    const salesStored = loadJson<{
      cases: readonly {
        partnerId: string;
        offer: { packageId: string | null };
      }[];
    } | null>(OFFICE_STORAGE_KEYS.sales, null);
    assert.ok(salesStored !== null);
    assert.equal(getSalesCase(created.id)?.offer.packageId, 'pilot');
    assert.ok(
      salesStored!.cases.some(
        (entry) =>
          entry.partnerId === created.id &&
          entry.offer.packageId === 'pilot',
      ),
    );

    prepareDocumentPackage(created.id);
    const docsStored = loadJson<{
      packages: readonly { partnerId: string }[];
    } | null>(OFFICE_STORAGE_KEYS.documents, null);
    assert.ok(getDocumentPackage(created.id) !== null);
    assert.ok(
      docsStored?.packages.some((entry) => entry.partnerId === created.id),
    );

    const eventsStored = loadJson<{
      events: readonly { partnerId: string | null; kind: string }[];
    } | null>(OFFICE_STORAGE_KEYS.events, null);
    assert.ok(eventsStored !== null);
    assert.ok(
      eventsStored!.events.some(
        (event) =>
          event.partnerId === created.id && event.kind === 'partner.created',
      ),
    );
    assert.ok(
      listRecentOfficeEvents(50).some(
        (event) =>
          event.partnerId === created.id && event.kind === 'partner.created',
      ),
    );
  });

  it('persists lifecycle and administration state', () => {
    resetAll();

    activatePartnerEnvironment('p-dse', 'pilot');
    suspendPartnerEnvironment('p-dse', 'OF-10 persistence check');

    const lifecycleStored = loadJson<{
      byPartnerId: Record<string, { lifecycleStatus: string | null }>;
    } | null>(OFFICE_STORAGE_KEYS.lifecycle, null);
    assert.ok(lifecycleStored !== null);
    assert.equal(
      getPartnerEnvironmentRecord('p-dse').lifecycleStatus,
      'suspended',
    );
    assert.equal(
      lifecycleStored!.byPartnerId['p-dse']?.lifecycleStatus,
      'suspended',
    );

    addPartnerInternalNote('p-dse', 'Persisted admin note');
    const adminStored = loadJson<{
      byPartnerId: Record<string, { notes: readonly { text: string }[] }>;
    } | null>(OFFICE_STORAGE_KEYS.administration, null);
    assert.ok(adminStored !== null);
    assert.ok(
      buildPartnerAdminProfile('p-dse')?.notes.some(
        (note) => note.text === 'Persisted admin note',
      ),
    );
    assert.ok(
      adminStored!.byPartnerId['p-dse']?.notes.some(
        (note) => note.text === 'Persisted admin note',
      ),
    );
  });

  it('persists handoff after payment mutation', () => {
    resetAll();

    selectSalesPackage('p-dse', 'pilot');
    // Payment path creates/updates handoff and writes STORAGE_KEY.
    const summary = receivePayment('p-dse');
    assert.ok(summary !== null);
    assert.equal(summary?.status, 'builder_ready');
    assert.equal(getHandoff('p-dse')?.status, 'builder_ready');

    const handoffsStored = loadJson<{
      handoffs: readonly { partnerId: string; status: string }[];
    } | null>(OFFICE_STORAGE_KEYS.handoffs, null);
    assert.ok(handoffsStored !== null);
    assert.ok(
      handoffsStored!.handoffs.some(
        (entry) =>
          entry.partnerId === 'p-dse' && entry.status === 'builder_ready',
      ),
    );
  });
});
