import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { resetCompanyRegistryExtras, upsertBuilderCanonicalProject } from '../registry/companyRegistry';
import { applyDurableProjectConfigs } from '../registry/durableProjectConfig';
import {
  DSE_BUNGALOV_4KK_HOUSE_ID,
  DSE_CANONICAL_PROJECT_ID,
  DSE_COMPANY_ID,
  DEFAULT_CANONICAL_PROJECT_ID,
  DEFAULT_COMPANY_ID,
} from '../registry/defaults';
import { getCanonicalHouse, getCanonicalProject } from './canonicalProjectProjection';

describe('Project privacy ownership', () => {
  beforeEach(() => {
    resetCompanyRegistryExtras();
  });

  it('lets two Projects under the same Company carry different privacyUrl values', () => {
    upsertBuilderCanonicalProject({
      id: 'project-privacy-a',
      companyId: DSE_COMPANY_ID,
      workspaceId: 'domy-s-energii-main',
      name: 'Projekt A',
      slug: 'projekt-a',
      description: '',
    });
    upsertBuilderCanonicalProject({
      id: 'project-privacy-b',
      companyId: DSE_COMPANY_ID,
      workspaceId: 'domy-s-energii-main',
      name: 'Projekt B',
      slug: 'projekt-b',
      description: '',
    });

    applyDurableProjectConfigs([
      { projectId: 'project-privacy-a', privacyUrl: 'https://a.example/privacy' },
      { projectId: 'project-privacy-b', privacyUrl: 'https://b.example/privacy' },
    ]);

    const projectA = getCanonicalProject('project-privacy-a');
    const projectB = getCanonicalProject('project-privacy-b');
    assert.equal(projectA?.partner.companyId, DSE_COMPANY_ID);
    assert.equal(projectB?.partner.companyId, DSE_COMPANY_ID);
    assert.equal(projectA?.project.privacyUrl, 'https://a.example/privacy');
    assert.equal(projectB?.project.privacyUrl, 'https://b.example/privacy');
    assert.equal('privacyUrl' in (projectA?.partner ?? {}), false);
  });

  it('House projections inherit privacyUrl from their parent Project only', () => {
    applyDurableProjectConfigs([
      {
        projectId: DSE_CANONICAL_PROJECT_ID,
        privacyUrl: 'https://dse.example/privacy',
      },
      {
        projectId: DEFAULT_CANONICAL_PROJECT_ID,
        privacyUrl: 'https://ac.example/privacy',
      },
    ]);

    const dseHouse = getCanonicalHouse(DSE_BUNGALOV_4KK_HOUSE_ID);
    const acHouse = getCanonicalHouse('villa-168');
    assert.ok(dseHouse?.house);
    assert.ok(acHouse?.house);
    assert.equal(dseHouse.project.projectId, DSE_CANONICAL_PROJECT_ID);
    assert.equal(acHouse.project.projectId, DEFAULT_CANONICAL_PROJECT_ID);
    assert.equal(dseHouse.project.privacyUrl, 'https://dse.example/privacy');
    assert.equal(acHouse.project.privacyUrl, 'https://ac.example/privacy');
    assert.notEqual(dseHouse.project.privacyUrl, acHouse.project.privacyUrl);
  });

  it('missing Project privacyUrl stays fail-closed', () => {
    const dse = getCanonicalProject(DSE_CANONICAL_PROJECT_ID);
    assert.ok(dse);
    assert.equal(dse.partner.companyId, DSE_COMPANY_ID);
    assert.equal(dse.project.privacyUrl, undefined);
    assert.equal('privacyUrl' in dse.partner, false);

    const ac = getCanonicalProject(DEFAULT_CANONICAL_PROJECT_ID);
    assert.equal(ac?.partner.companyId, DEFAULT_COMPANY_ID);
    assert.equal(ac?.project.privacyUrl, undefined);
  });

  it('browser extras cannot supply Project privacyUrl', () => {
    upsertBuilderCanonicalProject({
      id: DSE_CANONICAL_PROJECT_ID,
      companyId: DSE_COMPANY_ID,
      workspaceId: 'domy-s-energii-main',
      name: 'Domy s energií',
      slug: 'domy-s-energii',
      description: 'Canonical Reference House delivery project.',
      privacyUrl: 'https://cookie.example/privacy',
    });

    const projected = getCanonicalProject(DSE_CANONICAL_PROJECT_ID);
    assert.equal(projected?.project.privacyUrl, undefined);

    applyDurableProjectConfigs([
      {
        projectId: DSE_CANONICAL_PROJECT_ID,
        privacyUrl: 'https://durable.example/privacy',
      },
    ]);
    assert.equal(
      getCanonicalProject(DSE_CANONICAL_PROJECT_ID)?.project.privacyUrl,
      'https://durable.example/privacy',
    );
  });
});
