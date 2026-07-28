import type {
  IntelligencePattern,
  PatternCatalog,
  PatternIntelligenceEvent,
  PatternIntelligenceInput,
} from '../../model';
import {
  createBasicPatternMatcher,
  createPatternIntelligenceValidator,
  type PatternIntelligenceValidator,
  type PatternMatcher,
} from './basic-pattern-matcher';
import {
  createPatternIntelligenceIndex,
  type PatternIntelligenceIndex,
} from './pattern-intelligence-index';

const MAX_HISTORY = 40;

export type PatternIntelligenceEngine = {
  initialize(packageId: string): string;
  extract(input: PatternIntelligenceInput): PatternCatalog;
  merge(catalogId: string): PatternCatalog;
  validate(catalogId: string): PatternCatalog;
  publish(catalogId: string): PatternCatalog;
  dispose(catalogId: string): PatternCatalog;
  load(catalogId: string): PatternCatalog | null;
  preview(catalogId: string): PatternCatalog | null;
  listPatterns(catalogId?: string): readonly IntelligencePattern[];
  getIndex(): PatternIntelligenceIndex;
  getEvents(catalogId?: string): readonly PatternIntelligenceEvent[];
  getHistory(catalogId?: string): readonly PatternIntelligenceEvent[];
  list(): readonly PatternCatalog[];
};

function mergeKey(pattern: IntelligencePattern): string {
  return `${pattern.type}::${pattern.sources.slice().sort().join('|')}`;
}

function mergePatterns(
  patterns: readonly IntelligencePattern[],
  createId: (prefix: string) => string,
  nowIso: string,
): { readonly patterns: IntelligencePattern[]; readonly mergedCount: number } {
  const groups = new Map<string, IntelligencePattern[]>();
  for (const pattern of patterns) {
    const key = mergeKey(pattern);
    const list = groups.get(key) ?? [];
    list.push(pattern);
    groups.set(key, list);
  }

  const merged: IntelligencePattern[] = [];
  let mergedCount = 0;

  for (const group of groups.values()) {
    if (group.length === 1) {
      merged.push(group[0]!);
      continue;
    }
    mergedCount += 1;
    const evidence = group.flatMap((item) => item.evidence);
    const uniqueRecordIds = new Set(evidence.map((item) => item.recordId));
    const sources = Array.from(
      new Set(group.flatMap((item) => item.sources)),
    );
    const confidence = Math.min(
      1,
      group.reduce((sum, item) => sum + item.confidence, 0) / group.length +
        0.05 * (group.length - 1),
    );
    const primary = group[0]!;
    merged.push({
      id: createId('intelligence-pattern'),
      name: primary.name,
      description: `Merged ${group.length} detections of "${primary.name}".`,
      type: 'merged',
      confidence: Math.round(confidence * 1000) / 1000,
      occurrences: uniqueRecordIds.size,
      sources,
      evidence,
      createdAt: nowIso,
      metadata: {
        matcherId: primary.metadata.matcherId,
        status: 'Draft',
        notes: `Merged from ${group.map((item) => item.id).join(', ')}.`,
      },
    });
  }

  return { patterns: merged, mergedCount };
}

/**
 * PatternIntelligenceEngine (EPIC-BLD-25).
 * Reads Learning Records → Pattern Catalog. Never mutates records/package.
 */
export function createPatternIntelligenceEngine(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
  readonly matcher?: PatternMatcher;
  readonly validator?: PatternIntelligenceValidator;
  readonly index?: PatternIntelligenceIndex;
}): PatternIntelligenceEngine {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const matcher = options?.matcher ?? createBasicPatternMatcher();
  const validator =
    options?.validator ?? createPatternIntelligenceValidator({ now });
  const index = options?.index ?? createPatternIntelligenceIndex();
  const catalogs = new Map<string, PatternCatalog>();
  const events: PatternIntelligenceEvent[] = [];

  const pushEvent = (
    type: PatternIntelligenceEvent['type'],
    catalogId: string,
    patternId: string | null,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('pattern-intel-event'),
      type,
      catalogId,
      patternId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requireCatalog = (catalogId: string): PatternCatalog => {
    const current = catalogs.get(catalogId);
    if (current === undefined) {
      throw new Error(`PatternCatalog not found: ${catalogId}`);
    }
    return current;
  };

  const write = (next: PatternCatalog): PatternCatalog => {
    catalogs.set(next.id, next);
    index.index(next.id, next.patterns);
    return next;
  };

  return {
    initialize(packageId) {
      return `pattern-catalog-${packageId}`;
    },

    extract(input) {
      const catalogId = this.initialize(input.packageId);
      if (!matcher.supports(input)) {
        throw new Error(
          `Matcher ${matcher.id} does not support package ${input.packageId}`,
        );
      }

      const stamp = now().toISOString();
      const patterns = matcher.match(input, createId, now);
      const catalog: PatternCatalog = {
        id: catalogId,
        version: '0.1.0',
        patterns,
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title: input.title?.trim() || `${input.packageName} Catalog`,
          packageId: input.packageId,
          notes:
            'Verified patterns from Learning Records — records unchanged.',
          status: 'Draft',
        },
        validation: null,
      };

      write(catalog);
      for (const pattern of patterns) {
        pushEvent(
          'PatternDetected',
          catalog.id,
          pattern.id,
          `Detected ${pattern.name}`,
        );
      }
      return catalog;
    },

    merge(catalogId) {
      const current = requireCatalog(catalogId);
      const stamp = now().toISOString();
      const { patterns, mergedCount } = mergePatterns(
        current.patterns,
        createId,
        stamp,
      );
      const next: PatternCatalog = {
        ...current,
        patterns,
        updatedAt: stamp,
        validation: null,
      };
      write(next);
      if (mergedCount > 0) {
        pushEvent(
          'PatternMerged',
          next.id,
          null,
          `Merged ${mergedCount} pattern group(s)`,
        );
      } else {
        pushEvent(
          'PatternMerged',
          next.id,
          null,
          'No mergeable pattern groups',
        );
      }
      return next;
    },

    validate(catalogId) {
      const current = requireCatalog(catalogId);
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
      const next: PatternCatalog = {
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

    publish(catalogId) {
      const current = requireCatalog(catalogId);
      const validation =
        current.validation ?? validator.validate(current.patterns);
      if (!validation.valid) {
        const failed: PatternCatalog = {
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
      const next: PatternCatalog = {
        ...current,
        patterns,
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
        'PatternPublished',
        next.id,
        null,
        `Published pattern catalog ${next.id}`,
      );
      return next;
    },

    dispose(catalogId) {
      const current = requireCatalog(catalogId);
      const next: PatternCatalog = {
        ...current,
        patterns: current.patterns.map((pattern) => ({
          ...pattern,
          metadata: {
            ...pattern.metadata,
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

    load(catalogId) {
      return catalogs.get(catalogId) ?? null;
    },

    preview(catalogId) {
      return catalogs.get(catalogId) ?? null;
    },

    listPatterns(catalogId) {
      if (catalogId === undefined) {
        return Array.from(catalogs.values()).flatMap((item) => item.patterns);
      }
      return catalogs.get(catalogId)?.patterns ?? [];
    },

    getIndex() {
      return index;
    },

    getEvents(catalogId) {
      if (catalogId === undefined) {
        return [...events];
      }
      return events.filter((item) => item.catalogId === catalogId);
    },

    getHistory(catalogId) {
      return this.getEvents(catalogId);
    },

    list() {
      return Array.from(catalogs.values());
    },
  };
}
