import type { LandOption } from './audit-panel';

export const AUDIT_LAND_HANDOFF_EVENT = 'conis:audit-land-handoff';

export function openAuditLandFlow(value: LandOption): void {
  window.dispatchEvent(
    new CustomEvent<LandOption>(AUDIT_LAND_HANDOFF_EVENT, { detail: value }),
  );
}
