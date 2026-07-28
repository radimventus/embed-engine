import type {
  KnowledgeLayerId,
  KnowledgeLayerModel,
  KnowledgeReference,
  ResolvedLayerReferences,
} from '../../model';
import type { KnowledgeContextResolver } from './knowledge-context-resolver';
import type { KnowledgeLayerService } from './knowledge-layer-service';

/**
 * Public Knowledge Layer API (EPIC-BLD-14).
 */
export type KnowledgeLayerApi = {
  loadLayer(id: KnowledgeLayerId): KnowledgeLayerModel | null;
  listLayers(): ReturnType<KnowledgeLayerService['listLayers']>;
  resolveLayer(
    id: KnowledgeLayerId,
    references: readonly KnowledgeReference[],
  ): ResolvedLayerReferences;
};

export function createKnowledgeLayerApi(
  service: KnowledgeLayerService,
  resolver: KnowledgeContextResolver,
): KnowledgeLayerApi {
  return {
    loadLayer(id) {
      return service.loadLayer(id);
    },
    listLayers() {
      return service.listLayers();
    },
    resolveLayer(id, references) {
      return resolver.resolveLayer(id, references, service.loadLayer(id));
    },
  };
}
