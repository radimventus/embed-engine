import { platformApiOrigin } from './platformAccessClient';
import type { OperationalLeadRecord } from '../operations/operationalTypes';

export async function fetchHouseOperationalLeads(input: {
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId?: string | null;
  readonly fetchImpl?: typeof fetch;
}): Promise<readonly OperationalLeadRecord[]> {
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
      `${platformApiOrigin().replace(/\/$/, '')}/partner/leads?${params}`,
      {
        credentials: 'include',
      },
    );
    if (!response.ok) {
      return [];
    }
    const body = (await response.json()) as {
      readonly leads?: readonly (OperationalLeadRecord & {
        readonly decisionSessionId?: string | null;
      })[];
    };
    if (!Array.isArray(body.leads)) {
      return [];
    }
    return body.leads.map((item) => ({
      ...item,
      decisionSessionId: item.decisionSessionId ?? null,
      processingStatus:
        item.processingStatus === 'accepted' ? 'accepted' : 'new',
    }));
  } catch {
    return [];
  }
}
