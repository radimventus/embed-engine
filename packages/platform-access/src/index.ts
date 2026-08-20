export type {
  PlatformStudioId,
  PlatformRole,
  PlatformAccountStatus,
  PlatformUser,
  PlatformCompany,
  PlatformWorkspace,
  PlatformProjectStatus,
  PlatformProject,
  PlatformHouse,
  ReferenceHouseProvenance,
  PlatformSession,
  LoginCredentials,
  WorkspaceBootstrap,
  ProjectBootstrap,
} from './domain/types';

export {
  BUNGALOV_4KK_REFERENCE_SOURCE_ID,
  BUNGALOV_4KK_REFERENCE_SOURCE,
  derivePartnerDraftHouseId,
  deriveReferenceInstanceHouseId,
  getReferenceHouseSource,
  listReferenceHouseSources,
  referenceInstanceProvenance,
  resolveCanonicalKnowledgeHouseId,
  type ReferenceHouseSource,
  type ReferenceSourceLifecycle,
} from './reference/referenceSourceRegistry';

export type {
  SharedWorkspaceContext,
  WorkspaceAuthoredHouseIdentity,
  WorkspaceRoleContext,
} from './domain/workspaceContext';
export { isSharedWorkspaceContext } from './domain/workspaceContext';
export type {
  WorkspaceHouseIdentity,
  WorkspaceHouseRuntimeBinding,
} from './domain/workspaceHouseProjection';
export {
  listWorkspaceHouses,
  resolveWorkspaceHouseBinding,
  upsertWorkspaceAuthoredHouse,
} from './domain/workspaceHouseProjection';
export {
  WORKSPACE_PROJECT_CHANGE_MESSAGE_TYPE,
  WORKSPACE_HOUSE_CHANGE_MESSAGE_TYPE,
  WORKSPACE_HOUSE_SCOPE_REQUEST_MESSAGE_TYPE,
  createWorkspaceProjectChangeMessage,
  createWorkspaceHouseChangeMessage,
  createWorkspaceHouseScopeRequestMessage,
  isWorkspaceProjectChangeMessage,
  isWorkspaceHouseChangeMessage,
  isWorkspaceHouseScopeRequestMessage,
  type WorkspaceProjectChangeMessage,
  type WorkspaceHouseChangeMessage,
  type WorkspaceHouseScopeRequestMessage,
} from './domain/workspaceProjectSync';

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
  getCanonicalWorkspaceForCompany,
  findProject,
  findTenant,
  listWorkspacesForCompany,
  listProjectsForWorkspace,
  listProjectsForCompany,
  appendPilotProvision,
  resetCompanyRegistryExtras,
  upsertBuilderProject,
  removeBuilderProject,
  setBuilderProjectStatus,
  createCanonicalPartner,
  mergeProjects,
  isSeedProjectId,
  upsertBuilderCompany,
  upsertBuilderCanonicalProject,
  upsertBuilderWorkspace,
  DEFAULT_COMPANY_ID,
  DEFAULT_WORKSPACE_ID,
  DEFAULT_PROJECT_ID,
  type CompanyRegistryState,
  type CreateCanonicalPartnerInput,
  type CanonicalPartnerIdentity,
} from './registry/companyRegistry';

export {
  applyDurableProjectConfigs,
  resetDurableProjectConfigs,
  type DurableProjectConfigOverlay,
} from './registry/durableProjectConfig';

export {
  applyDurableCompanyContacts,
  durableCompanyContact,
  resetDurableCompanyContacts,
} from './registry/durableCompanyContact';

export {
  OFFICE_REFERENCE_PARTNER_ID,
  canonicalCompanyIdForOfficePartner,
} from './partner/canonicalOfficePartner';

export {
  OFFICE_PARTNER_STATUSES,
  InvalidOfficePartnerError,
  normalizeDurableOfficePartner,
  parseStoredOfficePartner,
  type DurableOfficeCompanyCard,
  type DurableOfficeContactCard,
  type DurableOfficePartner,
  type DurableOfficePartnerDraft,
  type DurableOfficePartnerStatus,
} from './partner/officePartnerRecord';

export {
  emptyPublicCompanyContact,
  projectPublicCompanyContact,
  type PublicCompanyContact,
} from './partner/publicCompanyContact';

export { normalizeProjectPrivacyUrl } from './project/projectPrivacyUrl';

export {
  DEFAULT_COMPANIES,
  DEFAULT_WORKSPACES,
  DEFAULT_PROJECTS,
  DEFAULT_TENANTS,
  DEFAULT_TENANT_ID,
  DEFAULT_CANONICAL_PROJECT_ID,
  DEMO_USERS,
  DSE_BUNGALOV_4KK_HOUSE_ID,
  DSE_CANONICAL_PROJECT_ID,
  DSE_COMPANY_ID,
  DSE_FIRST_DRAFT_HOUSE_ID,
  DSE_TENANT_ID,
  DSE_WORKSPACE_ID,
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
  isHouseInProject,
  type AuthResult,
} from './session/authService';

export {
  loadPlatformSession,
  savePlatformSession,
  clearPlatformSession,
} from './session/sessionStore';

export {
  bootstrapWorkspace,
  resolveStudioHref,
} from './bootstrap/workspaceBootstrap';

export { bootstrapProject } from './bootstrap/projectBootstrap';
export { bootstrapTenant } from './bootstrap/tenantBootstrap';

export type {
  SharedProject,
  SharedProjectDocumentRef,
  SharedProjectRuntimeView,
  SharedProjectManifest,
  BuilderProjectWriteInput,
} from './project';
export {
  packageRootToPublicUrl,
  listSharedProjects,
  listPublishedProjects,
  getSharedProject,
  upsertBuilderSharedProject,
  publishSharedProject,
  deleteSharedProject,
  setSharedProjectStatus,
  updateSharedProjectManifest,
  syncBuilderWorkspaceHouse,
  resetSharedProjectManifestsForTests,
  openProject,
  resolveActiveProjectView,
  resolveMountProjectView,
  normalizeProjectIdCandidate,
  LEGACY_OBJECT_ID_TO_PROJECT_ID,
  listOpenablePublishedProjects,
  MANIFEST_STORAGE_KEY,
} from './project';

export type {
  CanonicalBindSource,
  CanonicalPartnerProjection,
  CanonicalProjectIdentity,
  CanonicalHouseProjection,
  CanonicalBrandingProjection,
  CanonicalPublicationProjection,
  CanonicalExperienceRefs,
  CanonicalRuntimeBinding,
  CanonicalProjectProjection,
  CanonicalEntityHierarchy,
  CanonicalCompanyProjection,
  ResolveCanonicalRuntimeBindingInput,
} from './projection/canonicalProjectTypes';
export {
  projectCanonicalFromShared,
  listCanonicalProjects,
  listCanonicalCompanies,
  getCanonicalCompany,
  listCanonicalHouses,
  listCanonicalHouseEntities,
  getCanonicalProject,
  getCanonicalHouse,
  getCanonicalHouseEntity,
  toCanonicalEntityHierarchy,
  isCanonicalProjectId,
  isCanonicalSeedProject,
  resolveCanonicalRuntimeBinding,
} from './projection/canonicalProjectProjection';

export {
  CLOUD_PLATFORM_ORIGIN,
  CLOUD_APP_HOST,
  CLOUD_STUDIO_ENTRY_PATH,
  getCloudPlatformConfig,
  resolveCloudStudioHref,
  resolveCloudLandingHref,
  resolveClientStudioHref,
  resolveBuilderStudioHref,
  resolvePilotOfferHref,
  resolvePublicLegalHref,
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
  withCurrentSearchParams,
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
  createPlatformAccessInviteClient,
  createPlatformAccessAuthClient,
  platformApiOrigin,
  type PlatformAccessInvite,
  type PlatformAccessAuthClient,
  type PlatformAccessAuthResult,
  type PlatformAccessInviteActivation,
  type PlatformAccessInviteClient,
  type PlatformAccessInviteCreateInput,
  type PlatformAccessInviteIssue,
} from './api/platformAccessClient';

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
  resolvePilotWorkspace,
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
  enterOperatorPartnerEnvironmentAuthoritatively,
  switchOperatorPartnerStudio,
  returnFromOperatorPartnerEnvironment,
  getOperatorPartnerEnvironment,
  restoreAuthenticatedPartnerEnvironment,
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
  HIGH_INTENT_THRESHOLD,
  aggregateHouseOperations,
  selectHouseOperationalCases,
  selectScopedOperationalCases,
  REFERENCE_CASE_TEMPLATE_IDS,
  type HouseOperationalAggregate,
  type HouseOperationalCase,
  type OperationalHouseScope,
  type OperationalJourneyStep,
  type OperationalLeadRecord,
  type OperationalOrigin,
  type ProfilZajemce,
} from './operations/index';
export { fetchHouseOperationalLeads } from './api/houseOperationalLeadsClient';
export {
  useHouseOperationalCases,
  type HouseOperationalCasesState,
} from './react/useHouseOperationalCases';

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
export { SelectPilotProgramCta } from './react/SelectPilotProgramCta';
export { PlatformLanding } from './react/PlatformLanding';
export { PlatformAccessRoot } from './react/PlatformAccessRoot';
export { IdentityAccessCenter } from './react/IdentityAccessCenter';
export { GmReadinessCenter } from './react/GmReadinessCenter';
export { GaReadinessCenter } from './react/GaReadinessCenter';
export { useStudioBrandProjection } from './react/useStudioBrandProjection';
export { usePilotWorkspace } from './react/usePilotWorkspace';
