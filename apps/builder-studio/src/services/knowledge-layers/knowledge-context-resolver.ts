import type {
  KnowledgeLayerId,
  KnowledgeLayerModel,
  KnowledgeReference,
  ResolvedLayerReferences,
} from '../../model';

/**
 * KnowledgeContextResolver (EPIC-BLD-14).
 * Returns references only — does not build AI Context.
 */
export type KnowledgeContextResolver = {
  resolvePlatform(
    references: readonly KnowledgeReference[],
    layerModel: KnowledgeLayerModel | null,
  ): ResolvedLayerReferences;
  resolveCompany(
    references: readonly KnowledgeReference[],
    layerModel: KnowledgeLayerModel | null,
  ): ResolvedLayerReferences;
  resolveObject(
    references: readonly KnowledgeReference[],
    layerModel: KnowledgeLayerModel | null,
  ): ResolvedLayerReferences;
  resolveSession(
    references: readonly KnowledgeReference[],
    layerModel: KnowledgeLayerModel | null,
  ): ResolvedLayerReferences;
  resolveLayer(
    layer: KnowledgeLayerId,
    references: readonly KnowledgeReference[],
    layerModel: KnowledgeLayerModel | null,
  ): ResolvedLayerReferences;
};

function filterByLayer(
  layer: KnowledgeLayerId,
  references: readonly KnowledgeReference[],
  layerModel: KnowledgeLayerModel | null,
): ResolvedLayerReferences {
  return {
    layer,
    layerModel:
      layerModel !== null && layerModel.layer === layer ? layerModel : null,
    references: references.filter((item) => item.layer === layer),
  };
}

export function createKnowledgeContextResolver(): KnowledgeContextResolver {
  return {
    resolvePlatform(references, layerModel) {
      return filterByLayer('platform', references, layerModel);
    },
    resolveCompany(references, layerModel) {
      return filterByLayer('company', references, layerModel);
    },
    resolveObject(references, layerModel) {
      return filterByLayer('object', references, layerModel);
    },
    resolveSession(references, layerModel) {
      return filterByLayer('session', references, layerModel);
    },
    resolveLayer(layer, references, layerModel) {
      return filterByLayer(layer, references, layerModel);
    },
  };
}
