import type { LandOption } from './audit-panel';

export const AUDIT_LAND_HANDOFF_EVENT = 'conis:audit-land-handoff';

let pendingLandOption: LandOption | null = null;

export function openAuditLandFlow(value: LandOption): void {
  pendingLandOption = value;
  window.dispatchEvent(
    new CustomEvent<LandOption>(AUDIT_LAND_HANDOFF_EVENT, { detail: value }),
  );
}

export function consumeAuditLandFlow(): LandOption | null {
  const value = pendingLandOption;
  pendingLandOption = null;
  return value;
}
