export interface SceneDefinition {
  id: string;
  next?: string;
}

/**
 * Scene graph for the legacy scene-based runtime API.
 * Distinct from the future Workflow orchestrator.
 */
export interface SceneGraph {
  start: string;
  scenes: Record<string, SceneDefinition>;
}
