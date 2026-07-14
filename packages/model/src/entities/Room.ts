import { RoomType } from '../enums/RoomType';
import { Area } from '../value-objects/Area';
import { Coordinates } from '../value-objects/Coordinates';
import { Id } from '../value-objects/Id';

export class Room {
  public readonly id: Id;
  public readonly floorId: Id;
  public readonly name: string;
  public readonly type: RoomType;
  public readonly area: Area | null;
  public readonly coordinates: Coordinates | null;
  public readonly assetIds: readonly Id[];

  constructor(
    id: Id,
    floorId: Id,
    name: string,
    type: RoomType,
    area: Area | null = null,
    coordinates: Coordinates | null = null,
    assetIds: readonly Id[] = [],
  ) {
    this.id = id;
    this.floorId = floorId;
    this.name = name;
    this.type = type;
    this.area = area;
    this.coordinates = coordinates;
    this.assetIds = assetIds;
  }

  getId(): Id {
    return this.id;
  }

  getFloorId(): Id {
    return this.floorId;
  }

  getName(): string {
    return this.name;
  }

  getType(): RoomType {
    return this.type;
  }

  getArea(): Area | null {
    return this.area;
  }

  getCoordinates(): Coordinates | null {
    return this.coordinates;
  }

  getAssetIds(): readonly Id[] {
    return this.assetIds;
  }
}
