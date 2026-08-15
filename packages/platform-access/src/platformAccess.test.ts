import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import {
  activateInvite,
  bootstrapProject,
  bootstrapTenant,
  bootstrapWorkspace,
  buildSession,
  buildPilotReadyReport,
  canAccessStudio,
  defaultStudioForRoles,
  enterOperatorPartnerEnvironment,
  CLOUD_PLATFORM_ORIGIN,
  CLOUD_APP_HOST,
  CLOUD_STUDIO_ENTRY_PATH,
  createWorkspaceHouseChangeMessage,
  createPilotInvite,
  getCloudPlatformConfig,
  getDefaultCompanyRegistry,
  getSharedWorkspaceContext,
  login,
  logout,
  primaryRole,
  provisionPilotWorkspace,
  resetCompanyRegistryExtras,
  resetInviteStore,
  resetPartnerWelcomeStore,
  resetPilotWorkspaceStore,
  isPilotWorkspaceReady,
  isHouseInProject,
  isWorkspaceHouseChangeMessage,
  resolveCloudStudioHref,
  resolveClientStudioHref,
  resolveBuilderStudioHref,
  resolvePublicLegalHref,
  resolveWorkspaceHostHref,
  resolveWorkspaceHouseBinding,
  restoreAuthenticatedPartnerEnvironment,
  restoreSession,
  submitPlatformFeedback,
  listPlatformFeedback,
  listCanonicalHouses,
  listWorkspaceHouses,
  updateSession,
  upsertBuilderProject,
  upsertWorkspaceAuthoredHouse,
  BUNGALOV_4KK_REFERENCE_SOURCE_ID,
  deriveReferenceInstanceHouseId,
  getReferenceHouseSource,
  referenceInstanceProvenance,
  resolveCanonicalKnowledgeHouseId,
} from './index';
import {
  clearPlatformSession,
  loadPlatformSession,
} from './session/sessionStore';

describe('platformAccess (EPIC-BX-14)', () => {
  it('defines BUNGALOV as a versioned source, not a Partner House', () => {
    const source = getReferenceHouseSource(
      BUNGALOV_4KK_REFERENCE_SOURCE_ID,
    );

    assert.deepEqual(source, {
      sourceId: 'bungalov-4kk-reference-v1',
      displayName: 'BUNGALOV 4KK',
      version: 'v1',
      lifecycle: 'READY',
      packageRoot: 'apps/client-studio/public/house-packages/bungalov-4kk',
      runtimeContextBinding: {
        canonicalHouseId: 'modern-4kk',
      },
    });
    const partnerA = deriveReferenceInstanceHouseId({
      sourceId: BUNGALOV_4KK_REFERENCE_SOURCE_ID,
      companyId: 'company-alpha',
      projectId: 'project-alpha',
    });
    const partnerB = deriveReferenceInstanceHouseId({
      sourceId: BUNGALOV_4KK_REFERENCE_SOURCE_ID,
      companyId: 'company-beta',
      projectId: 'project-beta',
    });

    assert.notEqual(partnerA, partnerB);
    assert.notEqual(partnerA, BUNGALOV_4KK_REFERENCE_SOURCE_ID);
    assert.notEqual(partnerA, 'modern-4kk');
    assert.deepEqual(
      referenceInstanceProvenance(BUNGALOV_4KK_REFERENCE_SOURCE_ID),
      {
        sourceId: BUNGALOV_4KK_REFERENCE_SOURCE_ID,
        sourceVersion: 'v1',
      },
    );
    assert.equal(
      resolveCanonicalKnowledgeHouseId({
        runtimeHouseId: partnerA,
        referenceProvenance: referenceInstanceProvenance(
          BUNGALOV_4KK_REFERENCE_SOURCE_ID,
        ),
      }),
      'modern-4kk',
    );
    assert.equal(
      resolveCanonicalKnowledgeHouseId({
        runtimeHouseId: 'villa-168',
      }),
      'villa-168',
    );
  });

  it('owns the canonical Company / Workspace / Project registry', () => {
    const registry = getDefaultCompanyRegistry();
    assert.equal(registry.companies.length, 2);
    assert.deepEqual(
      registry.companies.map((company) => company.id).sort(),
      ['ac-modular', 'company-domy-s-energii'],
    );
    assert.ok(registry.workspaces.length >= 1);
    assert.ok(registry.projects.length >= 3);
  });

  it('logs in, restores session and logs out', () => {
    clearPlatformSession();
    const result = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: true,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.session.user.displayName, 'Radim');
    assert.equal(primaryRole(result.session.user.roles), 'conis-admin');
    assert.equal(result.session.activeStudioId, null);
    assert.equal(result.session.tenantId, 'tenant-ac-modular');
    assert.ok(typeof result.session.lastLoginAt === 'string');
    const restored = restoreSession();
    assert.ok(restored !== null);
    assert.equal(restored?.user.email, 'radim@conis.local');
    logout();
    assert.equal(restoreSession(), null);
  });

  it('keeps canonical Project scope separate from the legacy bootstrap Project', () => {
    clearPlatformSession();
    const result = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const withStudio = updateSession({ activeStudioId: 'builder' });
    assert.ok(withStudio !== null);
    const boot = bootstrapWorkspace(withStudio!);
    assert.ok(boot !== null);
    assert.equal(boot?.company.name, 'AC Modular');
    assert.equal(boot?.workspace.name, 'AC Modular Main');
    assert.equal(withStudio?.projectId, 'project-ac-modular');
    assert.equal(boot?.project, null);
    assert.equal(boot?.studioId, 'builder');
  });

  it('CAP-VR38a — keeps shared House scope subordinate to Project scope', () => {
    clearPlatformSession();
    const result = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    assert.equal(isHouseInProject('modern-4kk', 'project-domy-s-energii'), false);
    assert.equal(isHouseInProject('modern-4kk', 'project-ac-modular'), true);
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
    assert.equal(
      isHouseInProject('patrovy-5kk', 'project-domy-s-energii'),
      true,
    );
    assert.equal(isHouseInProject('family-98', 'project-domy-s-energii'), false);
    assert.equal(isWorkspaceHouseChangeMessage(createWorkspaceHouseChangeMessage(null)), true);
    assert.equal(
      isWorkspaceHouseChangeMessage(
        createWorkspaceHouseChangeMessage('modern-4kk'),
      ),
      true,
    );

    const dse = updateSession({
      projectId: 'project-domy-s-energii',
      activeHouseId: 'modern-4kk',
    });
    assert.equal(dse?.projectId, 'project-domy-s-energii');
    assert.equal(dse?.activeHouseId, null);

    const ac = updateSession({
      projectId: 'project-ac-modular',
      activeHouseId: 'modern-4kk',
    });
    assert.equal(ac?.projectId, 'project-ac-modular');
    assert.equal(ac?.activeHouseId, 'modern-4kk');

    const rejectedHouseProject = updateSession({ projectId: 'modern-4kk' });
    assert.equal(rejectedHouseProject?.projectId, 'project-ac-modular');
    assert.equal(rejectedHouseProject?.activeHouseId, 'modern-4kk');
    resetCompanyRegistryExtras();
  });

  it('CAP-VR38e — exposes an immediate shared Workspace scope mutation', () => {
    const provider = readFileSync(
      new URL('./react/SessionProvider.tsx', import.meta.url),
      'utf8',
    );

    assert.match(provider, /updateWorkspaceScope/);
    assert.match(
      provider,
      /updateSession\(\{[\s\S]*projectId,[\s\S]*activeHouseId,[\s\S]*workspaceContext,[\s\S]*\}\)[\s\S]*setSession\(next\)/,
    );
  });

  it('CAP-RG1R4 — bootstraps valid Builder-authored House context cross-port', () => {
    clearPlatformSession();
    const result = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;

    updateSession({
      projectId: 'project-domy-s-energii',
      activeHouseId: 'modern-4kk',
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

    assert.deepEqual(
      getSharedWorkspaceContext()?.authoredHouseIdentities,
      [
        {
          houseId: 'patrovy-5kk',
          name: 'PATROVÝ 5KK',
          canonicalProjectId: 'project-domy-s-energii',
          packageRoot: 'apps/client-studio/public/house-packages/patrovy-5kk',
          dataMode: 'LIVE_EMPTY',
          status: 'draft',
        },
      ],
    );
    assert.equal(
      loadPlatformSession()?.workspaceContext?.activeHouseId,
      null,
    );
    assert.deepEqual(
      listWorkspaceHouses('project-domy-s-energii').map(
        (house) => house.houseId,
      ),
      [
        'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
        'patrovy-5kk',
      ],
    );
    assert.deepEqual(
      listWorkspaceHouses('project-ac-modular').map((house) => house.houseId),
      ['modern-4kk', 'family-98', 'harmony-124', 'villa-168'],
    );

    updateSession({ projectId: 'project-ac-modular' });
    upsertWorkspaceAuthoredHouse({
      houseId: 'invalid-cross-project-house',
      name: 'Invalid cross-project house',
      canonicalProjectId: 'project-domy-s-energii',
      packageRoot: 'apps/client-studio/public/house-packages/invalid-cross-project-house',
      dataMode: 'LIVE_EMPTY',
      status: 'draft',
    });
    assert.equal(
      getSharedWorkspaceContext()?.authoredHouseIdentities?.length,
      1,
    );
  });

  it('CAP-VR39a — projects authored House identities without publishing them', () => {
    clearPlatformSession();
    const result = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(
      enterOperatorPartnerEnvironment({
        companyId: 'dse',
        workspaceId: 'dse-main',
        projectId: 'project-domy-s-energii',
        officePartnerId: 'dse',
        officeReturnHref: 'http://127.0.0.1:4181/',
        navigate: false,
      }).ok,
      true,
    );

    upsertWorkspaceAuthoredHouse({
      houseId: 'patrovy-5kk',
      name: 'PATROVÝ 5KK',
      canonicalProjectId: 'project-domy-s-energii',
      packageRoot: 'apps/client-studio/public/house-packages/patrovy-5kk',
      dataMode: 'LIVE_EMPTY',
      status: 'draft',
    });
    const dseHouses = listWorkspaceHouses('project-domy-s-energii');

    assert.deepEqual(
      dseHouses.map((house) => house.houseId),
      [
        'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
        'patrovy-5kk',
      ],
    );
    assert.deepEqual(
      listCanonicalHouses('project-domy-s-energii').map(
        (projection) => projection.house?.houseId,
      ),
      [
        'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk',
      ],
    );
    const bungalov = listCanonicalHouses('project-domy-s-energii')[0]?.house;
    assert.equal(
      resolveCanonicalKnowledgeHouseId({
        runtimeHouseId: bungalov?.houseId ?? '',
        referenceProvenance: bungalov?.referenceProvenance,
      }),
      'modern-4kk',
    );
    assert.deepEqual(dseHouses[1], {
      houseId: 'patrovy-5kk',
      name: 'PATROVÝ 5KK',
      canonicalProjectId: 'project-domy-s-energii',
      packageRoot: 'apps/client-studio/public/house-packages/patrovy-5kk',
      dataMode: 'LIVE_EMPTY',
      status: 'draft',
    });
    assert.equal(
      isHouseInProject('patrovy-5kk', 'project-domy-s-energii'),
      true,
    );
    assert.equal(
      isHouseInProject('patrovy-5kk', 'project-ac-modular'),
      false,
    );
    assert.equal(
      isHouseInProject('unknown-house', 'project-domy-s-energii'),
      false,
    );
    const referenceBinding = resolveWorkspaceHouseBinding({
      projectId: 'project-domy-s-energii',
      houseId: bungalov?.houseId ?? '',
    });
    assert.equal(referenceBinding?.dataMode, 'REFERENCE_DEMO');
    assert.equal(referenceBinding?.runtimeContentAvailable, true);
    assert.equal(
      referenceBinding?.canonicalBinding?.runtimeHouseId,
      bungalov?.houseId,
    );
    assert.deepEqual(
      resolveWorkspaceHouseBinding({
        projectId: 'project-domy-s-energii',
        houseId: 'patrovy-5kk',
      }),
      {
        houseId: 'patrovy-5kk',
        projectId: 'project-domy-s-energii',
        dataMode: 'LIVE_EMPTY',
        status: 'draft',
      runtimeContentAvailable: true,
      authoringDraftPackage: {
        packageRoot: 'apps/client-studio/public/house-packages/patrovy-5kk',
        packagePublicRoot: '/house-packages/patrovy-5kk',
        name: 'PATROVÝ 5KK',
      },
        canonicalBinding: null,
      },
    );
    assert.equal(
      resolveWorkspaceHouseBinding({
        projectId: 'project-domy-s-energii',
        houseId: 'family-98',
      }),
      null,
    );

    const draftScope = updateSession({ activeHouseId: 'patrovy-5kk' });
    assert.equal(draftScope?.projectId, 'project-domy-s-energii');
    assert.equal(draftScope?.activeHouseId, 'patrovy-5kk');

    const bungalovId =
      'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk';
    const bungalovScope = updateSession({ activeHouseId: bungalovId });
    assert.equal(bungalovScope?.activeHouseId, bungalovId);
    assert.deepEqual(
      listWorkspaceHouses('project-domy-s-energii').map(
        (house) => house.houseId,
      ),
      [bungalovId, 'patrovy-5kk'],
    );
    const restoredDraftScope = updateSession({ activeHouseId: 'patrovy-5kk' });
    assert.equal(restoredDraftScope?.activeHouseId, 'patrovy-5kk');

    for (const invalidProjectId of [
      'modern-4kk',
      'patrovy-5kk',
      'some-random-id',
    ]) {
      const rejected = updateSession({ projectId: invalidProjectId });
      assert.equal(rejected?.projectId, 'project-domy-s-energii');
      assert.equal(rejected?.activeHouseId, 'patrovy-5kk');
    }

    const movedProject = updateSession({ projectId: 'project-ac-modular' });
    assert.equal(movedProject?.projectId, 'project-ac-modular');
    assert.equal(movedProject?.activeHouseId, null);
    const projectScope = updateSession({ activeHouseId: null });
    assert.equal(projectScope?.projectId, 'project-ac-modular');
    assert.equal(projectScope?.activeHouseId, null);

    for (const invalidProjectId of [
      'modern-4kk',
      'patrovy-5kk',
      'some-random-id',
    ]) {
      assert.equal(
        buildSession({
          user: result.session.user,
          rememberMe: false,
          projectId: invalidProjectId,
        }).projectId,
        'project-ac-modular',
      );
    }
    logout();
  });

  it('TASK-42C — authenticated DSE Workspace defaults to BUNGALOV 4KK when House scope is empty', () => {
    clearPlatformSession();

    const result = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;

    updateSession({
      projectId: 'project-domy-s-energii',
      activeHouseId: null,
      workspaceContext: null,
    });

    const restored = restoreAuthenticatedPartnerEnvironment();

    const bungalovId =
      'reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk';

    assert.equal(restored?.projectId, 'project-domy-s-energii');
    assert.equal(restored?.activeHouseId, bungalovId);
    assert.equal(loadPlatformSession()?.activeHouseId, bungalovId);
    assert.equal(
      loadPlatformSession()?.workspaceContext?.activeHouseId,
      bungalovId,
    );

    clearPlatformSession();
  });

  it('project bootstrap marks capability and intelligence readiness', () => {
    clearPlatformSession();
    const result = login({
      email: 'builder@ac.local',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const boot = bootstrapProject({
      session: result.session,
      projectId: 'harmony-124',
      studioId: 'builder',
    });
    assert.ok(boot !== null);
    assert.equal(boot?.capabilitiesReady, true);
    assert.equal(boot?.intelligenceReady, true);
    assert.match(boot?.housePackageRoot ?? '', /harmony-124/);
  });

  it('role model prepares studio guards without full RBAC', () => {
    assert.equal(canAccessStudio(['salesman'], 'sales'), true);
    assert.equal(canAccessStudio(['salesman'], 'builder'), false);
    assert.equal(canAccessStudio(['salesman'], 'office'), false);
    assert.equal(canAccessStudio(['conis-admin'], 'manager'), true);
    assert.equal(canAccessStudio(['conis-admin'], 'office'), true);
    assert.equal(canAccessStudio(['manager'], 'manager'), true);
  });

  it('RC-002 default studio follows occupational role', () => {
    assert.equal(defaultStudioForRoles(['builder']), 'builder');
    assert.equal(defaultStudioForRoles(['manager']), 'manager');
    assert.equal(defaultStudioForRoles(['salesman']), 'sales');
    assert.equal(defaultStudioForRoles(['conis-admin']), 'manager');
  });

  it('W-01A cloud studio paths use conis.cz/studio', () => {
    assert.equal(CLOUD_PLATFORM_ORIGIN, 'https://conis.cz');
    assert.equal(CLOUD_APP_HOST, 'conis.cz/studio');
    assert.equal(CLOUD_STUDIO_ENTRY_PATH, '/studio/');
  });
});

describe('platformAccess cloud pilot (EPIC-BX-15)', () => {
  it('resolves local studio hrefs by default', () => {
    const config = getCloudPlatformConfig();
    assert.equal(config.mode, 'local');
    assert.equal(resolveCloudStudioHref('builder'), 'http://127.0.0.1:4177/');
    assert.equal(resolveCloudStudioHref('manager'), 'http://127.0.0.1:4175/');
    assert.equal(resolveCloudStudioHref('sales'), 'http://127.0.0.1:4179/');
    assert.equal(resolveCloudStudioHref('office'), 'http://127.0.0.1:4181/');
    assert.equal(resolveCloudStudioHref('client'), 'http://127.0.0.1:4183/');
    assert.equal(resolveClientStudioHref(), 'http://127.0.0.1:4173/');
    assert.equal(
      resolveClientStudioHref('villa-168'),
      'http://127.0.0.1:4173/?projectId=villa-168',
    );
    assert.equal(resolveCloudStudioHref('builder'), 'http://127.0.0.1:4177/');
    assert.equal(
      resolveBuilderStudioHref('villa-168'),
      'http://127.0.0.1:4177/?projectId=villa-168',
    );
    assert.equal(resolveWorkspaceHostHref(), 'http://127.0.0.1:4183/');
    assert.equal(
      resolvePublicLegalHref('04_dpa.pdf'),
      'http://127.0.0.1:4190/legal/04_dpa.pdf',
    );
  });

  it('keeps local HTTPS Studio transitions on the same conis.cz site', () => {
    const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        location: {
          hostname: 'conis.cz',
          protocol: 'https:',
          port: '4175',
        },
      },
    });
    try {
      assert.equal(getCloudPlatformConfig().mode, 'local');
      assert.equal(resolveCloudStudioHref('office'), 'https://conis.cz:4181/');
      assert.equal(resolveCloudStudioHref('manager'), 'https://conis.cz:4175/');
    } finally {
      if (windowDescriptor === undefined) {
        delete (globalThis as { window?: unknown }).window;
      } else {
        Object.defineProperty(globalThis, 'window', windowDescriptor);
      }
    }
  });

  it('routes operator Client selection through Workspace, separate from public Embed', () => {
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { location: { hostname: 'conis.cz' } },
    });

    try {
      assert.equal(
        resolveCloudStudioHref('client'),
        'https://conis.cz/studio/workspace/',
      );
      assert.equal(resolveClientStudioHref(), 'https://conis.cz/embed/');
      assert.equal(
        resolvePublicLegalHref('04_dpa.pdf'),
        'https://conis.cz/legal/04_dpa.pdf',
      );
      assert.notEqual(resolveCloudStudioHref('client'), resolveClientStudioHref());
      assert.doesNotMatch(resolveCloudStudioHref('client'), /\/studio\/client\//);
    } finally {
      if (originalWindow === undefined) {
        delete (globalThis as { window?: unknown }).window;
      } else {
        Object.defineProperty(globalThis, 'window', originalWindow);
      }
    }
  });

  it('keeps canonical Project scope separate from legacy Tenant bootstrap Project', () => {
    clearPlatformSession();
    const result = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const tenantBoot = bootstrapTenant(result.session);
    assert.ok(tenantBoot !== null);
    assert.equal(tenantBoot?.tenant.id, 'tenant-ac-modular');
    assert.equal(tenantBoot?.company.id, 'ac-modular');
    assert.equal(tenantBoot?.workspace.id, 'ac-modular-main');
    assert.equal(result.session.projectId, 'project-ac-modular');
    assert.equal(tenantBoot?.project, null);
  });

  it('provisions a pilot firm with Company / Workspace / Project / HP', () => {
    resetCompanyRegistryExtras();
    resetPilotWorkspaceStore();
    const provisioned = provisionPilotWorkspace({
      companyName: 'Nordic Homes',
    });
    assert.equal(provisioned.company.name, 'Nordic Homes');
    assert.match(provisioned.tenant.id, /nordic-homes/);
    assert.match(provisioned.workspace.name, /Nordic Homes/);
    assert.match(provisioned.workspace.name, /Pilot Workspace/);
    assert.equal(provisioned.project.name, 'Reference House');
    assert.match(provisioned.houses[0]?.packageRoot ?? '', /house-package/);
    assert.equal(isPilotWorkspaceReady(provisioned.company.id), true);
    const registry = getDefaultCompanyRegistry();
    assert.ok(registry.companies.some((c) => c.id === provisioned.company.id));
    resetPilotWorkspaceStore();
    resetCompanyRegistryExtras();
  });

  it('rejects invite activation without NDA consent', () => {
    clearPlatformSession();
    resetInviteStore();
    resetPartnerWelcomeStore();
    const invite = createPilotInvite({
      email: 'nda@nordic.local',
      displayName: 'NDA User',
      roles: ['manager', 'salesman'],
      invitedByUserId: 'user-radim',
    });
    const denied = activateInvite({
      token: invite.token,
      password: 'secret',
      ndaAccepted: false,
    });
    assert.equal(denied.ok, false);
    resetInviteStore();
  });

  it('invite → activate → login enters workspace', () => {
    clearPlatformSession();
    resetInviteStore();
    resetPartnerWelcomeStore();
    const invite = createPilotInvite({
      email: 'pilot@nordic.local',
      displayName: 'Pilot User',
      roles: ['builder'],
      invitedByUserId: 'user-radim',
    });
    const activated = activateInvite({
      token: invite.token,
      password: 'pilot-pass',
      ndaAccepted: true,
    });
    assert.equal(activated.ok, true);
    const result = login({
      email: 'pilot@nordic.local',
      password: 'pilot-pass',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.session.user.displayName, 'Pilot User');
    assert.equal(result.session.workspaceId, 'ac-modular-main');
    resetInviteStore();
    logout();
  });

  it('reports missing legacy package readiness for a canonical-only session', () => {
    clearPlatformSession();
    const result = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const report = buildPilotReadyReport(result.session);
    assert.equal(report.ready, false);
    assert.ok(report.missingLabels.includes('Missing Project'));
    assert.ok(report.missingLabels.includes('Missing House Package'));
    const loggedOut = buildPilotReadyReport(null);
    assert.equal(loggedOut.ready, false);
    assert.ok(loggedOut.missingLabels.includes('Missing Login'));
    logout();
  });

  it('stores platform feedback outside capability registry', () => {
    const entry = submitPlatformFeedback({
      message: 'Pilot feedback',
      email: 'radim@conis.local',
      studioId: 'builder',
      companyId: 'ac-modular',
    });
    assert.equal(entry.message, 'Pilot feedback');
    assert.ok(listPlatformFeedback().some((item) => item.message === 'Pilot feedback'));
  });
});
