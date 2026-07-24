/**
 * Build-time Embed Runtime fingerprint (PT-DEPLOY-EMBED-01).
 * Values are injected by Vite from packages/embed/.build/fingerprint.json.
 */

export type EmbedRuntimeBuildInfo = {
  readonly commit: string;
  readonly builtAt: string;
  readonly runtimeSource: string;
  readonly marker: string;
};

declare const __EMBED_RUNTIME_BUILD__: EmbedRuntimeBuildInfo | undefined;

const DEV_FALLBACK: EmbedRuntimeBuildInfo = Object.freeze({
  commit: "dev",
  builtAt: "dev",
  runtimeSource: "builder-package/projectBuilderImportToHousePackage",
  marker: "EMBED_RUNTIME_BUILD:dev@dev",
});

export function getEmbedRuntimeBuild(): EmbedRuntimeBuildInfo {
  if (typeof __EMBED_RUNTIME_BUILD__ !== "undefined" && __EMBED_RUNTIME_BUILD__) {
    return __EMBED_RUNTIME_BUILD__;
  }
  return DEV_FALLBACK;
}

/** Console banner so operators can verify Pages vs local build. */
export function logEmbedRuntimeBuild(label = "Embed Runtime"): void {
  const build = getEmbedRuntimeBuild();
  console.info(label);
  console.info(`Build: ${build.commit}`);
  console.info(`Runtime: ${build.runtimeSource}`);
  console.info(`Built: ${build.builtAt}`);
}
