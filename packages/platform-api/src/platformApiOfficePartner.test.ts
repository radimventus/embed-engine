import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';

import {
  DEFAULT_COMPANY_ID,
  DSE_COMPANY_ID,
  projectPublicCompanyContact,
  resetCompanyRegistryExtras,
} from '@embed-engine/platform-access';

import { createPlatformApiServer } from './index.ts';
import { FileOfficePartnerRepository } from './officePartnerRepository.ts';

const dseDraft = {
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
} as const;

const identities = new Map([
  [
    'session-admin',
    {
      companyId: DSE_COMPANY_ID,
      user: { roles: ['conis-admin'] },
      workspaceContext: { companyId: DSE_COMPANY_ID },
    },
  ],
  [
    'session-dse-admin',
    {
      companyId: DSE_COMPANY_ID,
      user: { roles: ['project-admin'] },
      workspaceContext: { companyId: DSE_COMPANY_ID },
    },
  ],
  [
    'session-ac',
    {
      companyId: DEFAULT_COMPANY_ID,
      user: { roles: ['project-admin'] },
      workspaceContext: { companyId: DEFAULT_COMPANY_ID },
    },
  ],
  [
    'session-manager',
    {
      companyId: DSE_COMPANY_ID,
      user: { roles: ['manager'] },
      workspaceContext: { companyId: DSE_COMPANY_ID },
    },
  ],
]);

const partnerSessions = {
  resolve: async (token: string) => identities.get(token) ?? null,
};

describe('Platform API Office Partner', () => {
  let directory = '';
  let repository: FileOfficePartnerRepository;
  let baseUrl = '';
  let server: ReturnType<typeof createPlatformApiServer>;

  before(async () => {
    resetCompanyRegistryExtras();
    directory = await mkdtemp(join(tmpdir(), 'conis-office-partner-api-'));
    repository = new FileOfficePartnerRepository(
      join(directory, 'office-partners.json'),
    );
    await repository.create({ id: 'p-dse', draft: dseDraft });
    server = createPlatformApiServer(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      partnerSessions as never,
      undefined,
      undefined,
      undefined,
      undefined,
      repository,
    );
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    assert.ok(address !== null && typeof address !== 'string');
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error === undefined ? resolve() : reject(error)));
    });
    await rm(directory, { recursive: true, force: true });
    resetCompanyRegistryExtras();
  });

  it('reads authorized Office Partner records', async () => {
    const response = await fetch(`${baseUrl}/office/partners/p-dse`, {
      headers: { cookie: '__Host-conis_partner_session=session-admin' },
    });
    assert.equal(response.status, 200);
    const body = (await response.json()) as { id: string; companyId: string };
    assert.equal(body.id, 'p-dse');
    assert.equal(body.companyId, DSE_COMPANY_ID);
  });

  it('updates authorized Office Partner records after durable persistence', async () => {
    const response = await fetch(`${baseUrl}/office/partners/p-dse`, {
      method: 'PUT',
      headers: {
        cookie: '__Host-conis_partner_session=session-admin',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        ...dseDraft,
        company: { ...dseDraft.company, city: 'Opava' },
      }),
    });
    assert.equal(response.status, 200);
    const body = (await response.json()) as {
      company: { city: string };
    };
    assert.equal(body.company.city, 'Opava');
    const readback = await repository.get('p-dse');
    assert.equal(readback?.company.city, 'Opava');
  });

  it('rejects unauthenticated writes', async () => {
    const response = await fetch(`${baseUrl}/office/partners/p-dse`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(dseDraft),
    });
    assert.equal(response.status, 401);
  });

  it('rejects Manager writes and foreign Company scope', async () => {
    const manager = await fetch(`${baseUrl}/office/partners/p-dse`, {
      method: 'PUT',
      headers: {
        cookie: '__Host-conis_partner_session=session-manager',
        'content-type': 'application/json',
      },
      body: JSON.stringify(dseDraft),
    });
    assert.equal(manager.status, 403);

    const foreign = await fetch(`${baseUrl}/office/partners/p-dse`, {
      method: 'PUT',
      headers: {
        cookie: '__Host-conis_partner_session=session-ac',
        'content-type': 'application/json',
      },
      body: JSON.stringify(dseDraft),
    });
    assert.equal(foreign.status, 403);
  });

  it('rejects unknown Partner updates', async () => {
    const response = await fetch(`${baseUrl}/office/partners/p-unknown`, {
      method: 'PUT',
      headers: {
        cookie: '__Host-conis_partner_session=session-admin',
        'content-type': 'application/json',
      },
      body: JSON.stringify(dseDraft),
    });
    assert.equal(response.status, 404);
  });

  it('rejects malformed email before persistence', async () => {
    const before = await repository.get('p-dse');
    const response = await fetch(`${baseUrl}/office/partners/p-dse`, {
      method: 'PUT',
      headers: {
        cookie: '__Host-conis_partner_session=session-admin',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        ...dseDraft,
        contact: { ...dseDraft.contact, email: 'bad' },
      }),
    });
    assert.equal(response.status, 400);
    assert.equal((await repository.get('p-dse'))?.contact.email, before?.contact.email);
  });

  it('projects only the public Company contact subset', async () => {
    const response = await fetch(
      `${baseUrl}/public/companies/${DSE_COMPANY_ID}/contact`,
    );
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body, {
      companyId: DSE_COMPANY_ID,
      displayName: 'Domy s energií',
      legalName: 'Radim Věntus – Domy s energií',
      ico: '62288474',
      city: 'Opava',
      country: 'Česko',
      email: 'kontakt@domysenergii.cz',
      phone: '+420 725 020 757',
    });
    assert.equal('name' in (body as object) === false || !('contact' in (body as object)), true);
    assert.equal(JSON.stringify(body).includes('Radim Věntus – Domy s energií'), true);
    assert.equal(JSON.stringify(body).includes('Majitel'), false);
    assert.equal(JSON.stringify(body).includes('"status"'), false);
    assert.equal(JSON.stringify(body).includes('Referenční šablona'), false);
    assert.equal(JSON.stringify(body).includes('Jméno'), false);
  });

  it('does not leak DSE contact onto another Company', async () => {
    const response = await fetch(
      `${baseUrl}/public/companies/${DEFAULT_COMPANY_ID}/contact`,
    );
    assert.equal(response.status, 200);
    const body = (await response.json()) as {
      companyId: string;
      email: string | null;
      phone: string | null;
    };
    assert.equal(body.companyId, DEFAULT_COMPANY_ID);
    assert.equal(body.email, null);
    assert.equal(body.phone, null);
    const projected = projectPublicCompanyContact({
      companyId: DEFAULT_COMPANY_ID,
      displayName: 'AC Modular',
      partner: null,
    });
    assert.equal(projected.email, null);
    assert.equal(projected.phone, null);
  });
});
