import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  bootstrapProject,
  bootstrapWorkspace,
  canAccessStudio,
  getDefaultCompanyRegistry,
  login,
  logout,
  primaryRole,
  restoreSession,
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
});
