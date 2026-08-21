import { platformApiOrigin } from './platformAccessClient';

export async function acceptHouseOperationalLead(input: {
  readonly leadId: string;
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
  readonly fetchImpl?: typeof fetch;
}): Promise<boolean> {
  const leadId = input.leadId.trim();
  const companyId = input.companyId.trim();
  const projectId = input.projectId.trim();
  const houseId = input.houseId.trim();
  if (
    leadId.length === 0 ||
    companyId.length === 0 ||
    projectId.length === 0 ||
    houseId.length === 0
  ) {
    return false;
  }
  const fetchImpl = input.fetchImpl ?? fetch;
  try {
    const response = await fetchImpl(
      `${platformApiOrigin().replace(/\/$/, '')}/partner/leads/${encodeURIComponent(leadId)}/accept`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ companyId, projectId, houseId }),
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}
