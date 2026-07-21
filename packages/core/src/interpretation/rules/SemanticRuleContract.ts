/**
 * Semantic Rule Contract — stable identity for semantic meaning.
 *
 * Contracts define identity and meaning only.
 * They do not execute, render, localize, or configure behavior.
 */

/**
 * Canonical semantic rule identity (machine vocabulary).
 */
export type SemanticRuleId = string;

/**
 * Implementation-independent semantic rule contract.
 */
export type SemanticRuleContract = {
  readonly id: SemanticRuleId;
  /** Contract version — identity remains stable across versions. */
  readonly version: number;
  /**
   * Stable machine meaning key.
   * Not UI copy. Not localization.
   */
  readonly meaning: string;
  /** Semantic domain bucket (layout, investment, design, …). */
  readonly domain: string;
};

/**
 * Creates a frozen SemanticRuleContract.
 */
export function createSemanticRuleContract(
  input: SemanticRuleContract,
): SemanticRuleContract {
  return Object.freeze({
    id: input.id,
    version: input.version,
    meaning: input.meaning,
    domain: input.domain,
  });
}
