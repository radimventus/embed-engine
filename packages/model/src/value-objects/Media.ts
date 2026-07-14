export class Media {
  public readonly url: string;
  public readonly mimeType: string;
  public readonly alt: string | null;

  constructor(url: string, mimeType: string, alt: string | null = null) {
    this.url = url;
    this.mimeType = mimeType;
    this.alt = alt;
  }

  getUrl(): string {
    return this.url;
  }

  getMimeType(): string {
    return this.mimeType;
  }

  getAlt(): string | null {
    return this.alt;
  }
}
