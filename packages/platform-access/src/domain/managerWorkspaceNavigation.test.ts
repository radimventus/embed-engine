import assert from 'node:assert/strict';
import test from 'node:test';
import {managerWorkspaceStudio, shouldRedirectManagerToWorkspace} from './managerWorkspaceNavigation';
import {clearPlatformSession, login, resetUserRegistry, resetOperatorPartnerEnvironmentForTests, updateSession, loadPlatformSession, switchOperatorPartnerStudio, workspaceStudiosForRoles} from '../index';

test('Manager deep links redirect; only allowed nested Workspace views render', () => {
  for (const studioId of ['office','builder','manager','client','sales'] as const) {
    assert.equal(shouldRedirectManagerToWorkspace({roles:['manager'],studioId,onWorkspaceHost:false,nestedWorkspaceView:false}),true);
    assert.equal(shouldRedirectManagerToWorkspace({roles:['manager'],studioId,onWorkspaceHost:false,nestedWorkspaceView:true}),studioId==='office'||studioId==='builder');
    assert.equal(shouldRedirectManagerToWorkspace({roles:['conis-admin'],studioId,onWorkspaceHost:false,nestedWorkspaceView:false}),false);
  }
  assert.equal(shouldRedirectManagerToWorkspace({roles:['manager'],studioId:'manager',onWorkspaceHost:true,nestedWorkspaceView:false}),false);
});

test('Manager cold/refresh defaults sanitize stale Office/Builder while retaining Pilot selections', () => {
  for(const value of [null,undefined,'office','builder','manager']) assert.equal(managerWorkspaceStudio(value),'manager');
  for(const value of ['client','sales']) assert.equal(managerWorkspaceStudio(value),value);
});

test('existing Workspace switch restores context from stale Office and keeps CS/SS/MS inside host', () => {
  resetUserRegistry();resetOperatorPartnerEnvironmentForTests();clearPlatformSession();
  assert.equal(login({email:'manager@ac.local',password:'demo',rememberMe:false}).ok,true);
  updateSession({activeStudioId:'office',workspaceContext:null});
  for(const surface of ['manager','client','sales','manager'] as const) {
    const result=switchOperatorPartnerStudio(surface,{navigate:false,retainWorkspace:true});
    assert.equal(result.ok,true);
    if(result.ok) assert.match(result.href,/\/studio\/workspace\/|:4183/);
    assert.equal(loadPlatformSession()?.workspaceContext?.activeStudio,surface);
  }
  for(const surface of ['office','builder'] as const) {
    assert.equal(switchOperatorPartnerStudio(surface,{navigate:false,retainWorkspace:true}).ok,false);
    assert.equal(loadPlatformSession()?.workspaceContext?.activeStudio,'manager');
  }
  assert.deepEqual(workspaceStudiosForRoles(['manager']),['client','sales','manager']);
  clearPlatformSession();resetOperatorPartnerEnvironmentForTests();
});
