import { AssetType } from '../enums/AssetType';
import { Id } from '../value-objects/Id';
import { Media } from '../value-objects/Media';

export class Asset {
  public readonly id: Id;
  public readonly name: string;
  public readonly type: AssetType;
  public readonly media: Media;
  public readonly description: string | null;
  public readonly metadataIds: readonly Id[];

  constructor(
    id: Id,
    name: string,
    type: AssetType,
    media: Media,
    description: string | null = null,
    metadataIds: readonly Id[] = [],
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.media = media;
    this.description = description;
    this.metadataIds = metadataIds;
  }

  getId(): Id {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getType(): AssetType {
    return this.type;
  }

  getMedia(): Media {
    return this.media;
  }

  getDescription(): string | null {
    return this.description;
  }

  getMetadataIds(): readonly Id[] {
    return this.metadataIds;
  }
}
