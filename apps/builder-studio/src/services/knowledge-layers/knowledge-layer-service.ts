import type {
  AddKnowledgeReferenceInput,
  CompanyKnowledge,
  KnowledgeLayerBundle,
  KnowledgeLayerEvent,
  KnowledgeLayerId,
  KnowledgeLayerModel,
  KnowledgePackage,
  KnowledgeReference,
  ObjectKnowledge,
  PlatformKnowledge,
  SessionKnowledge,
} from '../../model';
import {
  KNOWLEDGE_LAYER_REGISTRY,
} from './knowledge-layer-registry';

const MAX_HISTORY = 40;

export type EnsureLayersInput = {
  readonly companyId: string;
  readonly companyName: string;
  readonly objectId: string;
  readonly objectName: string;
};

export type { KnowledgeLayerBundle };

export type KnowledgeLayerService = {
  listLayers(): typeof KNOWLEDGE_LAYER_REGISTRY;
  loadLayer(id: KnowledgeLayerId): KnowledgeLayerModel | null;
  ensureLayers(input: EnsureLayersInput): KnowledgeLayerBundle;
  getPlatform(): PlatformKnowledge | null;
  getCompany(companyId: string): CompanyKnowledge | null;
  getObject(objectId: string): ObjectKnowledge | null;
  getSession(objectId: string): SessionKnowledge | null;
  getBundle(objectId: string, companyId: string): KnowledgeLayerBundle | null;
  attachReference(
    knowledge: KnowledgePackage,
    input: AddKnowledgeReferenceInput,
  ): { readonly knowledge: KnowledgePackage; readonly reference: KnowledgeReference };
  detachReference(
    knowledge: KnowledgePackage,
    referenceId: string,
  ): KnowledgePackage;
  recordReferenceAdded(
    layer: KnowledgeLayerId,
    targetId: string,
    referenceId: string,
  ): void;
  recordReferenceRemoved(
    layer: KnowledgeLayerId,
    targetId: string,
    referenceId: string,
  ): void;
  getEvents(layerId?: KnowledgeLayerId): readonly KnowledgeLayerEvent[];
  getHistory(layerId?: KnowledgeLayerId): readonly KnowledgeLayerEvent[];
};

function nextVersion(previous: string): string {
  const parts = previous.split('.').map(Number);
  const major = parts[0] ?? 1;
  const minor = parts[1] ?? 0;
  const patch = (parts[2] ?? 0) + 1;
  return `${major}.${minor}.${patch}`;
}

/**
 * KnowledgeLayerService (EPIC-BLD-14).
 * Owns layer models and layer events — no data copying between layers.
 */
export function createKnowledgeLayerService(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
}): KnowledgeLayerService {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  let platform: PlatformKnowledge | null = null;
  const companies = new Map<string, CompanyKnowledge>();
  const objects = new Map<string, ObjectKnowledge>();
  const sessions = new Map<string, SessionKnowledge>();
  const events: KnowledgeLayerEvent[] = [];

  const pushEvent = (
    type: KnowledgeLayerEvent['type'],
    layerId: KnowledgeLayerId,
    targetId: string,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('layer-event'),
      type,
      layerId,
      targetId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const registerIfNew = (
    layerId: KnowledgeLayerId,
    targetId: string,
    title: string,
  ): void => {
    const already = events.some(
      (event) =>
        event.type === 'LayerRegistered' &&
        event.layerId === layerId &&
        event.targetId === targetId,
    );
    if (already) {
      return;
    }
    pushEvent(
      'LayerRegistered',
      layerId,
      targetId,
      `Layer ${title} registered`,
    );
  };

  return {
    listLayers() {
      return KNOWLEDGE_LAYER_REGISTRY;
    },

    loadLayer(id) {
      if (id === 'platform') {
        return platform;
      }
      if (id === 'company') {
        const first = companies.values().next();
        return first.done ? null : first.value;
      }
      if (id === 'object') {
        const first = objects.values().next();
        return first.done ? null : first.value;
      }
      const first = sessions.values().next();
      return first.done ? null : first.value;
    },

    ensureLayers(input) {
      const stamp = now().toISOString();

      if (platform === null) {
        platform = {
          id: 'platform-knowledge',
          layer: 'platform',
          metadata: {
            title: 'Platform Knowledge',
            description: 'Katalog platformy — bez zákaznických dat.',
            status: 'Active',
          },
          timestamps: { createdAt: stamp, updatedAt: stamp },
        };
        registerIfNew('platform', platform.id, platform.metadata.title);
      }

      let company = companies.get(input.companyId);
      if (company === undefined) {
        company = {
          id: `company-knowledge-${input.companyId}`,
          layer: 'company',
          companyId: input.companyId,
          metadata: {
            title: `${input.companyName} Knowledge`,
            description: 'Firemní vrstva — izolovaná.',
            status: 'Active',
          },
          timestamps: { createdAt: stamp, updatedAt: stamp },
        };
        companies.set(input.companyId, company);
        registerIfNew('company', company.id, company.metadata.title);
      }

      let objectLayer = objects.get(input.objectId);
      if (objectLayer === undefined) {
        objectLayer = {
          id: `object-knowledge-${input.objectId}`,
          layer: 'object',
          objectId: input.objectId,
          metadata: {
            title: `${input.objectName} Object Knowledge`,
            description: 'Vrstva objektu — jeden Object Package.',
            status: 'Active',
          },
          timestamps: { createdAt: stamp, updatedAt: stamp },
        };
        objects.set(input.objectId, objectLayer);
        registerIfNew('object', objectLayer.id, objectLayer.metadata.title);
      }

      let session = sessions.get(input.objectId);
      if (session === undefined) {
        session = {
          id: `session-knowledge-${input.objectId}`,
          layer: 'session',
          sessionId: createId('session'),
          objectId: input.objectId,
          metadata: {
            title: `${input.objectName} Session Knowledge`,
            description: 'Dočasná session vrstva.',
            status: 'Draft',
          },
          timestamps: { createdAt: stamp, updatedAt: stamp },
        };
        sessions.set(input.objectId, session);
        registerIfNew('session', session.id, session.metadata.title);
      }

      return {
        platform,
        company,
        object: objectLayer,
        session,
      };
    },

    getPlatform() {
      return platform;
    },

    getCompany(companyId) {
      return companies.get(companyId) ?? null;
    },

    getObject(objectId) {
      return objects.get(objectId) ?? null;
    },

    getSession(objectId) {
      return sessions.get(objectId) ?? null;
    },

    getBundle(objectId, companyId) {
      if (
        platform === null ||
        !companies.has(companyId) ||
        !objects.has(objectId) ||
        !sessions.has(objectId)
      ) {
        return null;
      }
      return {
        platform,
        company: companies.get(companyId)!,
        object: objects.get(objectId)!,
        session: sessions.get(objectId)!,
      };
    },

    attachReference(knowledge, input) {
      const reference: KnowledgeReference = {
        id: createId('kref'),
        layer: input.layer,
        targetId: input.targetId,
        type: input.type ?? 'other',
      };
      const stamp = now().toISOString();
      const next: KnowledgePackage = {
        ...knowledge,
        version: nextVersion(knowledge.version),
        references: [...knowledge.references, reference],
        timestamps: {
          createdAt: knowledge.timestamps.createdAt,
          updatedAt: stamp,
        },
      };
      pushEvent(
        'LayerReferenceAdded',
        reference.layer,
        reference.targetId,
        `Reference ${reference.id} → ${reference.targetId}`,
      );
      return { knowledge: next, reference };
    },

    detachReference(knowledge, referenceId) {
      const existing = knowledge.references.find(
        (item) => item.id === referenceId,
      );
      if (existing === undefined) {
        return knowledge;
      }
      const stamp = now().toISOString();
      const next: KnowledgePackage = {
        ...knowledge,
        version: nextVersion(knowledge.version),
        references: knowledge.references.filter(
          (item) => item.id !== referenceId,
        ),
        timestamps: {
          createdAt: knowledge.timestamps.createdAt,
          updatedAt: stamp,
        },
      };
      pushEvent(
        'LayerReferenceRemoved',
        existing.layer,
        existing.targetId,
        `Reference ${existing.id} removed`,
      );
      return next;
    },

    recordReferenceAdded(layer, targetId, referenceId) {
      pushEvent(
        'LayerReferenceAdded',
        layer,
        targetId,
        `Reference ${referenceId} → ${targetId}`,
      );
    },

    recordReferenceRemoved(layer, targetId, referenceId) {
      pushEvent(
        'LayerReferenceRemoved',
        layer,
        targetId,
        `Reference ${referenceId} removed`,
      );
    },

    getEvents(layerId) {
      if (layerId === undefined) {
        return [...events];
      }
      return events.filter((item) => item.layerId === layerId);
    },

    getHistory(layerId) {
      return this.getEvents(layerId);
    },
  };
}
