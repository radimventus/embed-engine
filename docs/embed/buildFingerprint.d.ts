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
export declare function getEmbedRuntimeBuild(): EmbedRuntimeBuildInfo;
/** Console banner so operators can verify Pages vs local build. */
export declare function logEmbedRuntimeBuild(label?: string): void;
//# sourceMappingURL=buildFingerprint.d.ts.map