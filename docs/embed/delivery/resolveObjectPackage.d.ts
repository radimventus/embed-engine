/**
 * Builder → HousePackage helpers for unit tests and offline projection.
 *
 * Production Embed no longer calls these (PT-EMBED-RUNTIME-INTEGRATION-01).
 * Live Runtime is created only inside Client Studio Provider via
 * `ensureBuilderPackageBootstrapped` → `projectBuilderImportToHousePackage`.
 */
import type { HousePackage } from "@embed-engine/object-house";
/** Pilot Object Package id (canonical Gen1 identity after Builder import). */
export declare const DEFAULT_OBJECT_ID = "reference-v1-company-domy-s-energii-project-domy-s-energii-bungalov-4kk";
export type BuilderCsvTexts = {
    readonly galleryCsv: string;
    readonly roomsCsv: string;
    readonly videosCsv: string;
};
/**
 * Pure projection: CSV texts → Runtime HousePackage (no I/O).
 */
export declare function projectRuntimeHousePackageFromCsvTexts(texts: BuilderCsvTexts, objectId?: string): HousePackage;
/**
 * Load HP-002 CSVs and project Runtime HousePackage.
 */
export declare function resolveBuilderHousePackage(options?: {
    readonly objectId?: string;
    readonly assetBase?: string;
}): Promise<HousePackage>;
//# sourceMappingURL=resolveObjectPackage.d.ts.map