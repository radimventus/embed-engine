import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DSE_CANONICAL_PROJECT_ID,
  DSE_COMPANY_ID,
  DSE_TENANT_ID,
  DSE_WORKSPACE_ID,
} from '../registry/defaults';
import {
  normalizeDurableOfficePartner,
  parseStoredOfficePartner,
} from './officePartnerRecord';
import {
  CANONICAL_DSE_PARTNER_ENVIRONMENT_SCOPE,
  parsePartnerEnvironmentScope,
  partnerEnvironmentScopeMatchesPartner,
  partnerEnvironmentScopesMatch,
} from './partnerEnvironmentScope';

const dseDraft = {
  name: 'Domy s energií',
  status: 'active',
  nextStep: 'Referenční šablona',
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
} as const;

describe('Durable Office Partner Environment scope', () => {
  it('reads a Partner without PE scope as null', () => {
    const partner = parseStoredOfficePartner({
      id: 'p-dse',
      name: dseDraft.name,
      status: dseDraft.status,
      nextStep: dseDraft.nextStep,
      company: dseDraft.company,
      contact: dseDraft.contact,
      createdAt: '2026-08-01T08:00:00.000Z',
      updatedAt: '2026-08-20T10:00:00.000Z',
    });
    assert.ok(partner !== null);
    assert.equal(partner.partnerEnvironmentScope, null);
    assert.equal(partner.id, 'p-dse');
    assert.equal(partner.companyId, DSE_COMPANY_ID);
  });

  it('parses persisted PE scope and ignores malformed scope', () => {
    const stored = parseStoredOfficePartner({
      id: 'partner-x',
      name: 'Nordic Homes',
      status: 'active',
      nextStep: '',
      company: {
        legalName: 'Nordic Homes',
        ico: '',
        city: '',
        country: '',
      },
      contact: {
        name: 'Ana',
        email: 'ana@nordic.example',
        phone: '',
        role: '',
      },
      partnerEnvironmentScope: {
        tenantId: 'tenant-x',
        companyId: 'partner-x',
        workspaceId: 'workspace-x',
        projectId: 'project-x',
      },
      createdAt: '2026-08-01T08:00:00.000Z',
      updatedAt: '2026-08-21T10:00:00.000Z',
    });
    assert.deepEqual(stored?.partnerEnvironmentScope, {
      tenantId: 'tenant-x',
      companyId: 'partner-x',
      workspaceId: 'workspace-x',
      projectId: 'project-x',
    });
    assert.equal(parsePartnerEnvironmentScope({ tenantId: 'tenant-x' }), null);
  });

  it('preserves PE scope when commercial fields are updated', () => {
    const previous = parseStoredOfficePartner({
      id: 'partner-x',
      name: 'Nordic Homes',
      status: 'active',
      nextStep: '',
      company: {
        legalName: 'Nordic Homes',
        ico: '',
        city: 'Oslo',
        country: 'Norsko',
      },
      contact: {
        name: 'Ana',
        email: 'ana@nordic.example',
        phone: '',
        role: '',
      },
      partnerEnvironmentScope: {
        tenantId: 'tenant-x',
        companyId: 'partner-x',
        workspaceId: 'workspace-x',
        projectId: 'project-x',
      },
      createdAt: '2026-08-01T08:00:00.000Z',
      updatedAt: '2026-08-21T10:00:00.000Z',
    });
    assert.ok(previous !== null);
    const updated = normalizeDurableOfficePartner({
      id: previous.id,
      draft: {
        name: 'Nordic Homes AS',
        status: 'active',
        nextStep: 'Provoz',
        company: { ...previous.company, city: 'Bergen' },
        contact: previous.contact,
      },
      previous,
      now: '2026-08-21T12:00:00.000Z',
    });
    assert.equal(updated.name, 'Nordic Homes AS');
    assert.equal(updated.company.city, 'Bergen');
    assert.deepEqual(
      updated.partnerEnvironmentScope,
      previous.partnerEnvironmentScope,
    );
  });

  it('matches exact Partner Environment scope only', () => {
    const authoritative = {
      partnerId: 'partner-x',
      tenantId: 'tenant-x',
      companyId: 'company-x',
      workspaceId: 'workspace-x',
      projectId: 'project-x',
    };
    assert.equal(
      partnerEnvironmentScopesMatch(
        { ...authoritative, companyId: 'forged' },
        authoritative,
      ),
      false,
    );
    assert.equal(partnerEnvironmentScopesMatch(authoritative, authoritative), true);
  });

  it('requires DSE writes to use the canonical seed scope', () => {
    assert.equal(
      partnerEnvironmentScopeMatchesPartner({
        partnerId: 'p-dse',
        partnerCompanyId: DSE_COMPANY_ID,
        scope: CANONICAL_DSE_PARTNER_ENVIRONMENT_SCOPE,
      }),
      true,
    );
    assert.equal(
      partnerEnvironmentScopeMatchesPartner({
        partnerId: 'p-dse',
        partnerCompanyId: DSE_COMPANY_ID,
        scope: {
          tenantId: DSE_TENANT_ID,
          companyId: DSE_COMPANY_ID,
          workspaceId: DSE_WORKSPACE_ID,
          projectId: 'project-forged',
        },
      }),
      false,
    );
    assert.equal(
      partnerEnvironmentScopeMatchesPartner({
        partnerId: 'partner-x',
        partnerCompanyId: 'partner-x',
        scope: {
          tenantId: 'tenant-x',
          companyId: 'other-company',
          workspaceId: 'workspace-x',
          projectId: 'project-x',
        },
      }),
      false,
    );
    assert.equal(CANONICAL_DSE_PARTNER_ENVIRONMENT_SCOPE.projectId, DSE_CANONICAL_PROJECT_ID);
  });
});
