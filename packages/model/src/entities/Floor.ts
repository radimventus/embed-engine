import { Area } from '../value-objects/Area';
import { Id } from '../value-objects/Id';

export class Floor {
  public readonly id: Id;
  public readonly houseId: Id;
  public readonly name: string;
  public readonly level: number;
  public readonly area: Area | null;
  public readonly roomIds: readonly Id[];

  constructor(
    id: Id,
    houseId: Id,
    name: string,
    level: number,
    area: Area | null = null,
    roomIds: readonly Id[] = [],
  ) {
    this.id = id;
    this.houseId = houseId;
    this.name = name;
    this.level = level;
    this.area = area;
    this.roomIds = roomIds;
  }

  getId(): Id {
    return this.id;
  }

  getHouseId(): Id {
    return this.houseId;
  }

  getName(): string {
    return this.name;
  }

  getLevel(): number {
    return this.level;
  }

  getArea(): Area | null {
    return this.area;
  }

  getRoomIds(): readonly Id[] {
    return this.roomIds;
  }
}
