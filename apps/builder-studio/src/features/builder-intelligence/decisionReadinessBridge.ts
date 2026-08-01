/**
 * Thin bridge — Decision Readiness lives in Intelligence Core.
 */

import { buildDecisionReadiness as coreBuildDecisionReadiness } from '@embed-engine/intelligence';

import type { HousePackageEditSnapshot } from '../house-package/housePackageEditSession';
import type { HousePackageValidationReport } from '../house-package/housePackageValidationReport';
import { projectBuilderIntelligenceContext } from './builderIntelligenceAdapter';

export function buildDecisionReadiness(input: {
  readonly projectId: string;
  readonly snapshot: HousePackageEditSnapshot | null;
  readonly validationReport: HousePackageValidationReport | null;
}) {
  return coreBuildDecisionReadiness(projectBuilderIntelligenceContext(input));
}
