import { Priority } from '../enums/Priority';
import { Id } from '../value-objects/Id';

export class Recommendation {
  public readonly id: Id;
  public readonly leadId: Id;
  public readonly targetId: Id;
  public readonly score: number;
  public readonly reason: string | null;
  public readonly priority: Priority;
  public readonly createdAt: string;

  constructor(
    id: Id,
    leadId: Id,
    targetId: Id,
    score: number,
    priority: Priority,
    createdAt: string,
    reason: string | null = null,
  ) {
    this.id = id;
    this.leadId = leadId;
    this.targetId = targetId;
    this.score = score;
    this.priority = priority;
    this.createdAt = createdAt;
    this.reason = reason;
  }

  getId(): Id {
    return this.id;
  }

  getLeadId(): Id {
    return this.leadId;
  }

  getTargetId(): Id {
    return this.targetId;
  }

  getScore(): number {
    return this.score;
  }

  getReason(): string | null {
    return this.reason;
  }

  getPriority(): Priority {
    return this.priority;
  }

  getCreatedAt(): string {
    return this.createdAt;
  }
}
