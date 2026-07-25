# Runtime SSOT

**Status:** Accepted (host / delivery)  
**Guard:** `packages/embed/scripts/ssot-guard.test.ts`  
**Related:** Runtime Kernel contract — [RI-001](../04-reference-implementation/RI-001-Runtime-Kernel.md)

## Účel

**Runtime SSOT** znamená: existuje jeden živý Runtime a Experience mount path. Local, Embed Demo a Playground jsou pouze hostitelé téhož Runtime.

Vznikl proto, aby změny nekončily jen v Local, zatímco Embed běží na zastaralém artefaktu. Řeší architektonickou divergenci Local ↔ Embed (ne UI bugy, ne AI).

## Runtime

**Runtime** = Decision Session Runtime a související balíčky pod `packages/*/src` (zejména `@embed-engine/runtime`, plus závislé kernel/core/object-house/ai při běhu Experience).

**Experience composition** = `apps/client-studio/src` (zejména `embed/mountClientStudio.tsx` → `ClientStudioApp`), mountovaná výhradně přes Embed Delivery.

**Jediný zdroj pravdy pro vývoj:** živý source tree (`packages/*/src` + Client Studio Experience source), ne `dist/`, ne `docs/embed/*.js`.

Vite hostitelé to vynucují přes `createSsotResolveAliases()` (`packages/embed/vite.ssot-aliases.ts`).

## Hostitelé

**Hostitel** spouští Runtime přes `Embed.mount`. Neobsahuje vlastní Runtime ani paralelní Experience bootstrap.

| Hostitel | Entry | Poznámka |
|----------|--------|----------|
| Local | `apps/client-studio/src/main.tsx` | `:4173` |
| Embed Demo | `packages/embed/demo/main.ts` | `pnpm --filter @embed-engine/embed demo` |
| Playground | `playground/main.ts` | live Vite host, ne IIFE |

Odpovědnost hostitele: partner/page surface, launcher/target, asset base. Experience se vždy dostane přes `Embed.mount` → Delivery → `mountClientStudio`.

## Release

Release Snapshot vzniká **pouze** přes oficiální publish:

```bash
pnpm embed:publish
```

Detail: [embed-release-workflow.md](./embed-release-workflow.md).

Výstup je **jeden strom**: `docs/embed/` (`packages/embed/dist` je symlink na tentýž adresář).

| Artefakt | Význam |
|----------|--------|
| `embed.iife.js` | partner / Pages IIFE snapshot |
| `embed.es.js` | ESM snapshot |
| `version.json` | fingerprint release |

Release **není** druhý Runtime: je kompilací téhož source (stejné SSOT aliasy při buildu). Po změně source platí až do dalšího buildu — to je release latence, ne paralelní implementace.

## Archiv (Freeze)

Archiv existuje jako **historický referenční snapshot** (vizuální / UX etalon, IIFE smoke), ne jako vývojový Runtime.

| Archiv | Účel |
|--------|------|
| `apps/client-studio/reference-build/` | visual reference (`kind: archival-snapshot`) |
| `apps/client-studio/gen1/` | Gen1 freeze (`kind: archival-snapshot`) |
| `packages/embed/archive/frozen-iife-hosts/` | explicitní HTML pro `docs/embed/embed.iife.js` |

**Použít:** vědomé srovnání se starým stavem, regressní etalon, smoke po release buildu.  
**Nepoužít:** denní vývoj, ověření Live Runtime, Embed Demo workflow.

Není součástí Runtime SSOT: není na Vite Demo serveru; Demo je `appType: "mpa"` (neexistující `/iife.html` → 404).

## Development Workflow

1. Měnit Runtime / Experience ve **source** (`packages/*/src`, `apps/client-studio/src`).
2. Ověřit na **Local** a/nebo **Embed Demo** (případně Playground) — live Vite, bez ručního sync.
3. Nespoléhat na `docs/embed` IIFE ani na `reference-build` / `gen1` pro validaci Live Runtime.

Guard: `pnpm --filter @embed-engine/embed ssot:guard` (součást embed `test`).

## Release Workflow

1. `pnpm --filter @embed-engine/embed build`
2. Vite lib build → `docs/embed/embed.es.js` a `docs/embed/embed.iife.js`
3. Declarations + `version.json` + finalize host HTML v tomtéž stromu
4. Commit / push `docs/embed` podle release procesu Pages

`sync:pages` v package.json je alias na `build` (žádná samostatná JS kopie Runtime).

## Zakázané postupy

- Upravovat Runtime v `packages/*/dist` nebo ručně v `docs/embed/*.js`
- Přidávat paralelní SPA entry (`createRoot` + `ClientStudioApp` mimo `mountClientStudio`)
- Obcházet `Embed.mount` na Local / Demo / Playground
- Vracet IIFE host HTML do `packages/embed/demo/`
- Používat freeze/archive jako „Embed“ při ověřování Runtime
- Zakládat druhou Experience implementaci vedle `mountClientStudio`

## Architektonická pravidla

1. **One Runtime** — jeden živý Runtime source  
2. **One Source of Truth** — `packages/*/src` (+ CS Experience source), ne artefakty  
3. **Multiple Hosts** — Local / Embed Demo / Playground jen spouští  
4. **Release = Snapshot** — `docs/embed` je publish freeze source  
5. **Freeze = Archive** — reference/gen1/archive IIFE hosts nejsou Live Runtime  

## Enforcement

| Mechanismus | Role |
|-------------|------|
| `vite.ssot-aliases.ts` | live source na všech Vite hostitelích + embed build |
| Local / Demo / Playground entries | pouze `Embed.mount` |
| `distributionTree.mjs` | `dist` ≡ `docs/embed` |
| Demo `appType: "mpa"` | žádný SPA fallback na smazané freeze URL |
| `ssot-guard.test.ts` | CI/local invarianty |
