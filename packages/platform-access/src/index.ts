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

export {
  PLATFORM_ROLE_LABELS,
  primaryRole,
  hasRole,
  canAccessStudio,
  studiosForRoles,
} from './domain/roles';

export {
  getDefaultCompanyRegistry,
  findCompany,
  findWorkspace,
  findProject,
  listWorkspacesForCompany,
  listProjectsForWorkspace,
  listProjectsForCompany,
  DEFAULT_COMPANY_ID,
  DEFAULT_WORKSPACE_ID,
  DEFAULT_PROJECT_ID,
  type CompanyRegistryState,
} from './registry/companyRegistry';

export {
  DEFAULT_COMPANIES,
  DEFAULT_WORKSPACES,
  DEFAULT_PROJECTS,
  DEMO_USERS,
} from './registry/defaults';

export {
  login,
  logout,
  restoreSession,
  updateSession,
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

export {
  SessionProvider,
  usePlatformSession,
  usePlatformUserLabel,
  usePlatformRoleLabel,
  type PlatformSessionContextValue,
} from './react/SessionProvider';

export { AuthShell } from './react/AuthShell';
export { PlatformLanding } from './react/PlatformLanding';
export { PlatformAccessRoot } from './react/PlatformAccessRoot';
