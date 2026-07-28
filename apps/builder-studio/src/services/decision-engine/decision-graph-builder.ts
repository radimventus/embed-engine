import type {
  BuildDecisionModelInput,
  DecisionEdge,
  DecisionGraph,
  DecisionNode,
  ExperienceNode,
  KnowledgeNode,
  PriorityNode,
  RuleNode,
  SignalNode,
} from '../../model';

/**
 * Builds a structural DecisionGraph from resolved inputs.
 * No algorithms, no evaluation — structure only.
 */
export function buildDecisionGraph(
  input: BuildDecisionModelInput,
): DecisionGraph {
  const nodes: DecisionNode[] = [];
  const edges: DecisionEdge[] = [];

  for (const fact of input.knowledgeFacts ?? []) {
    const node: KnowledgeNode = {
      id: `node-knowledge-${fact.id}`,
      type: 'knowledge',
      label: fact.title,
      sourceId: fact.id,
      kind: 'fact',
    };
    nodes.push(node);
  }

  for (const faq of input.knowledgeFaqs ?? []) {
    const node: KnowledgeNode = {
      id: `node-knowledge-${faq.id}`,
      type: 'knowledge',
      label: faq.question,
      sourceId: faq.id,
      kind: 'faq',
    };
    nodes.push(node);
  }

  for (const priorityId of input.priorities ?? []) {
    const node: PriorityNode = {
      id: `node-priority-${priorityId}`,
      type: 'priority',
      label: priorityId,
      sourceId: priorityId,
      priorityId,
    };
    nodes.push(node);
  }

  for (const rule of input.rules ?? []) {
    const node: RuleNode = {
      id: `node-rule-${rule.id}`,
      type: 'rule',
      label: rule.outcome,
      sourceId: rule.id,
      condition: rule.condition,
      outcome: rule.outcome,
    };
    nodes.push(node);
  }

  for (const signal of input.signals ?? []) {
    const node: SignalNode = {
      id: `node-signal-${signal.id}`,
      type: 'signal',
      label: signal.label,
      sourceId: signal.id,
      source: signal.source,
      signalType: signal.type,
    };
    nodes.push(node);
  }

  for (const scene of input.scenes ?? []) {
    const sceneNode: ExperienceNode = {
      id: `node-experience-${scene.sceneId}`,
      type: 'experience',
      label: scene.title,
      sourceId: scene.sceneId,
      sceneId: scene.sceneId,
    };
    nodes.push(sceneNode);
    for (const moduleId of scene.modules) {
      const moduleNode: ExperienceNode = {
        id: `node-experience-${scene.sceneId}-${moduleId}`,
        type: 'experience',
        label: moduleId,
        sourceId: moduleId,
        sceneId: scene.sceneId,
        moduleId,
      };
      nodes.push(moduleNode);
      edges.push({
        id: `edge-${scene.sceneId}-${moduleId}`,
        from: sceneNode.id,
        to: moduleNode.id,
        relation: 'contains-module',
      });
    }
  }

  // Structural links only — no evaluation semantics.
  const priorities = nodes.filter((item) => item.type === 'priority');
  const rules = nodes.filter((item) => item.type === 'rule');
  const signals = nodes.filter((item) => item.type === 'signal');

  for (const rule of rules) {
    for (const priority of priorities.slice(0, 1)) {
      edges.push({
        id: `edge-${priority.id}-${rule.id}`,
        from: priority.id,
        to: rule.id,
        relation: 'informs-rule',
      });
    }
  }

  for (const signal of signals) {
    for (const rule of rules.slice(0, 1)) {
      edges.push({
        id: `edge-${signal.id}-${rule.id}`,
        from: signal.id,
        to: rule.id,
        relation: 'feeds-rule',
      });
    }
  }

  return {
    nodes,
    edges,
    metadata: {
      title: 'Decision Graph',
      nodeCount: nodes.length,
      edgeCount: edges.length,
    },
  };
}
