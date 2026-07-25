# Runtime SSOT

**Status:** Accepted (host / delivery)  
**Guard:** `packages/embed/scripts/ssot-guard.test.ts`  
**Related:** Runtime Kernel contract — [RI-001](../04-reference-implementation/RI-001-Runtime-Kernel.md) · [ADR-019](./adr/ADR-019-runtime-vs-release.md) · [embed-release-workflow.md](./embed-release-workflow.md)

## Účel

**Runtime SSOT** znamená: existuje jeden živý Runtime a Experience mount path. **Local Runtime**, **Embed Demo** a Playground jsou pouze hostitelé téhož Runtime.

Vznikl proto, aby změny nekončily jen v Local Runtime, zatímco **Published Embed** běží na zastaralém Release Snapshotu. Řeší architektonickou divergenci hostitelů vs release (ne UI bugy, ne AI).

## Terminologie (host / release)

| Termín | Význam |
|--------|--------|
| **Local Runtime** | Local Vite host |
| **Embed Demo** | Embed package Vite demo host |
| **Release Snapshot** | `docs/embed/` po `pnpm embed:publish` |
| **Published Embed** | Snapshot na GitHub Pages / partner URL |

Nepoužívat nejednoznačné „Live Embed“ — viz [ADR-019](./adr/ADR-019-runtime-vs-release.md).

## Runtime

**Runtime** = Decision Session Runtime a související balíčky pod `packages/*/src` (zejména `@embed-engine/runtime`, plus závislé kernel/core/object-house/ai při běhu Experience).

**Experience composition** = `apps/client-studio/src` (zejména `embed/mountClientStudio.tsx` → `ClientStudioApp`), mountovaná výhradně přes Embed Delivery.

**Jediný zdroj pravdy pro vývoj:** živý source tree (`packages/*/src` + Client Studio Experience source), ne `dist/`, ne `docs/embed/*.js`.

Vite hostitelé to vynucují přes `createSsotResolveAliases()` (`packages/embed/vite.ssot-aliases.ts`).

## Hostitelé

**Hostitel** spouští Runtime přes `Embed.mount`. Neobsahuje vlastní Runtime ani paralelní Experience bootstrap.

| Hostitel | Entry | Poznámka |
|----------|--------|----------|
| Local Runtime | `apps/client-studio/src/main.tsx` | `:4173` |
| Embed Demo | `packages/embed/demo/main.ts` | `pnpm --filter @embed-engine/embed demo` |
| Playground | `playground/main.ts` | live Vite host, ne IIFE / ne Published Embed |

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
**Nepoužít:** denní vývoj, ověření Local Runtime / Embed Demo, ani náhradu za Published Embed.

Není součástí Runtime SSOT: není na Vite Demo serveru; Demo je `appType: "mpa"` (neexistující `/iife.html` → 404).

## Development Workflow

1. Měnit Runtime / Experience ve **source** (`packages/*/src`, `apps/client-studio/src`).
2. Ověřit na **Local Runtime** a/nebo **Embed Demo** (případně Playground) — live Vite, bez ručního sync.
3. Nespoléhat na Release Snapshot (`docs/embed`) ani na `reference-build` / `gen1` pro validaci živého Runtime.

Guard: `pnpm --filter @embed-engine/embed ssot:guard` (součást embed `test`).

## Release Workflow

Oficiální cesta (jediná podporovaná):

```bash
pnpm embed:publish
```

1. Publish sestaví Release Snapshot do `docs/embed/` (IIFE, ESM, types, `version.json`, host HTML).
2. **Release Validation** musí projít → READY.
3. Commit + push `docs/embed` (a související Pages assets).
4. **Remote Validation** (`pnpm embed:publish -- --remote`) + Browser Verification → **Published Embed**.

Detail a diagram: [embed-release-workflow.md](./embed-release-workflow.md).  
Diagnóza „nevidím změny“: [troubleshooting/embed-parity.md](./troubleshooting/embed-parity.md).

`sync:pages` v package.json je alias na build (žádná samostatná JS kopie Runtime) — **není** náhradou za `pnpm embed:publish`.

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
3. **Multiple Hosts** — Local Runtime / Embed Demo / Playground jen spouští  
4. **Release = Snapshot** — `docs/embed` je Release Snapshot; Pages = Published Embed  
5. **Freeze = Archive** — reference/gen1/archive IIFE hosts nejsou Local Runtime ani Embed Demo  

## Enforcement

| Mechanismus | Role |
|-------------|------|
| `vite.ssot-aliases.ts` | live source na všech Vite hostitelích + embed build |
| Local / Demo / Playground entries | pouze `Embed.mount` |
| `distributionTree.mjs` | `dist` ≡ `docs/embed` |
| Demo `appType: "mpa"` | žádný SPA fallback na smazané freeze URL |
| `ssot-guard.test.ts` | CI/local invarianty |
