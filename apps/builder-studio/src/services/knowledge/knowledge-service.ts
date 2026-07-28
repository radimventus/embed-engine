import type {
  ActiveProjectModel,
  AddEntityInput,
  AddFactInput,
  AddFaqInput,
  AddRelationshipInput,
  CreateKnowledgeInput,
  Entity,
  Fact,
  FaqEntry,
  KnowledgeDocument,
  KnowledgeEvent,
  KnowledgePackage,
  RegisterDocumentInput,
  Relationship,
  UpdateKnowledgeInput,
} from '../../model';
import { findAssetCollection } from '../../model';

const MAX_HISTORY = 40;

export type KnowledgeService = {
  createKnowledge(input: CreateKnowledgeInput): KnowledgePackage;
  loadKnowledge(knowledgeId: string): KnowledgePackage | null;
  loadKnowledgeByObject(objectId: string): KnowledgePackage | null;
  updateKnowledge(
    knowledgeId: string,
    patch: UpdateKnowledgeInput,
  ): KnowledgePackage;
  saveKnowledge(knowledgeId: string): KnowledgePackage;
  archiveKnowledge(knowledgeId: string): KnowledgePackage;
  addFact(knowledgeId: string, input: AddFactInput): KnowledgePackage;
  addEntity(knowledgeId: string, input: AddEntityInput): KnowledgePackage;
  addRelationship(
    knowledgeId: string,
    input: AddRelationshipInput,
  ): KnowledgePackage;
  addFaq(knowledgeId: string, input: AddFaqInput): KnowledgePackage;
  registerDocument(
    knowledgeId: string,
    input: RegisterDocumentInput,
  ): KnowledgePackage;
  syncDocumentsFromProject(
    knowledgeId: string,
    project: ActiveProjectModel,
  ): KnowledgePackage;
  getEvents(knowledgeId?: string): readonly KnowledgeEvent[];
  getHistory(knowledgeId?: string): readonly KnowledgeEvent[];
  listKnowledge(): readonly KnowledgePackage[];
  upsertKnowledge(pkg: KnowledgePackage): KnowledgePackage;
};

function nextVersion(previous: string): string {
  const parts = previous.split('.').map(Number);
  const major = parts[0] ?? 1;
  const minor = parts[1] ?? 0;
  const patch = (parts[2] ?? 0) + 1;
  return `${major}.${minor}.${patch}`;
}

function seedFacts(objectId: string): Fact[] {
  if (objectId.includes('harmony')) {
    return [
      {
        id: 'fact-heating',
        title: 'Vytápění',
        value: 'Tepelné čerpadlo vzduch–voda',
        category: 'heating',
        source: 'technická specifikace',
        tags: ['energie', 'komfort'],
      },
      {
        id: 'fact-energy',
        title: 'Energetická třída',
        value: 'A0',
        category: 'energy',
        source: 'PENB',
        tags: ['energie'],
      },
      {
        id: 'fact-footprint',
        title: 'Zastavěná plocha',
        value: '124 m²',
        category: 'dimensions',
        source: 'projektová dokumentace',
        tags: ['rozměry'],
      },
      {
        id: 'fact-structure',
        title: 'Konstrukce',
        value: 'Dřevěný modulární systém',
        category: 'construction',
        source: 'katalog',
        tags: ['konstrukce'],
      },
    ];
  }
  return [];
}

function seedEntities(objectId: string): Entity[] {
  if (objectId.includes('harmony')) {
    return [
      {
        id: 'entity-heat-pump',
        type: 'system',
        label: 'Tepelné čerpadlo',
        aliases: ['TČ', 'heat pump'],
        metadata: { notes: '' },
      },
      {
        id: 'entity-pv',
        type: 'system',
        label: 'Fotovoltaika',
        aliases: ['FVE', 'PV'],
        metadata: { notes: '' },
      },
      {
        id: 'entity-fireplace',
        type: 'feature',
        label: 'Krb',
        aliases: [],
        metadata: { notes: '' },
      },
      {
        id: 'entity-terrace',
        type: 'space',
        label: 'Terasa',
        aliases: [],
        metadata: { notes: '' },
      },
    ];
  }
  return [];
}

function seedRelationships(objectId: string): Relationship[] {
  if (objectId.includes('harmony')) {
    return [
      {
        id: 'rel-pv-energy',
        from: 'entity-pv',
        to: 'fact-energy',
        relation: 'supports',
        confidence: 0.9,
      },
      {
        id: 'rel-hp-heating',
        from: 'entity-heat-pump',
        to: 'fact-heating',
        relation: 'provides',
        confidence: 1,
      },
    ];
  }
  return [];
}

function seedFaqs(objectId: string): FaqEntry[] {
  if (objectId.includes('harmony')) {
    return [
      {
        id: 'faq-heating',
        question: 'Jaký je systém vytápění?',
        answer: 'Objekt používá tepelné čerpadlo vzduch–voda.',
        tags: ['vytápění'],
        relatedEntities: ['entity-heat-pump'],
      },
      {
        id: 'faq-energy',
        question: 'Jaká je energetická třída?',
        answer: 'Dům je klasifikován jako energetická třída A0.',
        tags: ['energie'],
        relatedEntities: ['entity-pv'],
      },
    ];
  }
  return [];
}

function documentsFromProject(
  project: ActiveProjectModel,
  createId: (prefix: string) => string,
): KnowledgeDocument[] {
  const docs: KnowledgeDocument[] = [];
  for (const categoryId of ['pdf', 'docx', 'xlsx'] as const) {
    const collection = findAssetCollection(project.assets, categoryId);
            if (collection === null) {
      continue;
    }
    for (const file of collection.files) {
      docs.push({
        id: createId(`doc-${file.assetId}`),
        type: categoryId,
        title: file.metadata.label || file.name,
        assetRef: file.assetId,
        metadata: { notes: file.metadata.description },
      });
    }
  }
  return docs;
}

/**
 * KnowledgeService (EPIC-BLD-11).
 * Application layer for Knowledge Package authoring.
 */
export function createKnowledgeService(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
}): KnowledgeService {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const packages = new Map<string, KnowledgePackage>();
  const events: KnowledgeEvent[] = [];

  const pushEvent = (
    type: KnowledgeEvent['type'],
    knowledgeId: string,
    objectId: string,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('knowledge-event'),
      type,
      knowledgeId,
      objectId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requireKnowledge = (knowledgeId: string): KnowledgePackage => {
    const current = packages.get(knowledgeId);
    if (current === undefined) {
      throw new Error(`KnowledgePackage not found: ${knowledgeId}`);
    }
    return current;
  };

  const write = (next: KnowledgePackage): KnowledgePackage => {
    packages.set(next.knowledgeId, next);
    return next;
  };

  const bump = (
    current: KnowledgePackage,
    patch: Partial<KnowledgePackage>,
  ): KnowledgePackage => {
    const stamp = now().toISOString();
    return write({
      ...current,
      ...patch,
      version: nextVersion(current.version),
      timestamps: {
        createdAt: current.timestamps.createdAt,
        updatedAt: stamp,
      },
    });
  };

  return {
    createKnowledge(input) {
      const existing = packages.get(`knowledge-${input.objectId}`);
      if (existing !== undefined) {
        return existing;
      }
      const stamp = now().toISOString();
      const knowledgeId = `knowledge-${input.objectId}`;
      const created: KnowledgePackage = {
        knowledgeId,
        objectId: input.objectId,
        version: '1.0.0',
        facts: seedFacts(input.objectId),
        entities: seedEntities(input.objectId),
        relationships: seedRelationships(input.objectId),
        documents: [],
        faqs: seedFaqs(input.objectId),
        references: [],
        metadata: {
          title: input.title?.trim() || 'Knowledge Package',
          description: input.description?.trim() || '',
          status: 'Draft',
        },
        timestamps: { createdAt: stamp, updatedAt: stamp },
      };
      write(created);
      pushEvent(
        'KnowledgeCreated',
        created.knowledgeId,
        created.objectId,
        `Knowledge ${created.metadata.title} created`,
      );
      return created;
    },

    loadKnowledge(knowledgeId) {
      return packages.get(knowledgeId) ?? null;
    },

    loadKnowledgeByObject(objectId) {
      return (
        packages.get(`knowledge-${objectId}`) ??
        Array.from(packages.values()).find(
          (item) => item.objectId === objectId,
        ) ??
        null
      );
    },

    updateKnowledge(knowledgeId, patch) {
      const current = requireKnowledge(knowledgeId);
      return bump(current, {
        metadata: {
          title: patch.title?.trim() ?? current.metadata.title,
          description:
            patch.description !== undefined
              ? patch.description.trim()
              : current.metadata.description,
          status: patch.status ?? current.metadata.status,
        },
      });
    },

    saveKnowledge(knowledgeId) {
      const current = requireKnowledge(knowledgeId);
      return bump(current, {});
    },

    archiveKnowledge(knowledgeId) {
      return this.updateKnowledge(knowledgeId, { status: 'Archived' });
    },

    addFact(knowledgeId, input) {
      const current = requireKnowledge(knowledgeId);
      const fact: Fact = {
        id: createId('fact'),
        title: input.title.trim(),
        value: input.value.trim(),
        category: input.category ?? 'other',
        source: input.source?.trim() || 'autor',
        tags: [...(input.tags ?? [])],
      };
      const next = bump(current, { facts: [...current.facts, fact] });
      pushEvent(
        'FactAdded',
        next.knowledgeId,
        next.objectId,
        `Fact ${fact.title} added`,
      );
      return next;
    },

    addEntity(knowledgeId, input) {
      const current = requireKnowledge(knowledgeId);
      const entity: Entity = {
        id: createId('entity'),
        type: input.type ?? 'other',
        label: input.label.trim(),
        aliases: [...(input.aliases ?? [])],
        metadata: { notes: input.notes?.trim() || '' },
      };
      const next = bump(current, { entities: [...current.entities, entity] });
      pushEvent(
        'EntityAdded',
        next.knowledgeId,
        next.objectId,
        `Entity ${entity.label} added`,
      );
      return next;
    },

    addRelationship(knowledgeId, input) {
      const current = requireKnowledge(knowledgeId);
      const confidence = Math.min(
        1,
        Math.max(0, input.confidence ?? 1),
      );
      const relationship: Relationship = {
        id: createId('rel'),
        from: input.from,
        to: input.to,
        relation: input.relation.trim(),
        confidence,
      };
      const next = bump(current, {
        relationships: [...current.relationships, relationship],
      });
      pushEvent(
        'RelationshipAdded',
        next.knowledgeId,
        next.objectId,
        `Relationship ${relationship.relation} added`,
      );
      return next;
    },

    addFaq(knowledgeId, input) {
      const current = requireKnowledge(knowledgeId);
      const faq: FaqEntry = {
        id: createId('faq'),
        question: input.question.trim(),
        answer: input.answer.trim(),
        tags: [...(input.tags ?? [])],
        relatedEntities: [...(input.relatedEntities ?? [])],
      };
      const next = bump(current, { faqs: [...current.faqs, faq] });
      pushEvent(
        'FaqAdded',
        next.knowledgeId,
        next.objectId,
        `FAQ added: ${faq.question}`,
      );
      return next;
    },

    registerDocument(knowledgeId, input) {
      const current = requireKnowledge(knowledgeId);
      if (current.documents.some((doc) => doc.assetRef === input.assetRef)) {
        return current;
      }
      const document: KnowledgeDocument = {
        id: createId('doc'),
        type: input.type ?? 'other',
        title: input.title.trim(),
        assetRef: input.assetRef,
        metadata: { notes: input.notes?.trim() || '' },
      };
      const next = bump(current, {
        documents: [...current.documents, document],
      });
      pushEvent(
        'DocumentRegistered',
        next.knowledgeId,
        next.objectId,
        `Document ${document.title} registered`,
      );
      return next;
    },

    syncDocumentsFromProject(knowledgeId, project) {
      const current = requireKnowledge(knowledgeId);
      const synced = documentsFromProject(project, createId);
      const byAsset = new Map(
        current.documents.map((doc) => [doc.assetRef, doc]),
      );
      const merged: KnowledgeDocument[] = synced.map((doc) => {
        const existing = byAsset.get(doc.assetRef);
        return existing ?? doc;
      });
      if (
        merged.length === current.documents.length &&
        merged.every(
          (doc, index) => doc.assetRef === current.documents[index]?.assetRef,
        )
      ) {
        return current;
      }
      const next = bump(current, { documents: merged });
      for (const doc of merged) {
        if (!current.documents.some((item) => item.assetRef === doc.assetRef)) {
          pushEvent(
            'DocumentRegistered',
            next.knowledgeId,
            next.objectId,
            `Document ${doc.title} registered`,
          );
        }
      }
      return next;
    },

    getEvents(knowledgeId) {
      if (knowledgeId === undefined) {
        return [...events];
      }
      return events.filter((item) => item.knowledgeId === knowledgeId);
    },

    getHistory(knowledgeId) {
      return this.getEvents(knowledgeId);
    },

    listKnowledge() {
      return Array.from(packages.values());
    },

    upsertKnowledge(pkg) {
      return write(pkg);
    },
  };
}
