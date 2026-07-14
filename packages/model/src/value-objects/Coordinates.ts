export class Coordinates {
  public readonly x: number;
  public readonly y: number;
  public readonly z: number | null;

  constructor(x: number, y: number, z: number | null = null) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getZ(): number | null {
    return this.z;
  }
}
