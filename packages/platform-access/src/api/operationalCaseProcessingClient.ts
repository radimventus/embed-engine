import { platformApiOrigin } from './platformAccessClient';
import type { OperationalCaseProcessingRecord } from '../operations/applyReferenceCaseProcessing';

export async function fetchOperationalCaseProcessing(input: {
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId?: string | null;
  readonly fetchImpl?: typeof fetch;
}): Promise<readonly OperationalCaseProcessingRecord[]> {
  const companyId = input.companyId.trim();
  const projectId = input.projectId.trim();
  if (companyId.length === 0 || projectId.length === 0) {
    return [];
  }
  const params = new URLSearchParams({ companyId, projectId });
  const houseId = input.houseId?.trim() ?? '';
  if (houseId.length > 0) {
    params.set('houseId', houseId);
  }
  const fetchImpl = input.fetchImpl ?? fetch;
  try {
    const response = await fetchImpl(
      `${platformApiOrigin().replace(/\/$/, '')}/partner/case-processing?${params}`,
      { credentials: 'include' },
    );
    if (!response.ok) {
      return [];
    }
    const body = (await response.json()) as {
      readonly cases?: readonly OperationalCaseProcessingRecord[];
    };
    if (!Array.isArray(body.cases)) {
      return [];
    }
    return body.cases.map((item) => ({
      ...item,
      processingStatus:
        item.processingStatus === 'accepted' ? 'accepted' : 'new',
    }));
  } catch {
    return [];
  }
}

export async function acceptOperationalReferenceCase(input: {
  readonly caseId: string;
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
  readonly fetchImpl?: typeof fetch;
}): Promise<boolean> {
  const caseId = input.caseId.trim();
  const companyId = input.companyId.trim();
  const projectId = input.projectId.trim();
  const houseId = input.houseId.trim();
  if (
    caseId.length === 0 ||
    companyId.length === 0 ||
    projectId.length === 0 ||
    houseId.length === 0
  ) {
    return false;
  }
  const fetchImpl = input.fetchImpl ?? fetch;
  try {
    const response = await fetchImpl(
      `${platformApiOrigin().replace(/\/$/, '')}/partner/case-processing/accept`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ caseId, companyId, projectId, houseId }),
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}
