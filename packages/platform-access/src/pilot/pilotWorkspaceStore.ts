/**
 * PE-03 — Pilot Workspace store + initialization.
 * Attaches CONIS sample project and marks Client / Manager / Sales ready.
 */

import type { PilotProvisionResult } from './provisionPilotWorkspace';
import {
  CONIS_SAMPLE_PROJECT_LABEL,
  PARTNER_PILOT_STUDIO_IDS,
  type PartnerPilotStudioId,
  type PilotStudioInitState,
  type PilotWorkspace,
} from '../domain/pilotWorkspace';
import { PILOT_HOUSE_PACKAGE_ROOT } from '../registry/defaults';
import { recordPlatformActivity } from './pilotDiagnostics';

export const PILOT_WORKSPACE_STORAGE_KEY = 'conis.platform.pilot-workspace.v1';

type PilotWorkspaceStore = {
  readonly byCompanyId: Record<string, PilotWorkspace>;
};

let memoryStore: PilotWorkspaceStore = { byCompanyId: {} };

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function loadStore(): PilotWorkspaceStore {
  if (!canUseStorage()) return memoryStore;
  try {
    const raw = localStorage.getItem(PILOT_WORKSPACE_STORAGE_KEY);
    if (raw === null || raw.length === 0) return memoryStore;
    const parsed = JSON.parse(raw) as {
      byCompanyId?: Record<string, PilotWorkspace>;
    };
    memoryStore = {
      byCompanyId:
        parsed.byCompanyId !== null && typeof parsed.byCompanyId === 'object'
          ? parsed.byCompanyId
          : {},
    };
    return memoryStore;
  } catch {
    return memoryStore;
  }
}

function saveStore(store: PilotWorkspaceStore): void {
  memoryStore = store;
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(PILOT_WORKSPACE_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

export function resetPilotWorkspaceStore(): void {
  memoryStore = { byCompanyId: {} };
  if (canUseStorage()) {
    localStorage.removeItem(PILOT_WORKSPACE_STORAGE_KEY);
  }
}

function buildStudioInit(at: string): Readonly<
  Record<PartnerPilotStudioId, PilotStudioInitState>
> {
  const studios = {} as Record<PartnerPilotStudioId, PilotStudioInitState>;
  for (const studioId of PARTNER_PILOT_STUDIO_IDS) {
    studios[studioId] = { ready: true, initializedAt: at };
  }
  return studios;
}

/**
 * Initialize a fully ready Pilot Workspace from a provisioned firm.
 * Idempotent per companyId.
 */
export function initializePilotWorkspace(
  provision: PilotProvisionResult,
): PilotWorkspace {
  const store = loadStore();
  const existing = store.byCompanyId[provision.company.id];
  if (existing !== undefined) {
    return existing;
  }

  const createdAt = new Date().toISOString();
  const workspace: PilotWorkspace = {
    id: `pilot-ws-${provision.company.id}`,
    companyId: provision.company.id,
    workspaceId: provision.workspace.id,
    projectId: provision.project.id,
    sampleProjectLabel: CONIS_SAMPLE_PROJECT_LABEL,
    packageRoot: provision.project.packageRoot || PILOT_HOUSE_PACKAGE_ROOT,
    studios: buildStudioInit(createdAt),
    createdAt,
  };

  saveStore({
    byCompanyId: {
      ...store.byCompanyId,
      [provision.company.id]: workspace,
    },
  });

  recordPlatformActivity({
    label: 'Pilot Workspace připraven',
    detail: `${provision.company.name} · ${CONIS_SAMPLE_PROJECT_LABEL} · Client/Manager/Sales`,
  });

  return workspace;
}

export function getPilotWorkspace(companyId: string): PilotWorkspace | null {
  return loadStore().byCompanyId[companyId] ?? null;
}

export function isPilotWorkspaceReady(companyId: string): boolean {
  const workspace = getPilotWorkspace(companyId);
  if (workspace === null) return false;
  return PARTNER_PILOT_STUDIO_IDS.every(
    (studioId) => workspace.studios[studioId]?.ready === true,
  );
}

export function listPilotWorkspaces(): readonly PilotWorkspace[] {
  return Object.values(loadStore().byCompanyId);
}
