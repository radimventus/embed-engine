/**
 * PT-VR-01A — Restore last Office working context (active case).
 * Browser-local only — not a multi-device SSOT.
 */

import { loadJson, removeJson, saveJson } from './officeLocalStore';
import { OFFICE_STORAGE_KEYS } from './officeStorageKeys';
import type { PilotWorkspaceCase, PilotWorkspaceCaseId } from './pilotWorkspaceModel';

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
  return stored.caseId;
}

export function writeStoredActiveCaseId(
  caseId: PilotWorkspaceCaseId | null,
): void {
  if (caseId === null || caseId.trim().length === 0) {
    removeJson(OFFICE_STORAGE_KEYS.workspaceRecovery);
    return;
  }
  saveJson(OFFICE_STORAGE_KEYS.workspaceRecovery, {
    caseId,
  } satisfies OfficeWorkspaceRecoveryState);
}

/**
 * Boot / fallback: last stored case if still present, else first available.
 * Never returns null when cases exist.
 */
export function resolveOfficeBootCaseId(
  cases: readonly PilotWorkspaceCase[],
  storedCaseId: PilotWorkspaceCaseId | null = readStoredActiveCaseId(),
): PilotWorkspaceCaseId | null {
  if (cases.length === 0) return null;
  if (
    storedCaseId !== null &&
    cases.some((item) => item.id === storedCaseId)
  ) {
    return storedCaseId;
  }
  return cases[0]?.id ?? null;
}
