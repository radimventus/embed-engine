/**
 * CAP-REF-05 — Deterministic repository-backed MODERN 4KK bootstrap.
 * DOCX files are never read at runtime.
 */

import {
  MODERN_4KK_KNOWLEDGE,
  MODERN_4KK_PRIORITY_FAQ,
  MODERN_4KK_SPECIFICATION,
} from './modern4kkFaqSource';
import { upsertHouseKnowledge } from '../knowledge/houseKnowledgeStore';
import { upsertHousePriorityFaq } from '../priority-faq/housePriorityFaqStore';
import { upsertHouseSpecification } from '../specification/houseSpecificationStore';

export function bootstrapModern4kkReferenceContent(): void {
  upsertHouseSpecification(MODERN_4KK_SPECIFICATION);
  upsertHouseKnowledge(MODERN_4KK_KNOWLEDGE);
  upsertHousePriorityFaq(MODERN_4KK_PRIORITY_FAQ);
}
