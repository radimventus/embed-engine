/**
 * EPIC-BX-14 / OF-07 — Platform Access domain model.
 * Shared Identity & Access for all Studios (MVP pilot — not production IAM).
 */

import type { SharedWorkspaceContext } from './workspaceContext';

export type PlatformStudioId = 'office' | 'builder' | 'manager' | 'sales';

/**
 * Prepared role hierarchy (Permission Matrix).
 * CONIS Admin → Project Admin → Builder | Manager | Salesman
 */
export type PlatformRole =
  | 'conis-admin'
  | 'project-admin'
  | 'builder'
  | 'manager'
  | 'salesman';

/** Account lifecycle — OF-07 Identity. */
export type PlatformAccountStatus = 'active' | 'inactive';

export type PlatformUser = {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly roles: readonly PlatformRole[];
  readonly status: PlatformAccountStatus;
  readonly lastLoginAt: string | null;
  readonly lastActivityAt: string | null;
  /** PE-09 — last visited partner/studio surface (includes Client). */
  readonly lastStudioId: PlatformStudioId | 'client' | null;
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
  /**
   * OF-14 — Shared Workspace Context (cookie-backed with this session).
   * null = not in operator Workspace mode (partner journey unaffected).
   */
  readonly workspaceContext: SharedWorkspaceContext | null;
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
