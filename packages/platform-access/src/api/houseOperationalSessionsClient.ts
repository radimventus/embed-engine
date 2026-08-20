import { platformApiOrigin } from './platformAccessClient';
import type { OperationalDecisionSnapshot } from '../operations/operationalTypes';

export async function fetchHouseOperationalSessions(input: {
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId?: string | null;
  readonly fetchImpl?: typeof fetch;
}): Promise<readonly OperationalDecisionSnapshot[]> {
  const companyId = input.companyId.trim();
  const projectId = input.projectId.trim();
  if (companyId.length === 0 || projectId.length === 0) {
    return [];
  }

  const params = new URLSearchParams({
    companyId,
    projectId,
  });
  const houseId = input.houseId?.trim() ?? '';
  if (houseId.length > 0) {
    params.set('houseId', houseId);
  }

  const fetchImpl = input.fetchImpl ?? fetch;
  try {
    const response = await fetchImpl(
      `${platformApiOrigin().replace(/\/$/, '')}/partner/decision-sessions?${params}`,
      {
        credentials: 'include',
      },
    );
    if (!response.ok) {
      return [];
    }
    const body = (await response.json()) as {
      readonly sessions?: readonly OperationalDecisionSnapshot[];
    };
    return Array.isArray(body.sessions) ? body.sessions : [];
  } catch {
    return [];
  }
}
