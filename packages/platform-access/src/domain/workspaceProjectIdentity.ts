/**
 * PT-VR-08 — Shared Workspace project identity across Studios.
 * Office Open PE binds partner/project; Client/Manager/Sales read the same context.
 */

import type { SharedWorkspaceContext } from './workspaceContext';

/** Embed Experience package bound to the Office reference pilot. */
export const WORKSPACE_EMBED_OBJECT_ID = 'house-modern-01' as const;

export type WorkspaceProjectIdentity = {
  readonly partnerId: string;
  readonly partnerName: string;
  readonly companyId: string;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly projectLabel: string;
  /** Embed-mountable object package id. */
  readonly objectId: string;
};

/**
 * Normalize display fields carried on Shared Workspace Context.
 */
export function resolveWorkspaceProjectIdentity(
  ctx: SharedWorkspaceContext,
): WorkspaceProjectIdentity {
  const partnerName = ctx.partnerName?.trim() || ctx.partnerId;
  const projectLabel = ctx.projectLabel?.trim() || ctx.projectId;
  const objectId = ctx.objectId?.trim() || WORKSPACE_EMBED_OBJECT_ID;
  return {
    partnerId: ctx.partnerId,
    partnerName,
    companyId: ctx.companyId,
    workspaceId: ctx.workspaceId,
    projectId: ctx.projectId,
    projectLabel,
    objectId,
  };
}

/**
 * Client Experience title when Operator Workspace Context is active.
 * Example: `Domy s energií · Client Studio`
 */
export function formatWorkspaceClientTitle(partnerName: string): string {
  const name = partnerName.trim();
  if (name.length === 0) return 'Client Studio';
  return `${name} · Client Studio`;
}
