import { LeadStatus } from '../enums/LeadStatus';
import { Priority } from '../enums/Priority';
import { Id } from '../value-objects/Id';

export class Lead {
  public readonly id: Id;
  public readonly projectId: Id;
  public readonly status: LeadStatus;
  public readonly priority: Priority;
  public readonly email: string | null;
  public readonly phone: string | null;
  public readonly name: string | null;
  public readonly metadataIds: readonly Id[];
  public readonly createdAt: string;
  public readonly updatedAt: string;

  constructor(
    id: Id,
    projectId: Id,
    status: LeadStatus,
    priority: Priority,
    createdAt: string,
    updatedAt: string,
    email: string | null = null,
    phone: string | null = null,
    name: string | null = null,
    metadataIds: readonly Id[] = [],
  ) {
    this.id = id;
    this.projectId = projectId;
    this.status = status;
    this.priority = priority;
    this.email = email;
    this.phone = phone;
    this.name = name;
    this.metadataIds = metadataIds;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  getId(): Id {
    return this.id;
  }

  getProjectId(): Id {
    return this.projectId;
  }

  getStatus(): LeadStatus {
    return this.status;
  }

  getPriority(): Priority {
    return this.priority;
  }

  getEmail(): string | null {
    return this.email;
  }

  getPhone(): string | null {
    return this.phone;
  }

  getName(): string | null {
    return this.name;
  }

  getMetadataIds(): readonly Id[] {
    return this.metadataIds;
  }

  getCreatedAt(): string {
    return this.createdAt;
  }

  getUpdatedAt(): string {
    return this.updatedAt;
  }
}
