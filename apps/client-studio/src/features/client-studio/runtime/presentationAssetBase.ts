/**
 * Optional absolute origin for Object / house-package media (Embed Delivery).
 * Standalone SPA leaves this unset — URLs stay root-absolute (`/media/...`).
 */

let presentationAssetBase: string | null = null;

export function setPresentationAssetBase(base: string | undefined): void {
  if (base === undefined || base.trim().length === 0) {
    presentationAssetBase = null;
    return;
  }
  presentationAssetBase = base.replace(/\/+$/, "");
}

export function getPresentationAssetBase(): string | null {
  return presentationAssetBase;
}

/**
 * Prefix root-absolute media paths with the Embed asset base when configured.
 */
export function resolvePublicAssetUrl(url: string): string {
  const base = presentationAssetBase;
  if (base === null) {
    return url;
  }
  if (
    url.startsWith("https://") ||
    url.startsWith("http://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }
  if (url.startsWith("/")) {
    return `${base}${url}`;
  }
  return url;
}
