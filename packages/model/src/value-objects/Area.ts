export type AreaUnit = 'square_meters' | 'square_feet' | 'square_units';

export class Area {
  public readonly value: number;
  public readonly unit: AreaUnit;

  constructor(value: number, unit: AreaUnit) {
    this.value = value;
    this.unit = unit;
  }

  getValue(): number {
    return this.value;
  }

  getUnit(): AreaUnit {
    return this.unit;
  }
}
