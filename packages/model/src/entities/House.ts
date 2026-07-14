import { HouseStatus } from '../enums/HouseStatus';
import { Visibility } from '../enums/Visibility';
import { Area } from '../value-objects/Area';
import { Coordinates } from '../value-objects/Coordinates';
import { Id } from '../value-objects/Id';
import { Money } from '../value-objects/Money';

export class House {
  public readonly id: Id;
  public readonly projectId: Id;
  public readonly name: string;
  public readonly status: HouseStatus;
  public readonly visibility: Visibility;
  public readonly price: Money | null;
  public readonly area: Area | null;
  public readonly coordinates: Coordinates | null;
  public readonly floorIds: readonly Id[];
  public readonly metadataIds: readonly Id[];
  public readonly assetIds: readonly Id[];

  constructor(
    id: Id,
    projectId: Id,
    name: string,
    status: HouseStatus,
    visibility: Visibility,
    price: Money | null = null,
    area: Area | null = null,
    coordinates: Coordinates | null = null,
    floorIds: readonly Id[] = [],
    metadataIds: readonly Id[] = [],
    assetIds: readonly Id[] = [],
  ) {
    this.id = id;
    this.projectId = projectId;
    this.name = name;
    this.status = status;
    this.visibility = visibility;
    this.price = price;
    this.area = area;
    this.coordinates = coordinates;
    this.floorIds = floorIds;
    this.metadataIds = metadataIds;
    this.assetIds = assetIds;
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

  getStatus(): HouseStatus {
    return this.status;
  }

  getVisibility(): Visibility {
    return this.visibility;
  }

  getPrice(): Money | null {
    return this.price;
  }

  getArea(): Area | null {
    return this.area;
  }

  getCoordinates(): Coordinates | null {
    return this.coordinates;
  }

  getFloorIds(): readonly Id[] {
    return this.floorIds;
  }

  getMetadataIds(): readonly Id[] {
    return this.metadataIds;
  }

  getAssetIds(): readonly Id[] {
    return this.assetIds;
  }
}
