import { Id } from '../value-objects/Id';

export class PipelineStage {
  public readonly id: Id;
  public readonly name: string;
  public readonly order: number;

  constructor(id: Id, name: string, order: number) {
    this.id = id;
    this.name = name;
    this.order = order;
  }

  getId(): Id {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getOrder(): number {
    return this.order;
  }
}

export class Pipeline {
  public readonly id: Id;
  public readonly projectId: Id;
  public readonly name: string;
  public readonly stages: readonly PipelineStage[];

  constructor(
    id: Id,
    projectId: Id,
    name: string,
    stages: readonly PipelineStage[] = [],
  ) {
    this.id = id;
    this.projectId = projectId;
    this.name = name;
    this.stages = stages;
  }

  getId(): Id {
    return this.id;
  }

  getProjectId(): Id {
    return this.projectId;
  }

  getName(): string {
    return this.name;
  }

  getStages(): readonly PipelineStage[] {
    return this.stages;
  }
}
