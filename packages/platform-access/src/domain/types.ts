/**
 * EPIC-BX-14 — Platform Access domain model.
 * Pure identity / tenant / session types — no production IAM.
 */

export type PlatformStudioId = 'office' | 'builder' | 'manager' | 'sales';

/**
 * Prepared role hierarchy (RBAC soft for pilot).
 * CONIS Admin → Project Admin → Builder | Manager | Salesman
 */
export type PlatformRole =
  | 'conis-admin'
  | 'project-admin'
  | 'builder'
  | 'manager'
  | 'salesman';

export type PlatformUser = {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly roles: readonly PlatformRole[];
};

export type PlatformCompany = {
  readonly id: string;
  readonly name: string;
  readonly tenantId: string;
};

export type PlatformWorkspace = {
  readonly id: string;
  readonly companyId: string;
  readonly name: string;
};

export type PlatformProjectStatus = 'draft' | 'ready' | 'published';

export type PlatformProject = {
  readonly id: string;
  readonly workspaceId: string;
  readonly companyId: string;
  readonly name: string;
  /** Repo-relative HP-002 root — bootstrap only; HP schema unchanged. */
  readonly packageRoot: string;
  readonly status: PlatformProjectStatus;
  readonly slug: string;
  readonly objectType: string;
  readonly description: string;
};

export type PlatformSession = {
  readonly user: PlatformUser;
  readonly tenantId: string;
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId: string | null;
  /** null = Platform Landing (studio not chosen yet). */
  readonly activeStudioId: PlatformStudioId | null;
  readonly rememberMe: boolean;
  readonly issuedAt: string;
  readonly expiresAt: string | null;
  readonly lastLoginAt: string;
};

export type LoginCredentials = {
  readonly email: string;
  readonly password: string;
  readonly rememberMe: boolean;
};

export type WorkspaceBootstrap = {
  readonly user: PlatformUser;
  readonly company: PlatformCompany;
  readonly workspace: PlatformWorkspace;
  readonly project: PlatformProject | null;
  readonly studioId: PlatformStudioId | null;
};

export type ProjectBootstrap = {
  readonly workspace: PlatformWorkspace;
  readonly project: PlatformProject;
  readonly company: PlatformCompany;
  readonly housePackageRoot: string;
  readonly capabilitiesReady: boolean;
  readonly intelligenceReady: boolean;
};
