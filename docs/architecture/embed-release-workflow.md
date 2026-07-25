# Embed Release Workflow

**CAP:** CAP-RLS-01 / CAP-GOV-01  
**Status:** Accepted  
**Related:** [ADR-019](./adr/ADR-019-runtime-vs-release.md) · [runtime-ssot.md](./runtime-ssot.md) · [troubleshooting/embed-parity.md](./troubleshooting/embed-parity.md)

## Účel

Oddělit **živý Runtime** (vývoj na hostitelích) od **Release Snapshot** / **Published Embed** a dát týmu **jednu oficiální cestu publikování**.

## Terminologie

| Termín | Význam |
| --- | --- |
| **Runtime** | Jediný živý source Runtime (+ Experience mount path) |
| **Local Runtime** | Vite host Local (`client-studio` dev) |
| **Embed Demo** | Vite host Embed Demo |
| **Release Snapshot** | Strom `docs/embed/` po `pnpm embed:publish` |
| **Published Embed** | Tentýž snapshot na GitHub Pages / partner URL |

**Nepoužívat bez upřesnění:** „Live Embed“ (historicky matoucí). Pokud se výraz ještě objeví, vždy mapujte na jeden ze čtyř termínů výše.

## Runtime vs Release

| | Local Runtime / Embed Demo | Release Snapshot → Published Embed |
|---|--------------|------------------|
| Co to je | Hostitelé živého Runtime (Vite + source) | Zkompilovaný `docs/embed/` → Pages |
| Aktualizace | Okamžitě | Pouze přes publish + commit + push |
| Příkaz | `dev` / `demo` | `pnpm embed:publish` |

## Developer workflow (oficiální)

```text
Local Runtime
     ↓
Embed Demo
     ↓
pnpm embed:publish
     ↓
Release Validation
     ↓
Commit
     ↓
Push
     ↓
GitHub Pages
     ↓
Remote Validation
     ↓
Published Embed
```

| Krok | Co ověřuješ |
| --- | --- |
| Local Runtime | Denní vývoj Experience / Runtime |
| Embed Demo | Stejný Runtime v partner-style hostiteli |
| `pnpm embed:publish` | Sestavení Release Snapshotu |
| Release Validation | Snapshot READY (fingerprint, strom, hashe) |
| Commit + Push | Nasazení snapshotu do Pages source |
| Remote Validation | Pages slouží očekávaný fingerprint |
| Published Embed | Browser: title, CTA, fingerprint, Experience |

## Kdy co používat

| Cíl | Použij |
|-----|--------|
| Denní vývoj | **Local Runtime** |
| Ověření launcher hostitele bez publish | **Embed Demo** |
| Partner / produkční IIFE | **Published Embed** (po publish + push) |
| „Vidím změnu v Local, ne na Pages?“ | Nejdřív **Publish** — viz [embed-parity](./troubleshooting/embed-parity.md) |

## Diagnostické pravidlo

Při hlášení:

> „V Embedu nevidím změny.“

**První otázka:**

> Byl proveden Publish Release Snapshotu? (`pnpm embed:publish` + commit/push `docs/embed`?)

Teprve po potvrzení publikování se hledá chyba v Runtime nebo Experience.

- **Ne** → očekávané: Published Embed ukazuje starý snapshot. Spusť publish.  
- **Ano** + Remote Validation PASS → hledej Runtime / Experience.  
- **Ano** ale remote fingerprint ≠ Release Snapshot → push / Pages build ještě nedobehl.

Pořadí diagnózy: [troubleshooting/embed-parity.md](./troubleshooting/embed-parity.md).

## Oficiální příkaz

```bash
pnpm embed:publish
```

**Jediná podporovaná cesta** přípravy Release Snapshotu.

Po nasazení na Pages (commit + push `docs/embed`):

```bash
pnpm embed:publish -- --remote
```

**Kontrakt Remote Validation:**

- **Nikdy nespouští build** a nemění `docs/embed/`.
- Čte existující Release Snapshot (`docs/embed/version.json` + IIFE).
- Porovná ho s **Published Embed** na GitHub Pages.
- Nový snapshot vzniká **jen** explicitním `pnpm embed:publish` (bez `--remote`).

## Co publish dělá

### `pnpm embed:publish` (build)

1. Build aktuálního Runtime source → `docs/embed/` (`embed.iife.js`, `embed.es.js`, types, `version.json`)
2. Finalize Pages host HTML (`live.html`, partner snippet, …)
3. **Release Validation** (local):
   - `docs/embed` ≡ `packages/embed/dist` (symlink)
   - fingerprint v IIFE = fingerprint buildu
   - `version.json` iifeSha256 = soubor
   - Runtime source string v IIFE
4. Výstup **Release Snapshot READY** nebo **Publish FAILED**

Publish **necommituje** a **nepushuje**. Deploy = git push `docs/embed` (Pages source `/docs`).

### `pnpm embed:publish -- --remote` (validate only)

1. **Skip build**
2. Local Release Validation nad existujícím `docs/embed/`
3. Remote Validation proti GitHub Pages
4. Výstup **Remote Validation READY** nebo **Validation FAILED**

## Ověření úspěšného release

Local READY:

```text
════════════════════════════════════════════════════════
Release Snapshot READY
════════════════════════════════════════════════════════
marker:     EMBED_RUNTIME_BUILD:<commit>@<builtAt>
```

Po push + Pages build:

```bash
pnpm embed:publish -- --remote
```

Remote PASS = **Published Embed** slouží právě tento Release Snapshot.

Pak Browser Verification na Pages (title, CTA, fingerprint, Experience).

## Zakázané postupy

- Ruční editace `docs/embed/*.js`
- Volání ad-hoc `sync:pages` / dílčích build kroků místo `embed:publish`
- Ověřování Experience změn proti Published Embed bez předchozího publish
- Zaměňování **Embed Demo** (živý hostitel) s `docs/embed/live.html` (**Release Snapshot** / Published Embed)
