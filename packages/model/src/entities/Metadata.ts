import { Id } from '../value-objects/Id';

export class Metadata {
  public readonly id: Id;
  public readonly key: string;
  public readonly value: string;

  constructor(id: Id, key: string, value: string) {
    this.id = id;
    this.key = key;
    this.value = value;
  }

  getId(): Id {
    return this.id;
  }

  getKey(): string {
    return this.key;
  }

  getValue(): string {
    return this.value;
  }
}
