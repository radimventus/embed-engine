import type { HousePackage } from '@embed-engine/object-house';

/**
 * Render-time House Package asset contract.
 *
 * Builder registries always describe the seed package root. A durable overlay
 * may replace individual package-relative assets with an authenticated local
 * URL. Consumers receive one HousePackage and never need to know its source.
 */
export function normalizeHousePackageAssets(
  housePackage: HousePackage,
  packagePublicRoot: string,
  durableAssetUrls: Readonly<Record<string, string>> = {},
): HousePackage {
  const root = packagePublicRoot.replace(/\/+$/, '');
  const packageRelativePath = (url: string): string | null => {
    if (!url.startsWith(`${root}/`)) {
      return null;
    }
    return url.slice(root.length + 1);
  };

  return Object.freeze({
    ...housePackage,
    media: Object.freeze(
      housePackage.media.map((asset) => {
        const relativePath = packageRelativePath(asset.url);
        const durableUrl =
          relativePath === null ? undefined : durableAssetUrls[relativePath];
        return Object.freeze({
          ...asset,
          ...(durableUrl !== undefined ? { url: durableUrl } : {}),
        });
      }),
    ),
  });
}
