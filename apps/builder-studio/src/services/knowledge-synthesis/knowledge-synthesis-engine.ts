import type {
  KnowledgeEntry,
  KnowledgeSynthesisEvent,
  SynthesizeKnowledgeInput,
  SynthesizedKnowledgeBase,
} from '../../model';
import {
  createBasicKnowledgeSynthesizer,
  createKnowledgeSynthesisValidator,
  type KnowledgeSynthesizer,
  type KnowledgeSynthesisValidator,
} from './basic-knowledge-synthesizer';
import {
  createKnowledgeSynthesisIndex,
  type KnowledgeSynthesisIndex,
} from './knowledge-synthesis-index';

const MAX_HISTORY = 40;

export type KnowledgeSynthesisEngine = {
  initialize(catalogId: string): string;
  synthesize(input: SynthesizeKnowledgeInput): SynthesizedKnowledgeBase;
  merge(knowledgeBaseId: string): SynthesizedKnowledgeBase;
  validate(knowledgeBaseId: string): SynthesizedKnowledgeBase;
  publish(knowledgeBaseId: string): SynthesizedKnowledgeBase;
  dispose(knowledgeBaseId: string): SynthesizedKnowledgeBase;
  load(knowledgeBaseId: string): SynthesizedKnowledgeBase | null;
  preview(knowledgeBaseId: string): SynthesizedKnowledgeBase | null;
  listKnowledge(knowledgeBaseId?: string): readonly KnowledgeEntry[];
  getIndex(): KnowledgeSynthesisIndex;
  getEvents(knowledgeBaseId?: string): readonly KnowledgeSynthesisEvent[];
  getHistory(knowledgeBaseId?: string): readonly KnowledgeSynthesisEvent[];
  list(): readonly SynthesizedKnowledgeBase[];
};

function mergeKey(entry: KnowledgeEntry): string {
  return entry.title.trim().toLowerCase().replace(/^knowledge:\s*/i, '');
}

function mergeEntries(
  entries: readonly KnowledgeEntry[],
  createId: (prefix: string) => string,
  nowIso: string,
): { readonly entries: KnowledgeEntry[]; readonly mergedCount: number } {
  const groups = new Map<string, KnowledgeEntry[]>();
  for (const entry of entries) {
    const key = mergeKey(entry);
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }

  const merged: KnowledgeEntry[] = [];
  let mergedCount = 0;

  for (const group of groups.values()) {
    if (group.length === 1) {
      merged.push(group[0]!);
      continue;
    }
    mergedCount += 1;
    const primary = group[0]!;
    const sourceHeuristics = Array.from(
      new Set(group.flatMap((item) => item.sourceHeuristics)),
    );
    const references = group.flatMap((item) =>
      item.references.map((ref) => ({
        ...ref,
        relationship: 'merged-from' as const,
      })),
    );
    const confidence = Math.min(
      1,
      group.reduce((sum, item) => sum + item.confidence, 0) / group.length +
        0.05 * (group.length - 1),
    );
    merged.push({
      id: createId('knowledge-entry'),
      title: primary.title,
      description: `Merged ${group.length} knowledge entries for "${primary.title}".`,
      confidence: Math.round(confidence * 1000) / 1000,
      sourceHeuristics,
      references,
      createdAt: nowIso,
      metadata: {
        synthesizerId: primary.metadata.synthesizerId,
        status: 'Draft',
        notes: `Merged from ${group.map((item) => item.id).join(', ')}.`,
      },
    });
  }

  return { entries: merged, mergedCount };
}

/**
 * KnowledgeSynthesisEngine (EPIC-BLD-27).
 * Reads Heuristic Catalog → Knowledge Base. Never mutates catalog.
 */
export function createKnowledgeSynthesisEngine(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
  readonly synthesizer?: KnowledgeSynthesizer;
  readonly validator?: KnowledgeSynthesisValidator;
  readonly index?: KnowledgeSynthesisIndex;
}): KnowledgeSynthesisEngine {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const synthesizer =
    options?.synthesizer ?? createBasicKnowledgeSynthesizer();
  const validator =
    options?.validator ?? createKnowledgeSynthesisValidator({ now });
  const index = options?.index ?? createKnowledgeSynthesisIndex();
  const bases = new Map<string, SynthesizedKnowledgeBase>();
  const events: KnowledgeSynthesisEvent[] = [];

  const pushEvent = (
    type: KnowledgeSynthesisEvent['type'],
    knowledgeBaseId: string,
    entryId: string | null,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('knowledge-synth-event'),
      type,
      knowledgeBaseId,
      entryId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requireBase = (knowledgeBaseId: string): SynthesizedKnowledgeBase => {
    const current = bases.get(knowledgeBaseId);
    if (current === undefined) {
      throw new Error(`KnowledgeBase not found: ${knowledgeBaseId}`);
    }
    return current;
  };

  const write = (next: SynthesizedKnowledgeBase): SynthesizedKnowledgeBase => {
    bases.set(next.id, next);
    index.index(next.id, next.entries);
    return next;
  };

  return {
    initialize(catalogId) {
      return `knowledge-base-${catalogId}`;
    },

    synthesize(input) {
      const knowledgeBaseId = this.initialize(input.catalogId);
      if (!synthesizer.supports(input)) {
        throw new Error(
          `Synthesizer ${synthesizer.id} does not support catalog ${input.catalogId}`,
        );
      }

      const stamp = now().toISOString();
      const entries = synthesizer.synthesize(input, createId, now);
      const base: SynthesizedKnowledgeBase = {
        id: knowledgeBaseId,
        version: '0.1.0',
        entries,
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title: input.title?.trim() || `${input.catalogTitle} Knowledge`,
          catalogId: input.catalogId,
          notes:
            'Synthesized from Heuristic Catalog — catalog unchanged. No AI.',
          status: 'Draft',
        },
        validation: null,
      };

      write(base);
      for (const entry of entries) {
        pushEvent(
          'KnowledgeSynthesized',
          base.id,
          entry.id,
          `Synthesized ${entry.title}`,
        );
      }
      return base;
    },

    merge(knowledgeBaseId) {
      const current = requireBase(knowledgeBaseId);
      const stamp = now().toISOString();
      const { entries, mergedCount } = mergeEntries(
        current.entries,
        createId,
        stamp,
      );
      const next: SynthesizedKnowledgeBase = {
        ...current,
        entries,
        updatedAt: stamp,
        validation: null,
      };
      write(next);
      pushEvent(
        'KnowledgeMerged',
        next.id,
        null,
        mergedCount > 0
          ? `Merged ${mergedCount} knowledge group(s)`
          : 'No mergeable knowledge groups',
      );
      return next;
    },

    validate(knowledgeBaseId) {
      const current = requireBase(knowledgeBaseId);
      const validation = validator.validate(current.entries);
      const stamp = now().toISOString();
      const entries = current.entries.map((entry) => ({
        ...entry,
        metadata: {
          ...entry.metadata,
          status: validation.valid
            ? ('Validated' as const)
            : entry.metadata.status,
        },
      }));
      const next: SynthesizedKnowledgeBase = {
        ...current,
        entries,
        validation,
        updatedAt: stamp,
      };
      write(next);
      pushEvent(
        'KnowledgeValidated',
        next.id,
        null,
        validation.valid
          ? 'Knowledge validated'
          : `Validation failed (${validation.issues.length} issues)`,
      );
      return next;
    },

    publish(knowledgeBaseId) {
      const current = requireBase(knowledgeBaseId);
      const validation =
        current.validation ?? validator.validate(current.entries);
      if (!validation.valid) {
        const failed: SynthesizedKnowledgeBase = {
          ...current,
          validation,
          updatedAt: now().toISOString(),
        };
        write(failed);
        pushEvent(
          'KnowledgeValidated',
          failed.id,
          null,
          `Publish blocked (${validation.issues.length} issues)`,
        );
        return failed;
      }

      const stamp = now().toISOString();
      const entries = current.entries.map((entry) => ({
        ...entry,
        metadata: {
          ...entry.metadata,
          status: 'Published' as const,
        },
      }));
      const next: SynthesizedKnowledgeBase = {
        ...current,
        entries,
        version: '1.0.0',
        validation,
        updatedAt: stamp,
        metadata: {
          ...current.metadata,
          status: 'Published',
        },
      };
      write(next);
      pushEvent(
        'KnowledgePublished',
        next.id,
        null,
        `Published knowledge base ${next.id}`,
      );
      return next;
    },

    dispose(knowledgeBaseId) {
      const current = requireBase(knowledgeBaseId);
      const next: SynthesizedKnowledgeBase = {
        ...current,
        entries: current.entries.map((entry) => ({
          ...entry,
          metadata: {
            ...entry.metadata,
            status: 'Disposed',
          },
        })),
        updatedAt: now().toISOString(),
        metadata: {
          ...current.metadata,
          status: 'Disposed',
        },
      };
      write(next);
      return next;
    },

    load(knowledgeBaseId) {
      return bases.get(knowledgeBaseId) ?? null;
    },

    preview(knowledgeBaseId) {
      return bases.get(knowledgeBaseId) ?? null;
    },

    listKnowledge(knowledgeBaseId) {
      if (knowledgeBaseId === undefined) {
        return Array.from(bases.values()).flatMap((item) => item.entries);
      }
      return bases.get(knowledgeBaseId)?.entries ?? [];
    },

    getIndex() {
      return index;
    },

    getEvents(knowledgeBaseId) {
      if (knowledgeBaseId === undefined) {
        return [...events];
      }
      return events.filter((item) => item.knowledgeBaseId === knowledgeBaseId);
    },

    getHistory(knowledgeBaseId) {
      return this.getEvents(knowledgeBaseId);
    },

    list() {
      return Array.from(bases.values());
    },
  };
}
