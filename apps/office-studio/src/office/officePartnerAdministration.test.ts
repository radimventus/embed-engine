/**
 * PE-12 — Partner Administration: profile, actions, audit.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  listPartnerTimeline,
  resetOfficeEventCatalogForTests,
} from './officeEventCatalog.ts';
import {
  activatePartnerEnvironment,
  getPartnerEnvironmentRecord,
  resetPartnerEnvironmentLifecycleForTests,
} from './officePartnerEnvironmentLifecycle.ts';
import {
  addPartnerInternalNote,
  buildPartnerAdminProfile,
  changePartnerContact,
  changePartnerLicence,
  changePartnerPackage,
  listPartnerAdminDashboardRows,
  resetPartnerAdministrationForTests,
} from './officePartnerAdministration.ts';
import {
  getPartner,
  resetPartnerRegistryForTests,
} from './officePartnerRegistry.ts';
import { resetSalesRegistryForTests } from './officeSalesRegistry.ts';

describe('PE-12 Partner Administration', () => {
  function resetAll() {
    resetPartnerRegistryForTests();
    resetOfficeEventCatalogForTests();
    resetSalesRegistryForTests();
    resetPartnerEnvironmentLifecycleForTests();
    resetPartnerAdministrationForTests();
  }

  it('builds partner profile and audits package, licence, contact and notes', () => {
    resetAll();
    activatePartnerEnvironment('p-dse', 'pilot');

    const before = buildPartnerAdminProfile('p-dse');
    assert.ok(before !== null);
    assert.equal(before?.packageId, 'pilot');
    assert.equal(before?.packageName, 'Pilot');
    assert.match(before?.licence.label ?? '', /1 dům/);

    changePartnerPackage('p-dse', 'starter');
    assert.equal(buildPartnerAdminProfile('p-dse')?.packageId, 'starter');
    assert.equal(getPartnerEnvironmentRecord('p-dse').packageId, 'starter');
    assert.equal(
      getPartnerEnvironmentRecord('p-dse').packageName,
      'Starter',
    );

    changePartnerLicence('p-dse', 'Custom · 5 domů');
    assert.equal(
      buildPartnerAdminProfile('p-dse')?.licence.label,
      'Custom · 5 domů',
    );
    assert.equal(
      buildPartnerAdminProfile('p-dse')?.licence.source,
      'override',
    );

    changePartnerContact('p-dse', {
      name: 'Nový Kontakt',
      email: 'novy@domysenergii.cz',
      phone: '+420 111 222 333',
      role: 'CTO',
    });
    assert.equal(getPartner('p-dse')?.contact.name, 'Nový Kontakt');
    assert.equal(getPartner('p-dse')?.contact.email, 'novy@domysenergii.cz');

    addPartnerInternalNote('p-dse', 'Sledovat onboarding Sales Studia');
    const profile = buildPartnerAdminProfile('p-dse');
    assert.equal(profile?.notes.length, 1);
    assert.equal(profile?.notes[0]?.text, 'Sledovat onboarding Sales Studia');
    assert.ok((profile?.changeHistory.length ?? 0) >= 4);

    const labels = listPartnerTimeline('p-dse').map((event) => event.label);
    assert.ok(labels.includes('PackageChanged'));
    assert.ok(labels.includes('LicenceChanged'));
    assert.ok(labels.includes('ContactChanged'));
    assert.ok(labels.includes('InternalNoteAdded'));

    const rows = listPartnerAdminDashboardRows();
    assert.ok(rows.some((row) => row.partnerId === 'p-dse'));
    const nord = rows.find((row) => row.partnerId === 'p-dse');
    assert.equal(nord?.packageName, 'Starter');
    assert.equal(nord?.licence, 'Custom · 5 domů');
    assert.equal(nord?.notesCount, 1);
  });

  it('does not delete prior notes when adding another', () => {
    resetAll();
    activatePartnerEnvironment('p-dse', 'starter');
    addPartnerInternalNote('p-dse', 'První');
    addPartnerInternalNote('p-dse', 'Druhá');
    const notes = buildPartnerAdminProfile('p-dse')?.notes ?? [];
    assert.equal(notes.length, 2);
    assert.deepEqual(
      notes.map((item) => item.text),
      ['Druhá', 'První'],
    );
  });
});
