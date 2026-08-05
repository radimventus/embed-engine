export type {
  PlatformStudioId,
  PlatformRole,
  PlatformAccountStatus,
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
  SharedWorkspaceContext,
  WorkspaceRoleContext,
} from './domain/workspaceContext';
export { isSharedWorkspaceContext } from './domain/workspaceContext';

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
  PlatformRoleChangeEntry,
  PlatformPasswordReset,
  PlatformPasswordResetStatus,
} from './domain/pilotTypes';

export {
  PLATFORM_ROLE_LABELS,
  primaryRole,
  hasRole,
  canAccessStudio,
  studiosForRoles,
  defaultStudioForRoles,
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
  listUsers,
  getUser,
  findUserByEmail,
  createUser,
  updateUserProfile,
  setUserStatus,
  setUserRoles,
  setUserPassword,
  verifyUserPassword,
  upsertActivatedUser,
  touchUserLogin,
  touchUserActivity,
  touchUserLastStudio,
  resetUserRegistry,
  USER_REGISTRY_STORAGE_KEY,
} from './registry/userRegistry';

export {
  login,
  logout,
  restoreSession,
  updateSession,
  buildSession,
  changePassword,
  startPasswordReset,
  finishPasswordReset,
  peekPasswordResetToken,
  getSharedWorkspaceContext,
  isOperatorWorkspaceMode,
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
  CLOUD_APP_HOST,
  CLOUD_STUDIO_ENTRY_PATH,
  getCloudPlatformConfig,
  resolveCloudStudioHref,
  resolveCloudLandingHref,
  resolveClientStudioHref,
  resolvePilotOfferHref,
  resolvePilotEntryHref,
  resolveWorkspaceHostHref,
  resolvePartnerInviteHref,
  type CloudPlatformConfig,
  type PlatformDeployMode,
} from './cloud/cloudConfig';

export {
  WORKSPACE_SHELL_EMBED_QUERY,
  withWorkspaceShellEmbed,
  isWorkspaceShellEmbed,
  isOnWorkspaceHost,
} from './domain/workspaceShellEmbed';

export {
  createPilotInvite,
  findInviteByToken,
  listInvites,
  listPendingInvites,
  resendPilotInvite,
  revokePilotInvite,
  activateInvite,
  markInviteOpened,
  markInviteSent,
  findActivatedInviteUser,
  findActivatedInviteBinding,
  resetInviteStore,
  INVITE_STORAGE_KEY,
} from './pilot/inviteStore';

export {
  PILOT_PROVISION_QUERY,
  buildPilotProvisionSnapshot,
  encodePilotProvisionSnapshot,
  decodePilotProvisionSnapshot,
  hydratePilotProvisionSnapshot,
  readPilotProvisionFromUrl,
  offerSlugFromCompanyId,
  type PilotProvisionSnapshot,
} from './pilot/pilotProvisionSnapshot';

export {
  INVITE_VALIDITY_MS,
  computeInviteExpiresAt,
  isInvitePastExpiry,
  resolveInviteLifecycle,
  inviteLifecycleMessage,
  isInviteActivatable,
  type InviteLifecycleState,
} from './pilot/invitationWorkflow';

export {
  upsertPartnerBranding,
  getPartnerBranding,
  resetPartnerBrandingStore,
  PARTNER_BRANDING_STORAGE_KEY,
} from './pilot/partnerBrandingStore';

export {
  projectPartnerBrand,
  type StudioBrandProjection,
  type ProjectPartnerBrandInput,
} from './pilot/projectPartnerBrand';

export type { PartnerBranding } from './domain/partnerBranding';
export {
  DEFAULT_PILOT_BRANDING_HERO,
  DEFAULT_PILOT_BRANDING_LOGO,
} from './domain/partnerBranding';

export {
  PILOT_PARTNER_ROLES,
  isPilotPartnerRoles,
} from './domain/pilotPartnerAccess';

export {
  markPartnerWelcomePending,
  prepareWelcomeJourney,
  shouldShowPartnerWelcome,
  isPartnerOnboardingOpen,
  hasCompletedWelcomeJourney,
  dismissPartnerWelcome,
  completePartnerOnboarding,
  finishWelcomeJourney,
  resetPartnerWelcomeStore,
  PARTNER_WELCOME_STORAGE_KEY,
} from './pilot/welcomeStore';

export {
  WELCOME_TITLE,
  WELCOME_LEAD,
  WELCOME_PASSWORD_NOTE,
  WELCOME_STUDIO_INTROS,
  WELCOME_PRIMARY_CTA_LABEL,
  WELCOME_SECONDARY_CTA_LABEL,
  welcomeGreeting,
  welcomeEnvironmentLead,
  type WelcomeStudioIntro,
  type WelcomeStudioIntroId,
} from './pilot/welcomeExperience';

export {
  requestPasswordReset,
  completePasswordReset,
  findPasswordResetByToken,
  resetPasswordResetStore,
  PASSWORD_RESET_STORAGE_KEY,
} from './pilot/passwordResetStore';

export {
  recordRoleChange,
  listRoleChangeHistory,
  resetIdentityAudit,
  ROLE_AUDIT_STORAGE_KEY,
} from './pilot/identityAudit';

export {
  provisionPilotWorkspace,
  type PilotProvisionResult,
} from './pilot/provisionPilotWorkspace';

export {
  CONIS_SAMPLE_PROJECT_LABEL,
  PARTNER_PILOT_STUDIO_IDS,
  type PartnerPilotStudioId,
  type PilotStudioInitState,
  type PilotWorkspace,
} from './domain/pilotWorkspace';

export {
  initializePilotWorkspace,
  getPilotWorkspace,
  isPilotWorkspaceReady,
  listPilotWorkspaces,
  resetPilotWorkspaceStore,
  PILOT_WORKSPACE_STORAGE_KEY,
} from './pilot/pilotWorkspaceStore';

export {
  buildPartnerEnvironment,
  isPartnerEnvironmentReady,
  type PartnerEnvironment,
  type PartnerEnvironmentChecklist,
} from './pilot/partnerEnvironment';

export {
  enterOperatorPartnerEnvironment,
  switchOperatorPartnerStudio,
  returnFromOperatorPartnerEnvironment,
  getOperatorPartnerEnvironment,
  clearOperatorPartnerEnvironment,
  resetOperatorPartnerEnvironmentForTests,
  OPERATOR_PE_STORAGE_KEY,
  type OperatorPartnerEnvironmentState,
  type OperatorPeStudioSurface,
  type EnterOperatorPartnerEnvironmentInput,
  type EnterOperatorPartnerEnvironmentResult,
} from './pilot/operatorPartnerEnvironment';

export {
  WORKSPACE_STUDIO_SWITCH_ORDER,
  WORKSPACE_STUDIO_LABELS,
  workspaceStudiosForRoles,
  isWorkspaceStudioSurface,
  type WorkspaceStudioSurface,
} from './domain/workspaceStudioNavigation';

export {
  OperatorPartnerEnvironmentBar,
  WorkspaceStudioNavigation,
} from './react/OperatorPartnerEnvironmentBar';

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

export type {
  GaVerdict,
  GaChecklistState,
  GaMatrixAreaId,
  GaMatrixRow,
  GaHealthId,
  GaHealthItem,
  GaReleaseCertification,
  GaGoDecision,
  GaGoNoGoBoard,
  GaProductionChecklistItem,
  GaDashboard,
  GaExecutiveReport,
  GaReadinessReport,
} from './ga/gaTypes';

export { buildGaReadinessReport } from './ga/buildGaReadinessReport';

export {
  SessionProvider,
  usePlatformSession,
  usePlatformUserLabel,
  usePlatformRoleLabel,
  type PlatformSessionContextValue,
} from './react/SessionProvider';

export { AuthShell } from './react/AuthShell';
export { InviteShell } from './react/InviteShell';
export { PartnerWelcomeScreen } from './react/PartnerWelcomeScreen';
export { PlatformLanding } from './react/PlatformLanding';
export { PlatformAccessRoot } from './react/PlatformAccessRoot';
export { IdentityAccessCenter } from './react/IdentityAccessCenter';
export { GmReadinessCenter } from './react/GmReadinessCenter';
export { GaReadinessCenter } from './react/GaReadinessCenter';
export { useStudioBrandProjection } from './react/useStudioBrandProjection';
export { usePilotWorkspace } from './react/usePilotWorkspace';
