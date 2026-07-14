import { Id } from '../value-objects/Id';

export class Theme {
  public readonly id: Id;
  public readonly name: string;
  public readonly primaryColor: string;
  public readonly secondaryColor: string;
  public readonly accentColor: string;
  public readonly fontFamily: string;

  constructor(
    id: Id,
    name: string,
    primaryColor: string,
    secondaryColor: string,
    accentColor: string,
    fontFamily: string,
  ) {
    this.id = id;
    this.name = name;
    this.primaryColor = primaryColor;
    this.secondaryColor = secondaryColor;
    this.accentColor = accentColor;
    this.fontFamily = fontFamily;
  }

  getId(): Id {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getPrimaryColor(): string {
    return this.primaryColor;
  }

  getSecondaryColor(): string {
    return this.secondaryColor;
  }

  getAccentColor(): string {
    return this.accentColor;
  }

  getFontFamily(): string {
    return this.fontFamily;
  }
}
