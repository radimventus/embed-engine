import type {
  ExtractPatternsInput,
  ExtractedPattern,
  PatternCollection,
  PatternEngineEvent,
} from '../../model';
import {
  createBasicPatternExtractor,
  createPatternValidator,
  type PatternExtractor,
  type PatternValidator,
} from './basic-pattern-extractor';
import { createPatternIndex, type PatternIndex } from './pattern-index';

const MAX_HISTORY = 40;

export type PatternExtractionEngine = {
  initialize(packageId: string): string;
  extract(input: ExtractPatternsInput): PatternCollection;
  validate(collectionId: string): PatternCollection;
  publish(collectionId: string): PatternCollection;
  dispose(collectionId: string): PatternCollection;
  load(collectionId: string): PatternCollection | null;
  preview(collectionId: string): PatternCollection | null;
  listPatterns(collectionId?: string): readonly ExtractedPattern[];
  getIndex(): PatternIndex;
  getEvents(collectionId?: string): readonly PatternEngineEvent[];
  getHistory(collectionId?: string): readonly PatternEngineEvent[];
  list(): readonly PatternCollection[];
};

/**
 * PatternExtractionEngine (EPIC-BLD-24).
 * Reads Learning Package references → PatternCollection. Never mutates package.
 */
export function createPatternExtractionEngine(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
  readonly extractor?: PatternExtractor;
  readonly validator?: PatternValidator;
  readonly index?: PatternIndex;
}): PatternExtractionEngine {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const extractor = options?.extractor ?? createBasicPatternExtractor();
  const validator = options?.validator ?? createPatternValidator({ now });
  const index = options?.index ?? createPatternIndex();
  const collections = new Map<string, PatternCollection>();
  const events: PatternEngineEvent[] = [];

  const pushEvent = (
    type: PatternEngineEvent['type'],
    collectionId: string,
    patternId: string | null,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('pattern-event'),
      type,
      collectionId,
      patternId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requireCollection = (collectionId: string): PatternCollection => {
    const current = collections.get(collectionId);
    if (current === undefined) {
      throw new Error(`PatternCollection not found: ${collectionId}`);
    }
    return current;
  };

  const write = (next: PatternCollection): PatternCollection => {
    collections.set(next.id, next);
    index.index(next.id, next.patterns);
    for (const pattern of next.patterns) {
      pushEvent(
        'PatternIndexed',
        next.id,
        pattern.id,
        `Indexed pattern ${pattern.name}`,
      );
    }
    return next;
  };

  return {
    initialize(packageId) {
      return `pattern-collection-${packageId}`;
    },

    extract(input) {
      const collectionId = this.initialize(input.packageId);
      if (!extractor.supports(input)) {
        throw new Error(
          `Extractor ${extractor.id} does not support package ${input.packageId}`,
        );
      }

      const stamp = now().toISOString();
      const patterns = extractor.extract(input, createId, now);
      const collection: PatternCollection = {
        id: collectionId,
        patterns,
        version: '0.1.0',
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title: input.title?.trim() || `${input.packageName} Patterns`,
          packageId: input.packageId,
          notes:
            'Extracted from Learning Package references — package unchanged.',
        },
        validation: null,
      };

      write(collection);
      for (const pattern of patterns) {
        pushEvent(
          'PatternExtracted',
          collection.id,
          pattern.id,
          `Extracted ${pattern.name}`,
        );
      }
      return collection;
    },

    validate(collectionId) {
      const current = requireCollection(collectionId);
      const validation = validator.validate(current.patterns);
      const stamp = now().toISOString();
      const patterns = current.patterns.map((pattern) => ({
        ...pattern,
        metadata: {
          ...pattern.metadata,
          status: validation.valid
            ? ('Validated' as const)
            : pattern.metadata.status,
        },
      }));
      const next: PatternCollection = {
        ...current,
        patterns,
        validation,
        updatedAt: stamp,
      };
      write(next);
      pushEvent(
        'PatternValidated',
        next.id,
        null,
        validation.valid
          ? 'Patterns validated'
          : `Validation failed (${validation.issues.length} issues)`,
      );
      return next;
    },

    publish(collectionId) {
      const current = requireCollection(collectionId);
      const validation =
        current.validation ?? validator.validate(current.patterns);
      if (!validation.valid) {
        const failed: PatternCollection = {
          ...current,
          validation,
          updatedAt: now().toISOString(),
        };
        write(failed);
        pushEvent(
          'PatternValidated',
          failed.id,
          null,
          `Publish blocked (${validation.issues.length} issues)`,
        );
        return failed;
      }

      const stamp = now().toISOString();
      const patterns = current.patterns.map((pattern) => ({
        ...pattern,
        metadata: {
          ...pattern.metadata,
          status: 'Published' as const,
        },
      }));
      const next: PatternCollection = {
        ...current,
        patterns,
        version: '1.0.0',
        validation,
        updatedAt: stamp,
      };
      write(next);
      pushEvent(
        'PatternPublished',
        next.id,
        null,
        `Published pattern collection ${next.id}`,
      );
      return next;
    },

    dispose(collectionId) {
      const current = requireCollection(collectionId);
      const next: PatternCollection = {
        ...current,
        patterns: current.patterns.map((pattern) => ({
          ...pattern,
          metadata: {
            ...pattern.metadata,
            status: 'Disposed',
          },
        })),
        updatedAt: now().toISOString(),
      };
      write(next);
      return next;
    },

    load(collectionId) {
      return collections.get(collectionId) ?? null;
    },

    preview(collectionId) {
      return collections.get(collectionId) ?? null;
    },

    listPatterns(collectionId) {
      if (collectionId === undefined) {
        return Array.from(collections.values()).flatMap(
          (item) => item.patterns,
        );
      }
      return collections.get(collectionId)?.patterns ?? [];
    },

    getIndex() {
      return index;
    },

    getEvents(collectionId) {
      if (collectionId === undefined) {
        return [...events];
      }
      return events.filter((item) => item.collectionId === collectionId);
    },

    getHistory(collectionId) {
      return this.getEvents(collectionId);
    },

    list() {
      return Array.from(collections.values());
    },
  };
}
