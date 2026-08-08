/**
 * OF-14 — Shared Workspace Context (SSOT for active Workspace).
 * Lives on PlatformSession (cookie) so all Studio hosts share it.
 */

import type { PlatformRole } from './types';
import type { WorkspaceStudioSurface } from './workspaceStudioNavigation';

/** CAP-VR39a — cross-origin identity projection for a Builder-authored draft. */
export type WorkspaceAuthoredHouseIdentity = {
  readonly houseId: string;
  readonly name: string;
  readonly canonicalProjectId: string;
  readonly dataMode: 'REFERENCE_DEMO' | 'LIVE_EMPTY' | 'LIVE';
  readonly status: 'draft';
};

/**
 * Operator Workspace bookmark — set only after CONIS Admin Open PE
 * (or equivalent Workspace entry). Partner Invite→NDA→Welcome path
 * leaves this null.
 */
export type SharedWorkspaceContext = {
  readonly operatorMode: true;
  readonly partnerId: string;
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId: string;
  /** CAP-VR39a — identity-only draft projection for authenticated Workspace Studios. */
  readonly authoredHouseIdentities?: readonly WorkspaceAuthoredHouseIdentity[];
  /** Display name when Office Open PE binds branding (optional). */
  readonly partnerName?: string;
  /** Project label for Workspace chrome (optional). */
  readonly projectLabel?: string;
  /** Default Embed object package id (optional). */
  readonly objectId?: string;
  /** Workspace Navigation active surface (includes Client). */
  readonly activeStudio: WorkspaceStudioSurface;
  readonly officeReturnHref: string;
  readonly previous: {
    readonly tenantId: string;
    readonly companyId: string;
    readonly workspaceId: string;
    readonly projectId: string | null;
  };
};

export function isSharedWorkspaceContext(
  value: unknown,
): value is SharedWorkspaceContext {
  if (value === null || typeof value !== 'object') return false;
  const ctx = value as Partial<SharedWorkspaceContext>;
  return (
    ctx.operatorMode === true &&
    typeof ctx.partnerId === 'string' &&
    typeof ctx.companyId === 'string' &&
    typeof ctx.workspaceId === 'string' &&
    typeof ctx.projectId === 'string' &&
    typeof ctx.activeStudio === 'string' &&
    typeof ctx.officeReturnHref === 'string' &&
    ctx.previous !== null &&
    typeof ctx.previous === 'object' &&
    typeof ctx.previous.tenantId === 'string' &&
    typeof ctx.previous.companyId === 'string' &&
    typeof ctx.previous.workspaceId === 'string'
  );
}

/** Role context for Workspace Navigation — always from live session roles. */
export type WorkspaceRoleContext = {
  readonly roles: readonly PlatformRole[];
};
