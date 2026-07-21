import {
  createSemanticRuleContract,
  type SemanticRuleContract,
  type SemanticRuleId,
} from "./SemanticRuleContract";

function rule(
  id: SemanticRuleId,
  meaning: string,
  domain: string,
  version = 1,
): SemanticRuleContract {
  return createSemanticRuleContract({ id, version, meaning, domain });
}

/**
 * Canonical semantic rule catalog.
 * Identities are stable; implementations may change later without renaming IDs.
 */
export const SEMANTIC_RULE_CATALOG: readonly SemanticRuleContract[] =
  Object.freeze([
    // Lens selection
    rule("LENS_001", "lens.layout", "lens"),
    rule("LENS_002", "lens.investment", "lens"),
    rule("LENS_003", "lens.design", "lens"),
    rule("LENS_004", "lens.energy", "lens"),
    rule("LENS_005", "lens.baseline", "lens"),

    // Layout / family
    rule("LAYOUT_001", "family.bedrooms", "layout"),
    rule("LAYOUT_002", "family.garden", "layout"),
    rule("LAYOUT_003", "family.bathrooms", "layout"),
    rule("LAYOUT_004", "family.upper-floor", "layout"),
    rule("LAYOUT_005", "family.storage", "layout"),
    rule("LAYOUT_006", "family.household-fit", "layout"),
    rule("LAYOUT_007", "family.privacy-vs-openness", "layout"),

    // Investment / price
    rule("INVESTMENT_001", "investment.opex", "investment"),
    rule("INVESTMENT_002", "investment.rental", "investment"),
    rule("INVESTMENT_003", "investment.location", "investment"),
    rule("PRICE_001", "investment.price", "investment"),
    rule("INVESTMENT_004", "investment.roi", "investment"),
    rule("INVESTMENT_005", "investment.yield-stability", "investment"),
    rule("INVESTMENT_006", "investment.entry-cost-vs-yield", "investment"),
    rule("INVESTMENT_007", "investment.indicators", "investment"),

    // Design / space / sunlight
    rule("DESIGN_001", "design.materials", "design"),
    rule("SPACE_001", "design.open-living", "design"),
    rule("DESIGN_002", "design.details", "design"),
    rule("DESIGN_003", "design.storage", "design"),
    rule("SUNLIGHT_001", "design.glazing", "design"),
    rule("DESIGN_004", "design.coherence", "design"),
    rule("DESIGN_005", "design.clarity-vs-storage", "design"),
    rule("DESIGN_006", "design.architectural-quality", "design"),

    // Energy / sustainability
    rule("ENERGY_001", "sustainability.envelope", "energy"),
    rule("ENERGY_002", "sustainability.heat-pump", "energy"),
    rule("ENERGY_003", "sustainability.solar", "energy"),
    rule("ENERGY_004", "sustainability.solar-not-included", "energy"),
    rule("ENERGY_005", "sustainability.rainwater", "energy"),
    rule("ENERGY_006", "sustainability.future-generation", "energy"),
    rule("ENERGY_007", "sustainability.scope-vs-efficiency", "energy"),
    rule("ENERGY_008", "sustainability.energy-features", "energy"),

    // Baseline
    rule("BASELINE_001", "baseline.open-lens", "baseline"),
    rule("BASELINE_002", "baseline.select-priority", "baseline"),
    rule("BASELINE_003", "baseline.inactive-lens", "baseline"),

    // Confidence
    rule("CONFIDENCE_001", "priority.coverage", "confidence"),

    // Intent
    rule("INTENT_001", "intent.explore-layout", "intent"),
    rule("INTENT_002", "intent.calculate-roi", "intent"),
    rule("INTENT_003", "intent.explore-design", "intent"),
    rule("INTENT_004", "intent.review-energy", "intent"),
    rule("INTENT_005", "intent.select-priority", "intent"),
  ]);

const BY_ID: ReadonlyMap<SemanticRuleId, SemanticRuleContract> = new Map(
  SEMANTIC_RULE_CATALOG.map((entry) => [entry.id, entry]),
);

const BY_MEANING: ReadonlyMap<string, SemanticRuleContract> = new Map(
  SEMANTIC_RULE_CATALOG.map((entry) => [entry.meaning, entry]),
);

/**
 * Looks up a contract by stable rule identity.
 */
export function getSemanticRuleById(
  id: SemanticRuleId,
): SemanticRuleContract | undefined {
  return BY_ID.get(id);
}

/**
 * Looks up a contract by machine meaning key
 * (bridges existing Interpretation factor codes → rule identities).
 */
export function getSemanticRuleByMeaning(
  meaning: string,
): SemanticRuleContract | undefined {
  return BY_MEANING.get(meaning);
}

/**
 * Resolves the canonical SemanticRuleId for a machine meaning key.
 */
export function resolveSemanticRuleId(
  meaning: string,
): SemanticRuleId | undefined {
  return BY_MEANING.get(meaning)?.id;
}

/**
 * All stable rule identities in catalog order.
 */
export function listSemanticRuleIds(): readonly SemanticRuleId[] {
  return Object.freeze(SEMANTIC_RULE_CATALOG.map((entry) => entry.id));
}
