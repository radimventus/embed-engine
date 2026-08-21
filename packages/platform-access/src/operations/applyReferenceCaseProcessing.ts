import type { LeadProcessingStatus } from '../readiness/readinessTypes';
import type { HouseOperationalCase } from './operationalTypes';

export type OperationalCaseProcessingRecord = {
  readonly caseId: string;
  readonly companyId: string;
  readonly projectId: string;
  readonly houseId: string;
  readonly processingStatus: LeadProcessingStatus;
};

/**
 * Overlay durable REFERENCE processing state onto House-scoped cases.
 * REAL Lead processingStatus stays on the Lead record.
 */
export function applyReferenceCaseProcessing(
  cases: readonly HouseOperationalCase[],
  records: readonly OperationalCaseProcessingRecord[],
): readonly HouseOperationalCase[] {
  const accepted = new Set(
    records
      .filter((item) => item.processingStatus === 'accepted')
      .map((item) => item.caseId),
  );
  return cases.map((item) => {
    if (item.origin !== 'REFERENCE') {
      return item;
    }
    return {
      ...item,
      processingStatus: accepted.has(item.caseId) ? 'accepted' : 'new',
    };
  });
}
