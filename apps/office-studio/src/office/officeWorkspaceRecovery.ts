/**
 * PT-VR-01A / CAP-PLAT-02b — Restore last Office working context (active projectId).
 * Browser-local UI pointer only — not a domain registry / multi-device SSOT.
 */

import { loadJson, removeJson, saveJson } from './officeLocalStore';
import { OFFICE_STORAGE_KEYS } from './officeStorageKeys';
import {
  resolvePilotProjectId,
  type PilotWorkspaceCase,
  type PilotWorkspaceCaseId,
} from './pilotWorkspaceModel';

export type OfficeWorkspaceRecoveryState = {
  readonly caseId: PilotWorkspaceCaseId;
};

function isRecoveryState(value: unknown): value is OfficeWorkspaceRecoveryState {
  if (value === null || typeof value !== 'object') return false;
  const caseId = (value as { caseId?: unknown }).caseId;
  return typeof caseId === 'string' && caseId.trim().length > 0;
}

export function readStoredActiveCaseId(): PilotWorkspaceCaseId | null {
  const stored = loadJson<unknown>(OFFICE_STORAGE_KEYS.workspaceRecovery, null);
  if (!isRecoveryState(stored)) return null;
  return resolvePilotProjectId(stored.caseId);
}

export function writeStoredActiveCaseId(
  caseId: PilotWorkspaceCaseId | null,
): void {
  const resolved = resolvePilotProjectId(caseId);
  if (resolved === null || resolved.trim().length === 0) {
    removeJson(OFFICE_STORAGE_KEYS.workspaceRecovery);
    return;
  }
  saveJson(OFFICE_STORAGE_KEYS.workspaceRecovery, {
    caseId: resolved,
  } satisfies OfficeWorkspaceRecoveryState);
}

/**
 * Boot precedence: shared canonical Project, then stored local mirror, then first
 * available case. Resolves legacy demo case ids → ProjectId.
 */
export function resolveOfficeBootCaseId(
  cases: readonly PilotWorkspaceCase[],
  storedCaseId: PilotWorkspaceCaseId | null = readStoredActiveCaseId(),
  sharedProjectId: string | null = null,
): PilotWorkspaceCaseId | null {
  if (cases.length === 0) return null;
  const resolvedShared = resolvePilotProjectId(sharedProjectId);
  if (
    resolvedShared !== null &&
    cases.some((item) => item.id === resolvedShared)
  ) {
    return resolvedShared;
  }
  const resolvedStored = resolvePilotProjectId(storedCaseId);
  if (
    resolvedStored !== null &&
    cases.some((item) => item.id === resolvedStored)
  ) {
    return resolvedStored;
  }
  return cases[0]?.id ?? null;
}
