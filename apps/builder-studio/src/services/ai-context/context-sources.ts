import type {
  BuildAIContextInput,
  ContextFragment,
} from '../../model';

/**
 * Context Sources (EPIC-BLD-13).
 * Each source returns only its fragment — never the full authoring package.
 */

export type ContextSource = {
  readonly id: string;
  readonly type: ContextFragment['type'];
  collect(input: BuildAIContextInput): ContextFragment | null;
};

export const ObjectContextSource: ContextSource = {
  id: 'object-context-source',
  type: 'object',
  collect(input) {
    const pkg = input.objectPackage;
    return {
      id: `fragment-object-${pkg.objectId}`,
      type: 'object',
      priority: 10,
      payload: {
        objectId: pkg.objectId,
        projectId: pkg.projectId,
        name: pkg.metadata.name,
        objectType: pkg.metadata.objectType,
        location: pkg.metadata.location,
        status: pkg.metadata.status,
        description: pkg.metadata.description,
        tags: [...pkg.metadata.tags],
        modules: [...pkg.modules],
        version: pkg.version,
      },
      metadata: {
        source: 'ObjectContextSource',
        notes: 'Object summary only — not full Object Package.',
      },
    };
  },
};

export const ExperienceContextSource: ContextSource = {
  id: 'experience-context-source',
  type: 'experience',
  collect(input) {
    const experience = input.experience;
    if (experience === null) {
      return null;
    }
    return {
      id: `fragment-experience-${experience.experienceId}`,
      type: 'experience',
      priority: 20,
      payload: {
        experienceId: experience.experienceId,
        title: experience.metadata.title,
        description: experience.metadata.description,
        version: experience.version,
        defaultScene: experience.navigation.defaultScene,
        sceneOrder: [...experience.navigation.order],
        scenes: experience.scenes.map((scene) => ({
          sceneId: scene.sceneId,
          title: scene.title,
          modules: [...scene.modules],
        })),
      },
      metadata: {
        source: 'ExperienceContextSource',
        notes: 'Experience structure summary — not full Experience Package.',
      },
    };
  },
};

export const KnowledgeContextSource: ContextSource = {
  id: 'knowledge-context-source',
  type: 'knowledge',
  collect(input) {
    const knowledge = input.knowledge;
    if (knowledge === null) {
      return null;
    }
    return {
      id: `fragment-knowledge-${knowledge.knowledgeId}`,
      type: 'knowledge',
      priority: 30,
      payload: {
        knowledgeId: knowledge.knowledgeId,
        version: knowledge.version,
        facts: knowledge.facts.map((fact) => ({
          id: fact.id,
          title: fact.title,
          value: fact.value,
          category: fact.category,
        })),
        entities: knowledge.entities.map((entity) => ({
          id: entity.id,
          type: entity.type,
          label: entity.label,
        })),
        faqs: knowledge.faqs.map((faq) => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
        })),
        documents: knowledge.documents.map((doc) => ({
          id: doc.id,
          title: doc.title,
          type: doc.type,
        })),
      },
      metadata: {
        source: 'KnowledgeContextSource',
        notes: 'Knowledge summary — not full Knowledge Package.',
      },
    };
  },
};

export const DecisionContextSource: ContextSource = {
  id: 'decision-context-source',
  type: 'decision',
  collect(input) {
    const decision = input.decision;
    if (decision === null) {
      return null;
    }
    return {
      id: `fragment-decision-${decision.id}`,
      type: 'decision',
      priority: 40,
      payload: {
        decisionId: decision.id,
        version: decision.version,
        rules: decision.decisionRules.map((rule) => ({
          id: rule.id,
          condition: rule.condition,
          outcome: rule.outcome,
          priority: rule.priority,
          weight: rule.weight,
        })),
        signals: decision.decisionSignals.map((signal) => ({
          id: signal.id,
          source: signal.source,
          type: signal.type,
          label: signal.label,
          importance: signal.importance,
        })),
        priorities: [...decision.priorities],
        strategies: decision.strategies.map((strategy) => ({
          id: strategy.id,
          title: strategy.title,
          description: strategy.description,
          targetSignals: [...strategy.targetSignals],
        })),
      },
      metadata: {
        source: 'DecisionContextSource',
        notes: 'Decision summary — not full Decision Knowledge Package.',
      },
    };
  },
};

export const CONTEXT_SOURCES: readonly ContextSource[] = [
  ObjectContextSource,
  ExperienceContextSource,
  KnowledgeContextSource,
  DecisionContextSource,
];
