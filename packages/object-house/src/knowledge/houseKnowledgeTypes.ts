/**
 * CAP-REF-03 — House-owned factual and explanatory knowledge.
 * Atoms are always addressed by houseId; they are never Project or Studio data.
 */

export type HouseKnowledgeScope =
  | 'PRODUCT'
  | 'DSE_KNOW_HOW'
  | 'REFERENCE_PROJECT'
  | 'HISTORICAL'
  | 'CUSTOMER_EVIDENCE';

export type HouseKnowledgeConfidence =
  | 'CONFIRMED'
  | 'DOCUMENTED'
  | 'INFERRED';

export type HouseKnowledgeTemporalStatus =
  | 'CURRENT'
  | 'HISTORICAL'
  | 'UNKNOWN';

/**
 * Provenance class for later conflict resolution.
 * Precedence: CURRENT_CONFIRMED > TECHNICAL_DOCUMENTATION >
 * PRODUCT_DOCUMENTATION > REFERENCE_EVIDENCE > HISTORICAL > INFERENCE.
 */
export type HouseKnowledgeSourceKind =
  | 'CURRENT_CONFIRMED'
  | 'TECHNICAL_DOCUMENTATION'
  | 'PRODUCT_DOCUMENTATION'
  | 'REFERENCE_EVIDENCE'
  | 'HISTORICAL'
  | 'INFERENCE';

export const HOUSE_KNOWLEDGE_SOURCE_PRECEDENCE: readonly HouseKnowledgeSourceKind[] =
  [
    'CURRENT_CONFIRMED',
    'TECHNICAL_DOCUMENTATION',
    'PRODUCT_DOCUMENTATION',
    'REFERENCE_EVIDENCE',
    'HISTORICAL',
    'INFERENCE',
  ];

export type HouseKnowledgeSource = {
  readonly sourceId: string;
  readonly kind: HouseKnowledgeSourceKind;
  readonly label?: string;
};

/**
 * Canonical House Knowledge atom.
 * `scope` prevents reference, historical, and customer evidence from being
 * treated as transferable current PRODUCT knowledge without an explicit change.
 */
export type HouseKnowledgeAtom = {
  readonly id: string;
  readonly houseId: string;
  readonly subject: string;
  readonly category: string;
  readonly statement: string;
  readonly scope: HouseKnowledgeScope;
  readonly confidence: HouseKnowledgeConfidence;
  readonly source: HouseKnowledgeSource;
  readonly validFrom?: string;
  readonly temporalStatus: HouseKnowledgeTemporalStatus;
  readonly constraints: readonly string[];
  /** Source-backed practical significance; never a conclusion about visitor intent. */
  readonly safeInterpretation?: string;
  /** Short source-backed payoff scan points; omitted when no safe compression exists. */
  readonly factPoint?: string;
  readonly interpretationPoint?: string;
  /** Conclusions that must not be inferred from this fact or Priority selection. */
  readonly unsupportedConclusions?: readonly string[];
  readonly relatedTopics: readonly string[];
};
