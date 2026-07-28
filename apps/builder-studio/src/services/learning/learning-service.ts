import type {
  CreateLearningInput,
  Heuristic,
  LearningEvent,
  LearningPackage,
  Observation,
  Pattern,
  RegisterHeuristicInput,
  RegisterObservationInput,
  RegisterPatternInput,
  UpdateLearningInput,
} from '../../model';

const MAX_HISTORY = 40;
const PLATFORM_LEARNING_ID = 'learning-platform';

export type LearningService = {
  create(input?: CreateLearningInput): LearningPackage;
  load(id?: string): LearningPackage | null;
  update(id: string, patch: UpdateLearningInput): LearningPackage;
  save(id: string): LearningPackage;
  registerObservation(
    id: string,
    input: RegisterObservationInput,
  ): LearningPackage;
  registerPattern(id: string, input: RegisterPatternInput): LearningPackage;
  registerHeuristic(
    id: string,
    input: RegisterHeuristicInput,
  ): LearningPackage;
  listPatterns(id?: string): readonly Pattern[];
  getEvents(learningId?: string): readonly LearningEvent[];
  getHistory(learningId?: string): readonly LearningEvent[];
  list(): readonly LearningPackage[];
};

function nextVersion(previous: string): string {
  const parts = previous.split('.').map(Number);
  const major = parts[0] ?? 1;
  const minor = parts[1] ?? 0;
  const patch = (parts[2] ?? 0) + 1;
  return `${major}.${minor}.${patch}`;
}

function seedObservations(): Observation[] {
  return [
    {
      id: 'obs-priority-opened',
      origin: 'session',
      category: 'priority-opened',
      payload: { signal: 'priority', anonymizedBucket: 'A' },
      confidence: 0.9,
      metadata: { notes: 'Priority otevřena', anonymized: true },
    },
    {
      id: 'obs-faq-visited',
      origin: 'session',
      category: 'faq-visited',
      payload: { signal: 'faq', anonymizedBucket: 'A' },
      confidence: 0.85,
      metadata: { notes: 'FAQ navštíveno', anonymized: true },
    },
    {
      id: 'obs-module-skipped',
      origin: 'object',
      category: 'module-skipped',
      payload: { module: 'lead-capture', anonymizedBucket: 'B' },
      confidence: 0.7,
      metadata: { notes: 'Modul přeskočen', anonymized: true },
    },
  ];
}

function seedPatterns(): Pattern[] {
  return [
    {
      id: 'pattern-explore-then-faq',
      description: 'Prohlídka a priority před FAQ.',
      observations: ['obs-priority-opened', 'obs-faq-visited'],
      confidence: 0.8,
      status: 'Candidate',
    },
  ];
}

function seedHeuristics(): Heuristic[] {
  return [
    {
      id: 'heuristic-energy-first',
      title: 'Energy-first',
      description: 'Zdůraznit energii, pokud je v prioritách.',
      scope: 'decision',
      weight: 0.9,
    },
    {
      id: 'heuristic-faq-before-form',
      title: 'FAQ-before-form',
      description: 'FAQ před lead formulářem.',
      scope: 'experience',
      weight: 0.8,
    },
    {
      id: 'heuristic-navigator-before-contact',
      title: 'Navigator-before-contact',
      description: 'House Navigator před kontaktem.',
      scope: 'experience',
      weight: 0.75,
    },
  ];
}

/**
 * LearningService (EPIC-BLD-15).
 * Platform learning capability — authoring models only.
 */
export function createLearningService(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
}): LearningService {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const packages = new Map<string, LearningPackage>();
  const events: LearningEvent[] = [];

  const pushEvent = (
    type: LearningEvent['type'],
    learningId: string,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('learning-event'),
      type,
      learningId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requirePackage = (id: string): LearningPackage => {
    const current = packages.get(id);
    if (current === undefined) {
      throw new Error(`LearningPackage not found: ${id}`);
    }
    return current;
  };

  const write = (next: LearningPackage): LearningPackage => {
    packages.set(next.id, next);
    return next;
  };

  const bump = (
    current: LearningPackage,
    patch: Partial<LearningPackage>,
  ): LearningPackage => {
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
    create(input) {
      const existing = packages.get(PLATFORM_LEARNING_ID);
      if (existing !== undefined) {
        return existing;
      }
      const stamp = now().toISOString();
      const created: LearningPackage = {
        id: PLATFORM_LEARNING_ID,
        version: '1.0.0',
        observations: seedObservations(),
        patterns: seedPatterns(),
        heuristics: seedHeuristics(),
        metadata: {
          title: input?.title?.trim() || 'Platform Learning Package',
          description:
            input?.description?.trim() ||
            'Anonymizované poznatky — bez customer documents a bez sdílení mezi firmami.',
          status: 'Draft',
        },
        timestamps: { createdAt: stamp, updatedAt: stamp },
      };
      write(created);
      for (const observation of created.observations) {
        pushEvent(
          'ObservationRegistered',
          created.id,
          `Observation ${observation.category} registered`,
        );
      }
      for (const pattern of created.patterns) {
        pushEvent(
          'PatternRegistered',
          created.id,
          `Pattern ${pattern.id} registered`,
        );
      }
      for (const heuristic of created.heuristics) {
        pushEvent(
          'HeuristicRegistered',
          created.id,
          `Heuristic ${heuristic.title} registered`,
        );
      }
      return created;
    },

    load(id = PLATFORM_LEARNING_ID) {
      return packages.get(id) ?? null;
    },

    update(id, patch) {
      const current = requirePackage(id);
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

    save(id) {
      const current = requirePackage(id);
      return bump(current, {});
    },

    registerObservation(id, input) {
      const current = requirePackage(id);
      const observation: Observation = {
        id: createId('obs'),
        origin: input.origin,
        category: input.category,
        payload: { ...(input.payload ?? {}) },
        confidence: Math.min(1, Math.max(0, input.confidence ?? 0.5)),
        metadata: {
          notes: input.notes?.trim() || '',
          anonymized: true,
        },
      };
      const next = bump(current, {
        observations: [...current.observations, observation],
      });
      pushEvent(
        'ObservationRegistered',
        next.id,
        `Observation ${observation.category} registered`,
      );
      return next;
    },

    registerPattern(id, input) {
      const current = requirePackage(id);
      const pattern: Pattern = {
        id: createId('pattern'),
        description: input.description.trim(),
        observations: [...(input.observations ?? [])],
        confidence: Math.min(1, Math.max(0, input.confidence ?? 0.5)),
        status: input.status ?? 'Candidate',
      };
      const next = bump(current, {
        patterns: [...current.patterns, pattern],
      });
      pushEvent(
        'PatternRegistered',
        next.id,
        `Pattern ${pattern.id} registered`,
      );
      return next;
    },

    registerHeuristic(id, input) {
      const current = requirePackage(id);
      const heuristic: Heuristic = {
        id: createId('heuristic'),
        title: input.title.trim(),
        description: input.description.trim(),
        scope: input.scope ?? 'platform',
        weight: Math.min(1, Math.max(0, input.weight ?? 0.5)),
      };
      const next = bump(current, {
        heuristics: [...current.heuristics, heuristic],
      });
      pushEvent(
        'HeuristicRegistered',
        next.id,
        `Heuristic ${heuristic.title} registered`,
      );
      return next;
    },

    listPatterns(id = PLATFORM_LEARNING_ID) {
      const current = packages.get(id);
      return current?.patterns ?? [];
    },

    getEvents(learningId) {
      if (learningId === undefined) {
        return [...events];
      }
      return events.filter((item) => item.learningId === learningId);
    },

    getHistory(learningId) {
      return this.getEvents(learningId);
    },

    list() {
      return Array.from(packages.values());
    },
  };
}
