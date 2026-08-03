/**
 * OF-03 — Sales pipeline filter helpers.
 */

import type {
  OfficePipelineStage,
  OfficeSalesCase,
} from './officeSalesModel';
import { OFFICE_PIPELINE_STAGE_LABELS } from './officeSalesModel';
import { getPartner } from './officePartnerRegistry';

export type SalesPipelineFilter = 'all' | OfficePipelineStage;

export function matchesSalesCaseQuery(
  salesCase: OfficeSalesCase,
  query: string,
): boolean {
  if (query.length === 0) return true;
  const partner = getPartner(salesCase.partnerId);
  const haystack = [
    partner?.name ?? '',
    salesCase.offer.title,
    salesCase.offer.personalNote,
    OFFICE_PIPELINE_STAGE_LABELS[salesCase.stage],
    salesCase.offer.packageId ?? '',
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

export function filterSalesCases(
  cases: readonly OfficeSalesCase[],
  query: string,
  stageFilter: SalesPipelineFilter,
): readonly OfficeSalesCase[] {
  const normalized = query.trim().toLowerCase();
  return cases.filter((entry) => {
    if (stageFilter !== 'all' && entry.stage !== stageFilter) return false;
    return matchesSalesCaseQuery(entry, normalized);
  });
}
