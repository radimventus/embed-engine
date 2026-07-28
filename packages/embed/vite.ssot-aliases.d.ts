/**
 * SSOT — Vite resolve aliases for development hosts + Embed production build.
 *
 * Local Client Studio and Embed demo MUST resolve the same live source tree.
 * Longer subpath aliases are listed first so Vite never truncates them to a parent.
 */
import type { AliasOptions } from "vite";
export declare const repoRoot: string;
export declare const clientStudioSrc: string;
export declare const embedPackageRoot: string;
/** Mount bridge — identical for every Embed host. */
export declare const clientStudioMountAliases: Record<string, string>;
/**
 * Workspace packages → live `src` (not `dist`).
 * Includes every subpath used by Experience / Embed hosts.
 */
export declare const workspaceSourceAliases: Record<string, string>;
/** Vite alias list — longest `find` first. */
export declare function createSsotResolveAliases(): AliasOptions;
