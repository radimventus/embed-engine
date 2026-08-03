/**
 * EPIC-BX-15 — Tenant / Pilot / Invite / Diagnostics domain types.
 */

import type {
  PlatformCompany,
  PlatformProject,
  PlatformRole,
  PlatformStudioId,
  PlatformUser,
  PlatformWorkspace,
} from './types';

export type PlatformTenant = {
  readonly id: string;
  readonly name: string;
  readonly companyId: string;
  readonly pilot: boolean;
  readonly createdAt: string;
};

export type PilotInviteStatus = 'pending' | 'activated' | 'revoked';

export type PilotInvite = {
  readonly id: string;
  readonly token: string;
  readonly email: string;
  readonly displayName: string;
  readonly roles: readonly PlatformRole[];
  readonly tenantId: string;
  readonly companyId: string;
  readonly workspaceId: string;
  readonly status: PilotInviteStatus;
  readonly createdAt: string;
  readonly activatedAt: string | null;
  readonly invitedByUserId: string;
  /** Last invitation e-mail send (MVP local delivery stamp). */
  readonly lastSentAt: string;
  readonly sendCount: number;
};

/** OF-07 — immutable role-change audit entry. */
export type PlatformRoleChangeEntry = {
  readonly id: string;
  readonly userId: string;
  readonly at: string;
  readonly previousRoles: readonly PlatformRole[];
  readonly nextRoles: readonly PlatformRole[];
  readonly changedByUserId: string;
  readonly detail: string;
};

export type PlatformPasswordResetStatus = 'pending' | 'used' | 'expired';

/** OF-07 — password reset token (MVP local). */
export type PlatformPasswordReset = {
  readonly id: string;
  readonly email: string;
  readonly token: string;
  readonly status: PlatformPasswordResetStatus;
  readonly createdAt: string;
  readonly usedAt: string | null;
};

export type TenantBootstrap = {
  readonly tenant: PlatformTenant;
  readonly company: PlatformCompany;
  readonly workspace: PlatformWorkspace;
  readonly project: PlatformProject | null;
  readonly user: PlatformUser;
  readonly studioId: PlatformStudioId | null;
};

export type PilotActivityEntry = {
  readonly id: string;
  readonly at: string;
  readonly label: string;
  readonly detail: string;
};

export type PilotDiagnostics = {
  readonly lastLoginAt: string | null;
  readonly lastPublishAt: string | null;
  readonly lastPublishLabel: string;
  readonly runtimeStatus: 'ready' | 'unknown' | 'missing';
  readonly capabilityStatus: 'ready' | 'degraded' | 'missing';
  readonly intelligenceStatus: 'ready' | 'missing';
  readonly sessionActive: boolean;
  readonly tenantId: string | null;
  readonly companyName: string | null;
  readonly projectName: string | null;
};

export type PilotReadyCheckId =
  | 'login'
  | 'tenant'
  | 'workspace'
  | 'project'
  | 'house-package'
  | 'runtime'
  | 'capabilities'
  | 'intelligence';

export type PilotReadyCheck = {
  readonly id: PilotReadyCheckId;
  readonly label: string;
  readonly ok: boolean;
  readonly detail: string;
};

export type PilotReadyReport = {
  readonly ready: boolean;
  readonly checks: readonly PilotReadyCheck[];
  readonly missingLabels: readonly string[];
};

export type PlatformFeedbackPayload = {
  readonly message: string;
  readonly email: string | null;
  readonly studioId: PlatformStudioId | null;
  readonly companyId: string | null;
  readonly createdAt: string;
};
