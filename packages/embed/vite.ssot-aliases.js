/**
 * SSOT — Vite resolve aliases for development hosts + Embed production build.
 *
 * Local Client Studio and Embed demo MUST resolve the same live source tree.
 * Longer subpath aliases are listed first so Vite never truncates them to a parent.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(here, "../..");
export const clientStudioSrc = path.resolve(repoRoot, "apps/client-studio/src");
export const embedPackageRoot = path.resolve(repoRoot, "packages/embed");
function pkgSrc(name, entry = "index.ts") {
    return path.resolve(repoRoot, "packages", name, "src", entry);
}
/** Mount bridge — identical for every Embed host. */
export const clientStudioMountAliases = {
    "@client-studio/embed-mount": path.resolve(clientStudioSrc, "embed/mountClientStudio.tsx"),
    "@client-studio/bootstrap-events": path.resolve(clientStudioSrc, "features/client-studio/runtime/bootstrapEvents.ts"),
};
/**
 * Workspace packages → live `src` (not `dist`).
 * Includes every subpath used by Experience / Embed hosts.
 */
export const workspaceSourceAliases = {
    "@embed-engine/runtime/priority/html-renderer": pkgSrc("runtime", "priority/html-renderer/index.ts"),
    "@embed-engine/runtime/priority/mock": pkgSrc("runtime", "priority/mock/index.ts"),
    "@embed-engine/runtime/priority-pipeline": pkgSrc("runtime", "priority-pipeline.ts"),
    "@embed-engine/runtime/priority": pkgSrc("runtime", "priority/index.ts"),
    "@embed-engine/runtime/session": pkgSrc("runtime", "session/index.ts"),
    "@embed-engine/runtime/testing": pkgSrc("runtime", "testing.ts"),
    "@embed-engine/runtime": pkgSrc("runtime"),
    "@embed-engine/object-house/builder-package/node": pkgSrc("object-house", "builder-package/node.ts"),
    "@embed-engine/object-house/builder-package": pkgSrc("object-house", "builder-package/index.ts"),
    "@embed-engine/object-house/loader": pkgSrc("object-house", "loader/index.ts"),
    "@embed-engine/object-house": pkgSrc("object-house"),
    "@embed-engine/core/decision-layer": pkgSrc("core", "decision-layer/index.ts"),
    "@embed-engine/core/experience": pkgSrc("core", "experience/index.ts"),
    "@embed-engine/core/cognitive": pkgSrc("core", "cognitive/index.ts"),
    "@embed-engine/core/priority": pkgSrc("core", "priority/index.ts"),
    "@embed-engine/core": pkgSrc("core"),
    "@embed-engine/ai": pkgSrc("ai"),
    "@embed-engine/embed/partner-snippet": path.resolve(embedPackageRoot, "scripts/lib/partnerSnippet.mjs"),
    "@embed-engine/embed": path.resolve(embedPackageRoot, "src/index.ts"),
    "@embed-engine/contracts": pkgSrc("contracts"),
    "@embed-engine/model": pkgSrc("model"),
    "@embed-engine/decision": pkgSrc("decision"),
    "@embed-engine/kernel": pkgSrc("kernel"),
    "@embed-engine/design-tokens": pkgSrc("design-tokens"),
    "@embed-engine/ui/visual": pkgSrc("ui", "visual/index.ts"),
    "@embed-engine/ui": pkgSrc("ui"),
};
/** Vite alias list — longest `find` first. */
export function createSsotResolveAliases() {
    const merged = {
        ...workspaceSourceAliases,
        ...clientStudioMountAliases,
    };
    return Object.entries(merged)
        .sort((a, b) => b[0].length - a[0].length)
        .map(([find, replacement]) => ({ find, replacement }));
}
