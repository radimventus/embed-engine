/**
 * PT-VR-08 / PT-DATA-02 — Shared Workspace project identity across Studios.
 * Office Open PE binds partner/project; Client/Manager/Sales read the same context.
 */

import { DEFAULT_PROJECT_ID } from '../registry/defaults';
import type { SharedWorkspaceContext } from './workspaceContext';

/** Default Embed object bind = Shared Project id (legacy Gen1 aliases resolve in Runtime). */
export const WORKSPACE_EMBED_OBJECT_ID = DEFAULT_PROJECT_ID;

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
