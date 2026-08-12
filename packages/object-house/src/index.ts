export type {
  HousePackage,
  HouseIdentity,
  HouseOverview,
  HouseLocation,
  HouseMetadata,
  HouseDocument,
} from "./HousePackage";
export type { MediaAsset, MediaAssetType } from "./MediaAsset";
export type { Room } from "./Room";
export { REFERENCE_HOUSE_PACKAGE } from "./reference-house-package";
export { projectHouse } from "./projectHouse";
export {
  HOUSE_DECISION_FLOW,
  HOUSE_DECISION_FLOW_START_ID,
  interpretHouseHighlights,
  type HouseInterpretation,
} from "./decision";
export {
  DISPOSITION_LAYOUT_PACK,
  createDispositionLayoutComposer,
  getDispositionMove,
  HOUSEHOLD_CHOICES,
  HOUSEHOLD_PROFILE_FACT_KEY,
  isHouseholdProfile,
  recommendPromptFor,
  getDecisionFactors,
  storyConsideredStairs,
  DISPOSITION_PRIORITY_LABELS_CS,
  dispositionPriorityLabel,
  type HouseholdProfile,
  type DecisionFactor,
} from "./behavior";

/** CAP-REF-02 — House Specification (House-owned product data). */
export type {
  HouseSpecification,
  HouseSpecificationIdentity,
  HouseSpecificationDimensions,
  HouseSpecificationDisposition,
  HouseSpecificationConstruction,
  HouseSpecificationEnergy,
  HouseSpecificationTechnologies,
  HouseSpecificationMaterials,
  HouseSpecificationEquipment,
  HouseSpecificationPrice,
  HouseSpecificationDelivery,
  HouseSpecificationVariants,
  HouseSpecificationLimitations,
  HouseSpecificationStatus,
  HousePriceBasis,
  HouseNumericRange,
  HouseDispositionRoom,
  HouseSpecificationOption,
  HousePriceValidity,
} from "./specification/houseSpecificationTypes";
export {
  REFERENCE_HOUSE_ID,
  REFERENCE_HOUSE_NAME,
  REFERENCE_HOUSE_SLUG,
  REFERENCE_PROJECT_ID,
  REFERENCE_COMPANY_ID,
} from "./specification/houseSpecificationTypes";
export {
  createReferenceHouseSpecificationShell,
  ensureReferenceHouseSpecification,
  getHouseSpecification,
  upsertHouseSpecification,
  updateHouseSpecificationCategories,
  listHouseSpecificationIds,
  resetHouseSpecificationsForTests,
} from "./specification/houseSpecificationStore";

/** CAP-REF-03 — House Knowledge (House-owned factual/explanatory atoms). */
export type {
  HouseKnowledgeAtom,
  HouseKnowledgeConfidence,
  HouseKnowledgeScope,
  HouseKnowledgeSource,
  HouseKnowledgeSourceKind,
  HouseKnowledgeTemporalStatus,
} from "./knowledge/houseKnowledgeTypes";
export { HOUSE_KNOWLEDGE_SOURCE_PRECEDENCE } from "./knowledge/houseKnowledgeTypes";
export {
  ensureReferenceHouseKnowledge,
  getHouseKnowledge,
  listHouseKnowledge,
  upsertHouseKnowledge,
  upsertHouseKnowledgeAtom,
  resetHouseKnowledgeForTests,
} from "./knowledge/houseKnowledgeStore";

/** CAP-REF-04 — House Priority FAQ (House-owned advisory items). */
export type {
  HousePriority,
  HousePriorityFaqItem,
} from "./priority-faq/housePriorityFaqTypes";
export { HOUSE_PRIORITY_LABELS } from "./priority-faq/housePriorityFaqTypes";
export {
  ensureReferenceHousePriorityFaq,
  getHousePriorityFaqItem,
  listHousePriorityFaq,
  listHousePriorityFaqByPriority,
  upsertHousePriorityFaq,
  upsertHousePriorityFaqItem,
  resetHousePriorityFaqForTests,
} from "./priority-faq/housePriorityFaqStore";

/** CAP-REF-05 — Repository-backed canonical MODERN 4KK content bootstrap. */
export { bootstrapModern4kkReferenceContent } from "./reference/modern4kkContentBootstrap";

/** CAP-REF-07b — House-keyed canonical runtime read projection. */
export type { CanonicalHouseRuntimeContext } from "./runtime-context/canonicalHouseRuntimeContext";
export { getCanonicalHouseRuntimeContext } from "./runtime-context/canonicalHouseRuntimeContext";
export type {
  CanonicalHouseKnowledgeEntry,
  CanonicalHouseKnowledgeSelection,
} from "./runtime-context/selectCanonicalHouseKnowledge";
export {
  canonicalHouseKnowledgeEntries,
  selectCanonicalHouseKnowledge,
} from "./runtime-context/selectCanonicalHouseKnowledge";
