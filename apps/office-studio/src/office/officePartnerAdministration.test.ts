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
    activatePartnerEnvironment('p-nord', 'pilot');

    const before = buildPartnerAdminProfile('p-nord');
    assert.ok(before !== null);
    assert.equal(before?.packageId, 'pilot');
    assert.equal(before?.packageName, 'Pilot');
    assert.match(before?.licence.label ?? '', /1 dům/);

    changePartnerPackage('p-nord', 'starter');
    assert.equal(buildPartnerAdminProfile('p-nord')?.packageId, 'starter');
    assert.equal(getPartnerEnvironmentRecord('p-nord').packageId, 'starter');
    assert.equal(
      getPartnerEnvironmentRecord('p-nord').packageName,
      'Starter',
    );

    changePartnerLicence('p-nord', 'Custom · 5 domů');
    assert.equal(
      buildPartnerAdminProfile('p-nord')?.licence.label,
      'Custom · 5 domů',
    );
    assert.equal(
      buildPartnerAdminProfile('p-nord')?.licence.source,
      'override',
    );

    changePartnerContact('p-nord', {
      name: 'Nový Kontakt',
      email: 'novy@nordhaus.cz',
      phone: '+420 111 222 333',
      role: 'CTO',
    });
    assert.equal(getPartner('p-nord')?.contact.name, 'Nový Kontakt');
    assert.equal(getPartner('p-nord')?.contact.email, 'novy@nordhaus.cz');

    addPartnerInternalNote('p-nord', 'Sledovat onboarding Sales Studia');
    const profile = buildPartnerAdminProfile('p-nord');
    assert.equal(profile?.notes.length, 1);
    assert.equal(profile?.notes[0]?.text, 'Sledovat onboarding Sales Studia');
    assert.ok((profile?.changeHistory.length ?? 0) >= 4);

    const labels = listPartnerTimeline('p-nord').map((event) => event.label);
    assert.ok(labels.includes('PackageChanged'));
    assert.ok(labels.includes('LicenceChanged'));
    assert.ok(labels.includes('ContactChanged'));
    assert.ok(labels.includes('InternalNoteAdded'));

    const rows = listPartnerAdminDashboardRows();
    assert.ok(rows.some((row) => row.partnerId === 'p-nord'));
    const nord = rows.find((row) => row.partnerId === 'p-nord');
    assert.equal(nord?.packageName, 'Starter');
    assert.equal(nord?.licence, 'Custom · 5 domů');
    assert.equal(nord?.notesCount, 1);
  });

  it('does not delete prior notes when adding another', () => {
    resetAll();
    activatePartnerEnvironment('p-nord', 'starter');
    addPartnerInternalNote('p-nord', 'První');
    addPartnerInternalNote('p-nord', 'Druhá');
    const notes = buildPartnerAdminProfile('p-nord')?.notes ?? [];
    assert.equal(notes.length, 2);
    assert.deepEqual(
      notes.map((item) => item.text),
      ['Druhá', 'První'],
    );
  });
});
