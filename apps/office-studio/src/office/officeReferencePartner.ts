/**
 * OF-11 — Canonical Office reference partner + project template.
 * Single production seed. Legacy demo partners live only as test fixtures.
 */

import {
  DSE_COMPANY_ID,
  OFFICE_REFERENCE_PARTNER_ID as SHARED_OFFICE_REFERENCE_PARTNER_ID,
  canonicalCompanyIdForOfficePartner,
} from '@embed-engine/platform-access';

import type { OfficePartner } from './officePartnerModel';

export const OFFICE_REFERENCE_PARTNER_ID = SHARED_OFFICE_REFERENCE_PARTNER_ID;
/** Legacy Office identifier; DSE runtime scope is always this canonical Partner. */
export const OFFICE_REFERENCE_CANONICAL_PARTNER_ID = DSE_COMPANY_ID;

export const OFFICE_REFERENCE_PARTNER_NAME = 'Domy s energií' as const;

/** Same label as platform CONIS_SAMPLE_PROJECT_LABEL — Reference House. */
export const OFFICE_REFERENCE_PROJECT_LABEL = 'Reference House' as const;

/** Platform IDs from provisionPilotWorkspace("Domy s energií"). */
export const OFFICE_REFERENCE_PLATFORM_IDS = Object.freeze({
  companyId: 'company-domy-s-energii',
  tenantId: 'tenant-domy-s-energii',
  workspaceId: 'domy-s-energii-main',
  projectId: 'project-domy-s-energii',
  objectId:
    'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
});

export const OFFICE_REFERENCE_CONTACT_EMAIL =
  'partner@domysenergii.cz' as const;

/** Production website of the reference partner (PT-CJ-00 PDF personalization). */
export const OFFICE_REFERENCE_WEBSITE_URL =
  'https://www.domysenergii.cz' as const;

/** PT-CJ-00 — preset partner Studio password after sales meeting. */
export const PILOT_DELIVERY_PASSWORD = 'conis' as const;

/** Compatibility mapping only — never creates a second runtime Partner. */
export function canonicalPartnerIdForOfficePartner(partnerId: string): string {
  return canonicalCompanyIdForOfficePartner(partnerId);
}

export function brandingLabelsForPartner(firmName: string): {
  readonly logoLabel: string;
  readonly heroLabel: string;
} {
  const name = firmName.trim() || OFFICE_REFERENCE_PARTNER_NAME;
  return {
    logoLabel: `${name} Logo`,
    heroLabel: `${name} · ${OFFICE_REFERENCE_PROJECT_LABEL} Hero`,
  };
}

export function buildOfficeReferencePartner(): OfficePartner {
  return {
    id: OFFICE_REFERENCE_PARTNER_ID,
    name: OFFICE_REFERENCE_PARTNER_NAME,
    status: 'active',
    nextStep: 'Referenční šablona · Reference House',
    company: {
      legalName: 'Domy s energií s.r.o.',
      ico: '06123456',
      city: 'Praha',
      country: 'Česko',
    },
    contact: {
      name: 'Jana Energetická',
      email: OFFICE_REFERENCE_CONTACT_EMAIL,
      phone: '+420 777 200 300',
      role: 'Jednatelka',
    },
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-03T12:00:00.000Z',
  };
}

/**
 * Former Office demo partners — not used in production seed (OF-11).
 * Available for isolated tests that need multi-partner fixtures.
 */
export const LEGACY_OFFICE_DEMO_PARTNERS: readonly OfficePartner[] =
  Object.freeze([
    {
      id: 'p-blokki',
      name: 'Blokki',
      status: 'implementation',
      nextStep: 'Dokončit Builder handoff',
      company: {
        legalName: 'Blokki s.r.o.',
        ico: '08911234',
        city: 'Praha',
        country: 'Česko',
      },
      contact: {
        name: 'Jan Blok',
        email: 'jan@blokki.cz',
        phone: '+420 777 100 200',
        role: 'Jednatel',
      },
      createdAt: '2026-08-02T09:12:00.000Z',
      updatedAt: '2026-08-03T07:05:00.000Z',
    },
    {
      id: 'p-nord',
      name: 'Nordhaus',
      status: 'offer',
      nextStep: 'Sledovat odpověď na nabídku',
      company: {
        legalName: 'Nordhaus CZ a.s.',
        ico: '04567890',
        city: 'Brno',
        country: 'Česko',
      },
      contact: {
        name: 'Eva Nord',
        email: 'eva@nordhaus.cz',
        phone: '+420 602 333 444',
        role: 'Obchodní ředitelka',
      },
      createdAt: '2026-07-28T10:00:00.000Z',
      updatedAt: '2026-08-02T11:40:00.000Z',
    },
    {
      id: 'p-linea',
      name: 'Linea Domů',
      status: 'payment',
      nextStep: 'Potvrdit přijetí platby',
      company: {
        legalName: 'Linea Domů s.r.o.',
        ico: '12345098',
        city: 'Ostrava',
        country: 'Česko',
      },
      contact: {
        name: 'Petr Linea',
        email: 'petr@lineadomu.cz',
        phone: '+420 731 555 666',
        role: 'CEO',
      },
      createdAt: '2026-07-20T08:30:00.000Z',
      updatedAt: '2026-08-02T16:22:00.000Z',
    },
  ]);
