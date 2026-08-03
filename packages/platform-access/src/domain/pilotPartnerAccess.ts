import type { PlatformRole } from '../domain/types';

/** CS-01 — pilot partner may enter Client / Manager / Sales only. */
export const PILOT_PARTNER_ROLES: readonly PlatformRole[] = Object.freeze([
  'manager',
  'salesman',
]);

export function isPilotPartnerRoles(roles: readonly PlatformRole[]): boolean {
  if (roles.includes('conis-admin') || roles.includes('project-admin')) {
    return false;
  }
  if (roles.includes('builder')) {
    return false;
  }
  return (
    roles.includes('manager') || roles.includes('salesman')
  );
}
