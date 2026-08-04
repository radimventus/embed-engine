/**
 * PT-16 — Workflow synchronization from Business Automation.
 * Overlay on demo cases — Automation advances commercial status automatically.
 */

import type { BusinessEvent } from '@embed-engine/business-automation';

import { resolveProjectIdFromEvent } from './officeTaskRegistry';
import type {
  PilotWorkspaceCase,
  PilotWorkspaceCaseStatus,
} from './pilotWorkspaceModel';

const statusByProject = new Map<string, PilotWorkspaceCaseStatus>();

export function workflowStatusForBusinessEvent(
  eventKind: string,
): PilotWorkspaceCaseStatus | null {
  switch (eventKind) {
    case 'OfferAccepted':
      return 'checkout';
    case 'OrderConfirmed':
      return 'waiting_payment';
    case 'ProformaGenerated':
      return 'waiting_payment';
    case 'PaymentConfirmed':
      return 'paid';
    case 'PilotReady':
      return 'pilot_ready';
    default:
      return null;
  }
}

export function applyBusinessEventToWorkflow(event: BusinessEvent): {
  readonly projectId: string;
  readonly status: PilotWorkspaceCaseStatus | null;
} {
  const projectId = resolveProjectIdFromEvent(event);
  const status = workflowStatusForBusinessEvent(event.kind);
  if (projectId.length > 0 && status !== null) {
    statusByProject.set(projectId, status);
  }
  return { projectId, status };
}

export function getSyncedWorkflowStatus(
  projectId: string,
): PilotWorkspaceCaseStatus | null {
  return statusByProject.get(projectId) ?? null;
}

/**
 * Merge automation-synced status onto a workspace case for Workflow / Detail.
 */
export function resolveCaseWithWorkflowSync(
  workspaceCase: PilotWorkspaceCase,
): PilotWorkspaceCase {
  const synced = statusByProject.get(workspaceCase.id);
  if (synced === undefined || synced === workspaceCase.status) {
    return workspaceCase;
  }
  return {
    ...workspaceCase,
    status: synced,
    updatedAt: new Date().toISOString(),
  };
}

export function resetCommercialWorkflowSyncForTests(): void {
  statusByProject.clear();
}
