import type {
  DeriveHeuristicsInput,
  DerivedHeuristic,
  HeuristicCatalog,
  HeuristicEngineEvent,
} from '../../model';
import {
  createBasicHeuristicDeriver,
  createHeuristicValidator,
  type HeuristicDeriver,
  type HeuristicValidator,
} from './basic-heuristic-deriver';
import { createHeuristicIndex, type HeuristicIndex } from './heuristic-index';

const MAX_HISTORY = 40;

export type HeuristicEngine = {
  initialize(collectionId: string): string;
  derive(input: DeriveHeuristicsInput): HeuristicCatalog;
  validate(catalogId: string): HeuristicCatalog;
  publish(catalogId: string): HeuristicCatalog;
  dispose(catalogId: string): HeuristicCatalog;
  load(catalogId: string): HeuristicCatalog | null;
  preview(catalogId: string): HeuristicCatalog | null;
  listHeuristics(catalogId?: string): readonly DerivedHeuristic[];
  getIndex(): HeuristicIndex;
  getEvents(catalogId?: string): readonly HeuristicEngineEvent[];
  getHistory(catalogId?: string): readonly HeuristicEngineEvent[];
  list(): readonly HeuristicCatalog[];
};

/**
 * HeuristicEngine (EPIC-BLD-26).
 * Reads Pattern Collection → Heuristic Catalog. Never mutates patterns.
 */
export function createHeuristicEngine(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
  readonly deriver?: HeuristicDeriver;
  readonly validator?: HeuristicValidator;
  readonly index?: HeuristicIndex;
}): HeuristicEngine {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const deriver = options?.deriver ?? createBasicHeuristicDeriver();
  const validator = options?.validator ?? createHeuristicValidator({ now });
  const index = options?.index ?? createHeuristicIndex();
  const catalogs = new Map<string, HeuristicCatalog>();
  const events: HeuristicEngineEvent[] = [];

  const pushEvent = (
    type: HeuristicEngineEvent['type'],
    catalogId: string,
    heuristicId: string | null,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('heuristic-event'),
      type,
      catalogId,
      heuristicId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requireCatalog = (catalogId: string): HeuristicCatalog => {
    const current = catalogs.get(catalogId);
    if (current === undefined) {
      throw new Error(`HeuristicCatalog not found: ${catalogId}`);
    }
    return current;
  };

  const write = (next: HeuristicCatalog): HeuristicCatalog => {
    catalogs.set(next.id, next);
    index.index(next.id, next.heuristics);
    for (const heuristic of next.heuristics) {
      pushEvent(
        'HeuristicIndexed',
        next.id,
        heuristic.id,
        `Indexed heuristic ${heuristic.name}`,
      );
    }
    return next;
  };

  return {
    initialize(collectionId) {
      return `heuristic-catalog-${collectionId}`;
    },

    derive(input) {
      const catalogId = this.initialize(input.collectionId);
      if (!deriver.supports(input)) {
        throw new Error(
          `Deriver ${deriver.id} does not support collection ${input.collectionId}`,
        );
      }

      const stamp = now().toISOString();
      const heuristics = deriver.derive(input, createId, now);
      const catalog: HeuristicCatalog = {
        id: catalogId,
        version: '0.1.0',
        heuristics,
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title: input.title?.trim() || `${input.collectionTitle} Heuristics`,
          collectionId: input.collectionId,
          notes:
            'Derived from Pattern Collection — collection unchanged. No Knowledge Layer.',
          status: 'Draft',
        },
        validation: null,
      };

      write(catalog);
      for (const heuristic of heuristics) {
        pushEvent(
          'HeuristicDerived',
          catalog.id,
          heuristic.id,
          `Derived ${heuristic.name}`,
        );
      }
      return catalog;
    },

    validate(catalogId) {
      const current = requireCatalog(catalogId);
      const validation = validator.validate(current.heuristics);
      const stamp = now().toISOString();
      const heuristics = current.heuristics.map((heuristic) => ({
        ...heuristic,
        metadata: {
          ...heuristic.metadata,
          status: validation.valid
            ? ('Validated' as const)
            : heuristic.metadata.status,
        },
      }));
      const next: HeuristicCatalog = {
        ...current,
        heuristics,
        validation,
        updatedAt: stamp,
      };
      write(next);
      pushEvent(
        'HeuristicValidated',
        next.id,
        null,
        validation.valid
          ? 'Heuristics validated'
          : `Validation failed (${validation.issues.length} issues)`,
      );
      return next;
    },

    publish(catalogId) {
      const current = requireCatalog(catalogId);
      const validation =
        current.validation ?? validator.validate(current.heuristics);
      if (!validation.valid) {
        const failed: HeuristicCatalog = {
          ...current,
          validation,
          updatedAt: now().toISOString(),
        };
        write(failed);
        pushEvent(
          'HeuristicValidated',
          failed.id,
          null,
          `Publish blocked (${validation.issues.length} issues)`,
        );
        return failed;
      }

      const stamp = now().toISOString();
      const heuristics = current.heuristics.map((heuristic) => ({
        ...heuristic,
        metadata: {
          ...heuristic.metadata,
          status: 'Published' as const,
        },
      }));
      const next: HeuristicCatalog = {
        ...current,
        heuristics,
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
        'HeuristicPublished',
        next.id,
        null,
        `Published heuristic catalog ${next.id}`,
      );
      return next;
    },

    dispose(catalogId) {
      const current = requireCatalog(catalogId);
      const next: HeuristicCatalog = {
        ...current,
        heuristics: current.heuristics.map((heuristic) => ({
          ...heuristic,
          metadata: {
            ...heuristic.metadata,
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

    listHeuristics(catalogId) {
      if (catalogId === undefined) {
        return Array.from(catalogs.values()).flatMap(
          (item) => item.heuristics,
        );
      }
      return catalogs.get(catalogId)?.heuristics ?? [];
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
