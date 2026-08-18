/**
 * CAP-PLAT-02c.1b / CAP-PLAT-04h — Session / URL → CPL Runtime Binding (House).
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  clearPlatformSession,
  login,
  resetCompanyRegistryExtras,
  resolveCanonicalRuntimeBinding,
  updateSession,
  upsertBuilderProject,
  upsertWorkspaceAuthoredHouse,
} from '@embed-engine/platform-access';

import {
  formatClientPartnerHouseTitle,
  listClientHouses,
  readActiveClientHouseId,
  resolveClientActiveProjectId,
  resolveCanonicalRuntimeBindingFromSession,
  resolveCanonicalRuntimeBindingFromUrl,
  resolveClientRuntimeBinding,
  resolveClientRuntimeBindingFromCandidates,
} from './clientCanonicalBind';

const here = dirname(fileURLToPath(import.meta.url));

describe('CAP-PLAT-02c.1b / CAP-PLAT-04h Session/URL runtime binding', () => {
  it('resolves URL projectId to bound House via CPL Runtime Binding', () => {
    const binding = resolveCanonicalRuntimeBindingFromUrl('villa-168');
    assert.equal(binding.bindSource, 'url');
    assert.equal(binding.runtimeHouseId, 'villa-168');
    assert.equal(binding.runtimeProjectId, 'project-ac-modular');
    assert.ok(binding.project !== null);
    assert.equal(binding.project.house.houseId, 'villa-168');
    assert.equal(binding.project.project.projectId, 'project-ac-modular');
    assert.ok(binding.packagePublicRoot !== null);
  });

  it('does not fabricate a House from canonical Session Project scope', () => {
    const binding = resolveCanonicalRuntimeBindingFromSession(
      'project-ac-modular',
    );
    assert.equal(binding.bindSource, 'none');
    assert.equal(binding.runtimeHouseId, null);
    assert.equal(binding.runtimeProjectId, null);
    assert.equal(binding.project, null);
    assert.equal(binding.packagePublicRoot, null);
  });

  it('keeps an explicit non-demo House explicit without substituting villa-168', () => {
    const binding = resolveClientRuntimeBindingFromCandidates({
      urlProjectId: 'family-98',
      urlHouseId: null,
      workspaceContextProjectId: null,
      workspaceContextHouseId: null,
      sessionProjectId: null,
      sessionHouseId: null,
      embedObjectId: null,
    });

    assert.equal(binding.runtimeHouseId, 'family-98');
    assert.notEqual(binding.runtimeHouseId, 'villa-168');
  });

  it('prefers URL over Session in combined Runtime Binding (CPL order)', () => {
    const binding = resolveCanonicalRuntimeBinding({
      urlProjectId: 'villa-168',
      sessionProjectId: 'harmony-124',
      fallbackToFirstPublished: false,
    });
    assert.equal(binding.bindSource, 'url');
    assert.equal(binding.runtimeHouseId, 'villa-168');
    assert.equal(binding.runtimeProjectId, 'project-ac-modular');
  });

  it('Client Runtime Binding entry remains CPL resolveCanonicalRuntimeBinding', () => {
    const binding = resolveClientRuntimeBinding();
    assert.ok(
      binding.bindSource === 'url' ||
        binding.bindSource === 'workspace-context' ||
        binding.bindSource === 'session' ||
        binding.bindSource === 'embed' ||
        binding.bindSource === 'published-default' ||
        binding.bindSource === 'none' ||
        binding.bindSource === 'explicit',
    );
    if (binding.runtimeHouseId !== null) {
      assert.ok(binding.project !== null);
      assert.equal(binding.project.house.houseId, binding.runtimeHouseId);
      assert.equal(
        binding.project.project.projectId,
        binding.runtimeProjectId,
      );
      assert.notEqual(binding.runtimeHouseId, binding.runtimeProjectId);
    }
  });

  it('CAP-PLAT-04h — header uses company · house.name; menu lists Houses', () => {
    const binding = resolveCanonicalRuntimeBindingFromUrl('villa-168');
    assert.ok(binding.project);
    assert.equal(
      formatClientPartnerHouseTitle(binding.project),
      'AC Modular · Villa 168',
    );
    assert.notEqual(binding.project.project.name, binding.project.house.name);

    const houses = listClientHouses();
    assert.ok(houses.length >= 3);
    assert.ok(
      houses.every(
        (item) =>
          item.house.houseId.length > 0 &&
          item.house.houseId !== item.project.projectId &&
          typeof item.house.objectType === 'string',
      ),
    );
    assert.equal(readActiveClientHouseId(binding), 'villa-168');

    const sidebar = readFileSync(
      join(here, '../ClientStudioSidebar.tsx'),
      'utf8',
    );
    assert.match(sidebar, /listWorkspaceHouses/);
    assert.match(sidebar, /house\.houseId/);
    assert.match(sidebar, /house\.name/);
  });

  it('CAP-VR33c — scopes Client houses to shared canonical Project', () => {
    const dseHouses = listClientHouses('project-domy-s-energii');
    const acModularHouses = listClientHouses('project-ac-modular');

    assert.deepEqual(
      dseHouses.flatMap((projection) =>
        projection.house === null ? [] : [projection.house.houseId],
      ),
      [
        'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
        'draft-company-domy-s-energii-project-domy-s-energii-vas-prvni-dum-5kk',
      ],
    );
    assert.deepEqual(
      acModularHouses.map((projection) => projection.house?.houseId),
      ['modern-4kk', 'family-98', 'harmony-124', 'villa-168'],
    );
    assert.equal(
      resolveClientActiveProjectId('project-domy-s-energii'),
      'project-domy-s-energii',
    );
    assert.equal(resolveClientActiveProjectId('modern-4kk'), null);
    assert.equal(
      resolveCanonicalRuntimeBindingFromSession('modern-4kk').runtimeHouseId,
      null,
    );
  });

  it('binds the DSE BUNGALOV materialization to its own published package', () => {
    const binding = resolveClientRuntimeBindingFromCandidates({
      urlProjectId: null,
      urlHouseId: null,
      workspaceContextProjectId: null,
      workspaceContextHouseId: null,
      sessionProjectId: 'project-domy-s-energii',
      sessionHouseId:
        'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
      embedObjectId: null,
    });

    assert.equal(
      binding.runtimeHouseId,
      'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
    );
    assert.equal(binding.runtimeProjectId, 'project-domy-s-energii');
    assert.equal(binding.project?.house?.name, 'BUNGALOV 4KK');
    assert.equal(
      binding.packagePublicRoot,
      '/house-packages/bungalov-4kk',
    );
    assert.notEqual(binding.runtimeHouseId, 'villa-168');
  });


  it('TASK-56H — canonical VPD binds historical populated package', () => {
    clearPlatformSession();

    const canonicalVpdId =
      'draft-company-domy-s-energii-project-domy-s-energii-vas-prvni-dum-5kk';

    const authenticated = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });

    assert.equal(authenticated.ok, true);
    if (!authenticated.ok) return;

    updateSession({
      projectId: 'project-domy-s-energii',
      activeHouseId: canonicalVpdId,
      workspaceContext: {
        projectId: 'project-domy-s-energii',
        authoredHouseIdentities: [
          {
            houseId: canonicalVpdId,
            name: 'Váš první dům',
            canonicalProjectId: 'project-domy-s-energii',
            packageRoot:
              'apps/client-studio/public/house-packages/patrovy-5kk',
            dataMode: 'LIVE_EMPTY',
            status: 'draft',
          },
        ],
      },
    });

    const binding = resolveClientRuntimeBindingFromCandidates({
      urlProjectId: null,
      urlHouseId: null,
      workspaceContextProjectId: 'project-domy-s-energii',
      workspaceContextHouseId: canonicalVpdId,
      sessionProjectId: 'project-domy-s-energii',
      sessionHouseId: canonicalVpdId,
      embedObjectId: null,
    });

    assert.equal(binding.runtimeHouseId, canonicalVpdId);
    assert.equal(
      binding.runtimeProjectId,
      'project-domy-s-energii',
    );
    assert.equal(
      binding.packagePublicRoot,
      '/house-packages/patrovy-5kk',
    );
    assert.equal(
      binding.project?.house?.name,
      'Váš první dům',
    );

    clearPlatformSession();
  });

  it('binds an in-scope authored draft only when it owns a package', () => {
    clearPlatformSession();
    const authenticated = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(authenticated.ok, true);
    if (!authenticated.ok) return;

    updateSession({
      projectId: 'project-domy-s-energii',
      workspaceContext: null,
    });
    upsertWorkspaceAuthoredHouse({
      houseId: 'patrovy-5kk',
      name: 'PATROVÝ 5KK',
      canonicalProjectId: 'project-domy-s-energii',
      packageRoot: 'apps/client-studio/public/house-packages/patrovy-5kk',
      dataMode: 'LIVE_EMPTY',
      status: 'draft',
    });

    const draft = resolveClientRuntimeBindingFromCandidates({
      urlProjectId: null,
      urlHouseId: null,
      workspaceContextProjectId: 'project-domy-s-energii',
      workspaceContextHouseId: 'patrovy-5kk',
      sessionProjectId: 'project-domy-s-energii',
      sessionHouseId: 'patrovy-5kk',
      embedObjectId: null,
    });
    assert.equal(draft.runtimeHouseId, 'patrovy-5kk');
    assert.equal(draft.runtimeProjectId, 'project-domy-s-energii');
    assert.equal(
      draft.packagePublicRoot,
      '/house-packages/patrovy-5kk',
    );
    assert.equal(draft.project?.house?.name, 'PATROVÝ 5KK');

    const crossProject = resolveClientRuntimeBindingFromCandidates({
      urlProjectId: null,
      urlHouseId: null,
      workspaceContextProjectId: 'project-domy-s-energii',
      workspaceContextHouseId: 'patrovy-5kk',
      sessionProjectId: 'project-ac-modular',
      sessionHouseId: 'patrovy-5kk',
      embedObjectId: null,
    });
    assert.equal(crossProject.runtimeHouseId, null);

    upsertWorkspaceAuthoredHouse({
      houseId: 'empty-draft',
      name: 'Empty draft',
      canonicalProjectId: 'project-domy-s-energii',
      packageRoot: '',
      dataMode: 'LIVE_EMPTY',
      status: 'draft',
    });
    const missingPackage = resolveClientRuntimeBindingFromCandidates({
      urlProjectId: null,
      urlHouseId: null,
      workspaceContextProjectId: 'project-domy-s-energii',
      workspaceContextHouseId: 'empty-draft',
      sessionProjectId: 'project-domy-s-energii',
      sessionHouseId: 'empty-draft',
      embedObjectId: null,
    });
    assert.equal(missingPackage.runtimeHouseId, null);
    assert.equal(missingPackage.packagePublicRoot, null);

    clearPlatformSession();
  });

  it('CAP-VR33c — shared Project rejects a cross-Project House URL', () => {
    const binding = resolveClientRuntimeBindingFromCandidates({
      urlProjectId: 'villa-168',
      urlHouseId: null,
      workspaceContextProjectId: null,
      workspaceContextHouseId: null,
      sessionProjectId: 'project-domy-s-energii',
      sessionHouseId: null,
      embedObjectId: null,
    });

    assert.equal(binding.runtimeProjectId, null);
    assert.equal(binding.runtimeHouseId, null);

    const sidebar = readFileSync(
      join(here, '../ClientStudioSidebar.tsx'),
      'utf8',
    );
    assert.doesNotMatch(sidebar, /updateSession/);
  });

  it('CAP-VR38d3 — shared House scope overrides published fallback and includes drafts', () => {
    upsertBuilderProject({
      id: 'patrovy-5kk',
      workspaceId: 'dse-main',
      companyId: 'dse',
      name: 'PATROVÝ 5KK',
      packageRoot: '',
      status: 'draft',
      slug: 'patrovy-5kk',
      objectType: 'house',
      description: '',
      canonicalProjectId: 'project-domy-s-energii',
    });
    const binding = resolveClientRuntimeBindingFromCandidates({
      urlProjectId: null,
      urlHouseId: null,
      workspaceContextProjectId: 'project-domy-s-energii',
      workspaceContextHouseId: null,
      sessionProjectId: 'project-domy-s-energii',
      sessionHouseId: 'patrovy-5kk',
      embedObjectId: null,
    });
    const dseHouseIds = listClientHouses('project-domy-s-energii').flatMap(
      (projection) =>
        projection.house === null ? [] : [projection.house.houseId],
    );
    const sidebar = readFileSync(
      join(here, '../ClientStudioSidebar.tsx'),
      'utf8',
    );

    assert.equal(binding.runtimeHouseId, 'patrovy-5kk');
    assert.deepEqual(dseHouseIds, [
      'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
      'draft-company-domy-s-energii-project-domy-s-energii-vas-prvni-dum-5kk',
      'patrovy-5kk',
    ]);
    assert.match(sidebar, /updateWorkspaceScope\(\{ activeHouseId: houseId \}\)/);
    assert.match(sidebar, /createWorkspaceHouseChangeMessage\(houseId\)/);
    assert.match(sidebar, /window\.dispatchEvent/);
    assert.match(sidebar, /new CustomEvent\(message\.type, \{ detail: message \}\)/);
    const provider = readFileSync(
      join(here, 'DecisionSessionRuntimeProvider.tsx'),
      'utf8',
    );
    assert.match(provider, /resolveWorkspaceHouseBinding/);
    assert.match(provider, /runtimeContentAvailable === false/);
    assert.match(provider, /client-workspace-draft-empty/);
    resetCompanyRegistryExtras();
  });

  it('uses an Embed requested House ahead of a stale workspace selection', () => {
    const binding = resolveClientRuntimeBindingFromCandidates({
      urlProjectId: null,
      urlHouseId: null,
      workspaceContextProjectId: 'project-domy-s-energii',
      workspaceContextHouseId:
        'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
      sessionProjectId: 'project-domy-s-energii',
      sessionHouseId:
        'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
      embedObjectId:
        'draft-company-domy-s-energii-project-domy-s-energii-vas-prvni-dum-5kk',
    });

    assert.equal(
      binding.runtimeHouseId,
      'draft-company-domy-s-energii-project-domy-s-energii-vas-prvni-dum-5kk',
    );
    assert.equal(binding.runtimeProjectId, 'project-domy-s-energii');
  });
});
