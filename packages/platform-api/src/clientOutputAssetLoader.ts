export type ClientOutputAssetEnvironment = Readonly<Record<string, string | undefined>>;

export function resolveClientOutputAssetUrl(
  assetUrl: string,
  environment: ClientOutputAssetEnvironment = process.env,
): URL {
  const configuredOrigin = new URL(
    `${(environment.CLIENT_OUTPUT_ASSET_ORIGIN?.trim() || 'https://conis.cz').replace(/\/$/, '')}/`,
  );
  const resolved = new URL(assetUrl, configuredOrigin);
  if (resolved.origin !== configuredOrigin.origin) {
    throw new Error('Client output asset origin is not allowed');
  }
  return resolved;
}

export async function loadClientOutputAsset(
  assetUrl: string,
  fetchImpl: typeof fetch = fetch,
  environment: ClientOutputAssetEnvironment = process.env,
): Promise<Uint8Array> {
  const response = await fetchImpl(resolveClientOutputAssetUrl(assetUrl, environment));
  if (!response.ok) throw new Error(`Client output asset ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}
