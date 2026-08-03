/**
 * PE-03 — Pilot Workspace projection for partner studios.
 */

import { useMemo } from 'react';

import {
  getPilotWorkspace,
  isPilotWorkspaceReady,
} from '../pilot/pilotWorkspaceStore';
import type { PilotWorkspace } from '../domain/pilotWorkspace';
import { usePlatformSession } from './SessionProvider';

export type PilotWorkspaceProjection = {
  readonly workspace: PilotWorkspace;
  readonly ready: boolean;
};

/**
 * Returns the initialized Pilot Workspace for the current session company.
 * Office / Builder are never part of this surface.
 */
export function usePilotWorkspace(): PilotWorkspaceProjection | null {
  const { session } = usePlatformSession();
  return useMemo(() => {
    if (session === null) return null;
    const workspace = getPilotWorkspace(session.companyId);
    if (workspace === null) return null;
    return {
      workspace,
      ready: isPilotWorkspaceReady(session.companyId),
    };
  }, [session]);
}
