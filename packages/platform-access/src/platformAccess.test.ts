import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  activateInvite,
  bootstrapProject,
  bootstrapTenant,
  bootstrapWorkspace,
  buildPilotReadyReport,
  canAccessStudio,
  defaultStudioForRoles,
  CLOUD_PLATFORM_ORIGIN,
  CLOUD_APP_HOST,
  CLOUD_STUDIO_ENTRY_PATH,
  createPilotInvite,
  getCloudPlatformConfig,
  getDefaultCompanyRegistry,
  login,
  logout,
  primaryRole,
  provisionPilotWorkspace,
  resetCompanyRegistryExtras,
  resetInviteStore,
  resolveCloudStudioHref,
  restoreSession,
  submitPlatformFeedback,
  listPlatformFeedback,
  updateSession,
} from './index';
import { clearPlatformSession } from './session/sessionStore';

describe('platformAccess (EPIC-BX-14)', () => {
  it('owns a single Company / Workspace / Project registry', () => {
    const registry = getDefaultCompanyRegistry();
    assert.equal(registry.companies.length, 1);
    assert.equal(registry.companies[0]?.id, 'ac-modular');
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

  it('bootstraps User → Company → Workspace → Project → Studio', () => {
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
    assert.equal(boot?.project?.name, 'Villa 168');
    assert.equal(boot?.studioId, 'builder');
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
    assert.equal(canAccessStudio(['conis-admin'], 'manager'), true);
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
  });

  it('bootstraps Tenant → Company → Workspace → Project', () => {
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
    assert.equal(tenantBoot?.project?.id, 'villa-168');
  });

  it('provisions a pilot firm with Company / Workspace / Project / HP', () => {
    resetCompanyRegistryExtras();
    const provisioned = provisionPilotWorkspace({
      companyName: 'Nordic Homes',
    });
    assert.equal(provisioned.company.name, 'Nordic Homes');
    assert.match(provisioned.tenant.id, /nordic-homes/);
    assert.match(provisioned.workspace.name, /Nordic Homes/);
    assert.match(provisioned.project.packageRoot, /house-package/);
    const registry = getDefaultCompanyRegistry();
    assert.ok(registry.companies.some((c) => c.id === provisioned.company.id));
    resetCompanyRegistryExtras();
  });

  it('invite → activate → login enters workspace', () => {
    clearPlatformSession();
    resetInviteStore();
    const invite = createPilotInvite({
      email: 'pilot@nordic.local',
      displayName: 'Pilot User',
      roles: ['builder'],
      invitedByUserId: 'user-radim',
    });
    const activated = activateInvite({
      token: invite.token,
      password: 'pilot-pass',
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

  it('reports Pilot Ready YES for logged-in default session', () => {
    clearPlatformSession();
    const result = login({
      email: 'radim@conis.local',
      password: 'demo',
      rememberMe: false,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    const report = buildPilotReadyReport(result.session);
    assert.equal(report.ready, true);
    assert.equal(report.missingLabels.length, 0);
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
