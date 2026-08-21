import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  CANONICAL_DSE_PARTNER_ENVIRONMENT_SCOPE,
  DSE_COMPANY_ID,
  InvalidOfficePartnerError,
} from '@embed-engine/platform-access';

import {
  DuplicateOfficePartnerError,
  FileOfficePartnerRepository,
  OfficePartnerNotFoundError,
} from './officePartnerRepository';

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

const acDraft = {
  name: 'AC Modular',
  status: 'active',
  nextStep: 'Provozní péče o partnera',
  company: {
    legalName: 'AC Modular s.r.o.',
    ico: '12345678',
    city: 'Praha',
    country: 'Česko',
  },
  contact: {
    name: 'Ana Modular',
    email: 'hello@acmodular.example',
    phone: '+420 111 222 333',
    role: 'CEO',
  },
} as const;

describe('FileOfficePartnerRepository', () => {
  async function withRepo(
    run: (repository: FileOfficePartnerRepository, statePath: string) => Promise<void>,
  ): Promise<void> {
    const directory = await mkdtemp(join(tmpdir(), 'conis-office-partners-'));
    const statePath = join(directory, 'office-partners.json');
    try {
      await run(new FileOfficePartnerRepository(statePath), statePath);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }

  it('persists existing Partner data and reads it back', async () => {
    await withRepo(async (repository) => {
      const saved = await repository.create({ id: 'p-dse', draft: dseDraft });
      assert.equal(saved.id, 'p-dse');
      assert.equal(saved.companyId, DSE_COMPANY_ID);
      assert.equal(saved.company.legalName, 'Radim Věntus – Domy s energií');
      assert.equal(saved.company.ico, '62288474');
      assert.deepEqual(await repository.get('p-dse'), saved);
      assert.deepEqual(await repository.getByCompanyId(DSE_COMPANY_ID), saved);
    });
  });

  it('updates a Partner and reads the new values from a fresh instance', async () => {
    await withRepo(async (repository, statePath) => {
      await repository.create({ id: 'p-dse', draft: dseDraft });
      const updated = await repository.update({
        id: 'p-dse',
        draft: {
          ...dseDraft,
          company: { ...dseDraft.company, city: 'Ostrava' },
        },
      });
      assert.equal(updated.company.city, 'Ostrava');

      const fresh = new FileOfficePartnerRepository(statePath);
      const restored = await fresh.get('p-dse');
      assert.equal(restored?.company.city, 'Ostrava');
      assert.equal(restored?.contact.email, 'kontakt@domysenergii.cz');
      assert.equal(restored?.id, 'p-dse');
      assert.equal(restored?.companyId, DSE_COMPANY_ID);
      assert.equal(restored?.partnerEnvironmentScope, null);
    });
  });

  it('isolates multiple Partners by technical identity', async () => {
    await withRepo(async (repository) => {
      await repository.create({ id: 'p-dse', draft: dseDraft });
      await repository.create({ id: 'ac-modular', draft: acDraft });

      const dse = await repository.getByCompanyId(DSE_COMPANY_ID);
      const ac = await repository.getByCompanyId('ac-modular');
      assert.equal(dse?.contact.email, 'kontakt@domysenergii.cz');
      assert.equal(ac?.contact.email, 'hello@acmodular.example');
      assert.notEqual(dse?.contact.phone, ac?.contact.phone);
    });
  });

  it('rejects malformed email and empty identity before persistence', async () => {
    await withRepo(async (repository, statePath) => {
      await assert.rejects(
        () =>
          repository.create({
            id: 'p-dse',
            draft: {
              ...dseDraft,
              contact: { ...dseDraft.contact, email: 'not-an-email' },
            },
          }),
        InvalidOfficePartnerError,
      );
      await assert.rejects(
        () => repository.create({ id: '  ', draft: dseDraft }),
        InvalidOfficePartnerError,
      );
      await assert.rejects(
        () => repository.update({ id: 'missing', draft: dseDraft }),
        OfficePartnerNotFoundError,
      );
      await assert.rejects(
        async () => {
          try {
            await readFile(statePath, 'utf8');
          } catch (error) {
            throw error;
          }
        },
        /ENOENT/,
      );
    });
  });

  it('does not create a duplicate DSE identity', async () => {
    await withRepo(async (repository) => {
      await repository.create({ id: 'p-dse', draft: dseDraft });
      await assert.rejects(
        () => repository.create({ id: 'p-dse', draft: dseDraft }),
        DuplicateOfficePartnerError,
      );
      await assert.rejects(
        () =>
          repository.create({
            id: DSE_COMPANY_ID,
            draft: dseDraft,
          }),
        DuplicateOfficePartnerError,
      );
      assert.equal((await repository.list()).length, 1);
    });
  });

  it('persists Partner Environment scope and reloads it', async () => {
    await withRepo(async (repository, statePath) => {
      await repository.create({ id: 'p-dse', draft: dseDraft });
      const saved = await repository.updateEnvironmentScope(
        'p-dse',
        CANONICAL_DSE_PARTNER_ENVIRONMENT_SCOPE,
      );
      assert.deepEqual(
        saved.partnerEnvironmentScope,
        CANONICAL_DSE_PARTNER_ENVIRONMENT_SCOPE,
      );

      const fresh = new FileOfficePartnerRepository(statePath);
      const restored = await fresh.get('p-dse');
      assert.deepEqual(
        restored?.partnerEnvironmentScope,
        CANONICAL_DSE_PARTNER_ENVIRONMENT_SCOPE,
      );
    });
  });

  it('preserves PE scope when unrelated commercial fields change', async () => {
    await withRepo(async (repository) => {
      await repository.create({ id: 'p-dse', draft: dseDraft });
      await repository.updateEnvironmentScope(
        'p-dse',
        CANONICAL_DSE_PARTNER_ENVIRONMENT_SCOPE,
      );
      const updated = await repository.update({
        id: 'p-dse',
        draft: {
          ...dseDraft,
          company: { ...dseDraft.company, city: 'Ostrava' },
        },
      });
      assert.equal(updated.company.city, 'Ostrava');
      assert.deepEqual(
        updated.partnerEnvironmentScope,
        CANONICAL_DSE_PARTNER_ENVIRONMENT_SCOPE,
      );
    });
  });

  it('rejects a forged DSE PE scope write', async () => {
    await withRepo(async (repository) => {
      await repository.create({ id: 'p-dse', draft: dseDraft });
      await assert.rejects(
        () =>
          repository.updateEnvironmentScope('p-dse', {
            ...CANONICAL_DSE_PARTNER_ENVIRONMENT_SCOPE,
            projectId: 'project-forged',
          }),
        InvalidOfficePartnerError,
      );
      assert.equal((await repository.get('p-dse'))?.partnerEnvironmentScope, null);
    });
  });
});
