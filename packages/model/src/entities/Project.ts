import { Visibility } from '../enums/Visibility';
import { Id } from '../value-objects/Id';

export class Project {
  public readonly id: Id;
  public readonly name: string;
  public readonly description: string | null;
  public readonly visibility: Visibility;
  public readonly themeId: Id | null;
  public readonly houseIds: readonly Id[];
  public readonly metadataIds: readonly Id[];
  public readonly createdAt: string;
  public readonly updatedAt: string;

  constructor(
    id: Id,
    name: string,
    description: string | null,
    visibility: Visibility,
    createdAt: string,
    updatedAt: string,
    themeId: Id | null = null,
    houseIds: readonly Id[] = [],
    metadataIds: readonly Id[] = [],
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.visibility = visibility;
    this.themeId = themeId;
    this.houseIds = houseIds;
    this.metadataIds = metadataIds;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  getId(): Id {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string | null {
    return this.description;
  }

  getVisibility(): Visibility {
    return this.visibility;
  }

  getThemeId(): Id | null {
    return this.themeId;
  }

  getHouseIds(): readonly Id[] {
    return this.houseIds;
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
