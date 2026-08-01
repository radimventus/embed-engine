export type {
  PlatformStudioId,
  PlatformRole,
  PlatformUser,
  PlatformCompany,
  PlatformWorkspace,
  PlatformProjectStatus,
  PlatformProject,
  PlatformSession,
  LoginCredentials,
  WorkspaceBootstrap,
  ProjectBootstrap,
} from './domain/types';

export type {
  PlatformTenant,
  PilotInvite,
  PilotInviteStatus,
  TenantBootstrap,
  PilotActivityEntry,
  PilotDiagnostics,
  PilotReadyCheck,
  PilotReadyCheckId,
  PilotReadyReport,
  PlatformFeedbackPayload,
} from './domain/pilotTypes';

export {
  PLATFORM_ROLE_LABELS,
  primaryRole,
  hasRole,
  canAccessStudio,
  studiosForRoles,
  isPlatformAdmin,
} from './domain/roles';

export {
  getDefaultCompanyRegistry,
  findCompany,
  findWorkspace,
  findProject,
  findTenant,
  listWorkspacesForCompany,
  listProjectsForWorkspace,
  listProjectsForCompany,
  appendPilotProvision,
  resetCompanyRegistryExtras,
  DEFAULT_COMPANY_ID,
  DEFAULT_WORKSPACE_ID,
  DEFAULT_PROJECT_ID,
  type CompanyRegistryState,
} from './registry/companyRegistry';

export {
  DEFAULT_COMPANIES,
  DEFAULT_WORKSPACES,
  DEFAULT_PROJECTS,
  DEFAULT_TENANTS,
  DEFAULT_TENANT_ID,
  DEMO_USERS,
  PILOT_HOUSE_PACKAGE_ROOT,
} from './registry/defaults';

export {
  login,
  logout,
  restoreSession,
  updateSession,
  buildSession,
  type AuthResult,
} from './session/authService';

export {
  loadPlatformSession,
  savePlatformSession,
  clearPlatformSession,
  PLATFORM_SESSION_COOKIE,
  PLATFORM_SESSION_STORAGE_KEY,
} from './session/sessionStore';

export {
  bootstrapWorkspace,
  resolveStudioHref,
} from './bootstrap/workspaceBootstrap';

export { bootstrapProject } from './bootstrap/projectBootstrap';
export { bootstrapTenant } from './bootstrap/tenantBootstrap';

export {
  CLOUD_PLATFORM_ORIGIN,
  getCloudPlatformConfig,
  resolveCloudStudioHref,
  resolveCloudLandingHref,
  type CloudPlatformConfig,
  type PlatformDeployMode,
} from './cloud/cloudConfig';

export {
  createPilotInvite,
  findInviteByToken,
  listPendingInvites,
  activateInvite,
  findActivatedInviteUser,
  resetInviteStore,
  INVITE_STORAGE_KEY,
} from './pilot/inviteStore';

export {
  provisionPilotWorkspace,
  type PilotProvisionResult,
} from './pilot/provisionPilotWorkspace';

export {
  recordPlatformActivity,
  listRecentActivity,
  recordLastPublish,
  readLastPublish,
  buildPilotDiagnostics,
  buildPilotReadyReport,
} from './pilot/pilotDiagnostics';

export {
  submitPlatformFeedback,
  listPlatformFeedback,
  FEEDBACK_STORAGE_KEY,
} from './pilot/feedbackStore';

export type {
  GmVerdict,
  GmChecklistState,
  GmDomainId,
  GmDomainReport,
  GmHealthId,
  GmHealthItem,
  GmOperationalHealth,
  GmPilotLifecycle,
  GmPilotFirmStatus,
  GmPilotStatusSummary,
  GmChecklistItemId,
  GmChecklistItem,
  GmEngineeringDebtItem,
  GmExecutiveStage,
  GmExecutiveSummary,
  GmReadinessReport,
} from './gm/gmTypes';

export { GM_ENGINEERING_DEBT } from './gm/gmEngineeringDebt';
export { buildGmOperationalHealth } from './gm/buildGmOperationalHealth';
export { buildGmDomainReports } from './gm/buildGmDomainReports';
export { buildGmPilotStatusSummary } from './gm/buildGmPilotStatus';
export { buildGmChecklist } from './gm/buildGmChecklist';
export { buildGmReadinessReport } from './gm/buildGmReadinessReport';

export {
  SessionProvider,
  usePlatformSession,
  usePlatformUserLabel,
  usePlatformRoleLabel,
  type PlatformSessionContextValue,
} from './react/SessionProvider';

export { AuthShell } from './react/AuthShell';
export { InviteShell } from './react/InviteShell';
export { PlatformLanding } from './react/PlatformLanding';
export { PlatformAccessRoot } from './react/PlatformAccessRoot';
export { GmReadinessCenter } from './react/GmReadinessCenter';
