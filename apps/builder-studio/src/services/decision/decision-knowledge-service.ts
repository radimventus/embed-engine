import type {
  AddDecisionRuleInput,
  AddDecisionSignalInput,
  AddDecisionStrategyInput,
  CreateDecisionKnowledgeInput,
  DecisionEvent,
  DecisionKnowledgePackage,
  DecisionRule,
  DecisionSignal,
  DecisionStrategy,
  PriorityId,
  UpdateDecisionKnowledgeInput,
} from '../../model';
import { DEFAULT_PRIORITIES } from './priority-registry';

const MAX_HISTORY = 40;

export type DecisionKnowledgeService = {
  create(input: CreateDecisionKnowledgeInput): DecisionKnowledgePackage;
  load(id: string): DecisionKnowledgePackage | null;
  loadByObject(objectId: string): DecisionKnowledgePackage | null;
  update(
    id: string,
    patch: UpdateDecisionKnowledgeInput,
  ): DecisionKnowledgePackage;
  save(id: string): DecisionKnowledgePackage;
  archive(id: string): DecisionKnowledgePackage;
  addRule(id: string, input: AddDecisionRuleInput): DecisionKnowledgePackage;
  addSignal(
    id: string,
    input: AddDecisionSignalInput,
  ): DecisionKnowledgePackage;
  addStrategy(
    id: string,
    input: AddDecisionStrategyInput,
  ): DecisionKnowledgePackage;
  registerPriority(
    id: string,
    priorityId: PriorityId,
  ): DecisionKnowledgePackage;
  unregisterPriority(
    id: string,
    priorityId: PriorityId,
  ): DecisionKnowledgePackage;
  getEvents(decisionKnowledgeId?: string): readonly DecisionEvent[];
  getHistory(decisionKnowledgeId?: string): readonly DecisionEvent[];
  list(): readonly DecisionKnowledgePackage[];
};

function nextVersion(previous: string): string {
  const parts = previous.split('.').map(Number);
  const major = parts[0] ?? 1;
  const minor = parts[1] ?? 0;
  const patch = (parts[2] ?? 0) + 1;
  return `${major}.${minor}.${patch}`;
}

function seedRules(objectId: string): DecisionRule[] {
  if (!objectId.includes('harmony')) {
    return [];
  }
  return [
    {
      id: 'rule-energy-first',
      condition: 'priority.includes(energy)',
      outcome: 'emphasize-energy-class',
      priority: 1,
      weight: 0.9,
      metadata: { notes: 'Autor: energie je klíčová' },
    },
    {
      id: 'rule-layout-nav',
      condition: 'signal.navigation.active',
      outcome: 'open-house-navigator',
      priority: 2,
      weight: 0.7,
      metadata: { notes: '' },
    },
  ];
}

function seedSignals(objectId: string): DecisionSignal[] {
  if (!objectId.includes('harmony')) {
    return [];
  }
  return [
    {
      id: 'signal-priority',
      source: 'priority',
      type: 'preference',
      importance: 1,
      tags: ['priority'],
      label: 'Priority',
    },
    {
      id: 'signal-faq',
      source: 'faq',
      type: 'intent',
      importance: 0.8,
      tags: ['faq'],
      label: 'FAQ',
    },
    {
      id: 'signal-navigation',
      source: 'navigation',
      type: 'intent',
      importance: 0.7,
      tags: ['tour'],
      label: 'Navigation',
    },
    {
      id: 'signal-ai',
      source: 'ai',
      type: 'opportunity',
      importance: 0.6,
      tags: ['advisor'],
      label: 'AI',
    },
    {
      id: 'signal-form',
      source: 'form',
      type: 'constraint',
      importance: 0.5,
      tags: ['lead'],
      label: 'Form',
    },
  ];
}

function seedStrategies(objectId: string): DecisionStrategy[] {
  if (!objectId.includes('harmony')) {
    return [];
  }
  return [
    {
      id: 'strategy-explore',
      title: 'Explore then Decide',
      description: 'Nejdřív prohlídka a priority, poté FAQ a AI.',
      targetSignals: ['signal-navigation', 'signal-priority', 'signal-faq'],
      metadata: { notes: '' },
    },
  ];
}

/**
 * DecisionKnowledgeService (EPIC-BLD-12).
 * Application layer — authoring only, no evaluation.
 */
export function createDecisionKnowledgeService(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
}): DecisionKnowledgeService {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const packages = new Map<string, DecisionKnowledgePackage>();
  const events: DecisionEvent[] = [];

  const pushEvent = (
    type: DecisionEvent['type'],
    decisionKnowledgeId: string,
    objectId: string,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('decision-event'),
      type,
      decisionKnowledgeId,
      objectId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requirePackage = (id: string): DecisionKnowledgePackage => {
    const current = packages.get(id);
    if (current === undefined) {
      throw new Error(`DecisionKnowledgePackage not found: ${id}`);
    }
    return current;
  };

  const write = (
    next: DecisionKnowledgePackage,
  ): DecisionKnowledgePackage => {
    packages.set(next.id, next);
    return next;
  };

  const bump = (
    current: DecisionKnowledgePackage,
    patch: Partial<DecisionKnowledgePackage>,
  ): DecisionKnowledgePackage => {
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
      const existing = packages.get(`decision-${input.objectId}`);
      if (existing !== undefined) {
        return existing;
      }
      const stamp = now().toISOString();
      const id = `decision-${input.objectId}`;
      const created: DecisionKnowledgePackage = {
        id,
        objectId: input.objectId,
        version: '1.0.0',
        decisionRules: seedRules(input.objectId),
        decisionSignals: seedSignals(input.objectId),
        priorities: [...DEFAULT_PRIORITIES],
        strategies: seedStrategies(input.objectId),
        metadata: {
          title: input.title?.trim() || 'Decision Knowledge',
          description: input.description?.trim() || '',
          status: 'Draft',
        },
        timestamps: { createdAt: stamp, updatedAt: stamp },
      };
      write(created);
      for (const priorityId of created.priorities) {
        pushEvent(
          'PriorityRegistered',
          created.id,
          created.objectId,
          `Priority ${priorityId} registered`,
        );
      }
      return created;
    },

    load(id) {
      return packages.get(id) ?? null;
    },

    loadByObject(objectId) {
      return (
        packages.get(`decision-${objectId}`) ??
        Array.from(packages.values()).find(
          (item) => item.objectId === objectId,
        ) ??
        null
      );
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

    archive(id) {
      return this.update(id, { status: 'Archived' });
    },

    addRule(id, input) {
      const current = requirePackage(id);
      const rule: DecisionRule = {
        id: createId('rule'),
        condition: input.condition.trim(),
        outcome: input.outcome.trim(),
        priority: input.priority ?? current.decisionRules.length + 1,
        weight: Math.min(1, Math.max(0, input.weight ?? 1)),
        metadata: { notes: input.notes?.trim() || '' },
      };
      const next = bump(current, {
        decisionRules: [...current.decisionRules, rule],
      });
      pushEvent(
        'RuleAdded',
        next.id,
        next.objectId,
        `Rule ${rule.id} added`,
      );
      return next;
    },

    addSignal(id, input) {
      const current = requirePackage(id);
      const signal: DecisionSignal = {
        id: createId('signal'),
        source: input.source,
        type: input.type ?? 'intent',
        importance: Math.min(1, Math.max(0, input.importance ?? 0.5)),
        tags: [...(input.tags ?? [])],
        label: input.label.trim(),
      };
      const next = bump(current, {
        decisionSignals: [...current.decisionSignals, signal],
      });
      pushEvent(
        'SignalAdded',
        next.id,
        next.objectId,
        `Signal ${signal.label} added`,
      );
      return next;
    },

    addStrategy(id, input) {
      const current = requirePackage(id);
      const strategy: DecisionStrategy = {
        id: createId('strategy'),
        title: input.title.trim(),
        description: input.description.trim(),
        targetSignals: [...(input.targetSignals ?? [])],
        metadata: { notes: input.notes?.trim() || '' },
      };
      const next = bump(current, {
        strategies: [...current.strategies, strategy],
      });
      pushEvent(
        'StrategyAdded',
        next.id,
        next.objectId,
        `Strategy ${strategy.title} added`,
      );
      return next;
    },

    registerPriority(id, priorityId) {
      const current = requirePackage(id);
      if (current.priorities.includes(priorityId)) {
        return current;
      }
      const next = bump(current, {
        priorities: [...current.priorities, priorityId],
      });
      pushEvent(
        'PriorityRegistered',
        next.id,
        next.objectId,
        `Priority ${priorityId} registered`,
      );
      return next;
    },

    unregisterPriority(id, priorityId) {
      const current = requirePackage(id);
      if (!current.priorities.includes(priorityId)) {
        return current;
      }
      return bump(current, {
        priorities: current.priorities.filter((item) => item !== priorityId),
      });
    },

    getEvents(decisionKnowledgeId) {
      if (decisionKnowledgeId === undefined) {
        return [...events];
      }
      return events.filter(
        (item) => item.decisionKnowledgeId === decisionKnowledgeId,
      );
    },

    getHistory(decisionKnowledgeId) {
      return this.getEvents(decisionKnowledgeId);
    },

    list() {
      return Array.from(packages.values());
    },
  };
}
