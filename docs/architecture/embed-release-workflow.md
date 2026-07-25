# Embed Release Workflow

**CAP:** CAP-RLS-01  
**Status:** Accepted  
**Related:** [runtime-ssot.md](./runtime-ssot.md)

## Účel

Oddělit **Live Runtime** (vývoj) od **Release Snapshot** (GitHub Pages) a dát týmu **jednu oficiální cestu publikování**.

## Runtime vs Release

| | Live Runtime | Release Snapshot |
|---|--------------|------------------|
| Co to je | Aktuální source (`packages/*/src` + Experience) | Zkompilovaný `docs/embed/` |
| Kde | Local, Embed Demo, Playground | GitHub Pages / partner IIFE |
| Aktualizace | Okamžitě (Vite) | Pouze přes publish |
| Příkaz | `dev` / `demo` | `pnpm embed:publish` |

## Kdy co používat

| Cíl | Použij |
|-----|--------|
| Denní vývoj Experience / Runtime | **Local** (`:4173`) |
| Ověření Embed hostitele (launcher) | **Embed Demo** |
| Partner / produkční IIFE | **GitHub Pages** (po publish + push) |
| „Vidím změnu v Local, ne na Pages?“ | Nejdřív **Publish** — teprve pak hledej bug |

## Diagnostické pravidlo

Při hlášení:

> „V Embedu nevidím změny.“

**První otázka:**

> Byl proveden Publish Release Snapshotu? (`pnpm embed:publish` + commit/push `docs/embed`?)

Teprve po potvrzení publikování se hledá chyba v Runtime nebo Experience.

- **Ne** → očekávané: Pages ukazuje starý snapshot. Spusť publish.  
- **Ano** + remote validate PASS → hledej Runtime / Experience.  
- **Ano** ale remote fingerprint ≠ local → push / Pages build ještě nedobehl.

## Oficiální příkaz

```bash
pnpm embed:publish
```

Jediná podporovaná cesta přípravy Release Snapshotu.

Po nasazení na Pages (commit + push `docs/embed`):

```bash
pnpm embed:publish -- --remote
```

## Co publish dělá

1. Build aktuálního Live Runtime source → `docs/embed/` (`embed.iife.js`, `embed.es.js`, types, `version.json`)
2. Finalize Pages host HTML (`live.html`, partner snippet, …)
3. **Release Validation** (local):
   - `docs/embed` ≡ `packages/embed/dist` (symlink)
   - fingerprint v IIFE = fingerprint buildu
   - `version.json` iifeSha256 = soubor
   - Runtime source string v IIFE
4. Výstup **Release Snapshot READY** nebo **Publish FAILED**

Publish **necommituje** a **nepushuje**. Deploy = git push `docs/embed` (Pages source `/docs`).

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

Remote PASS = GitHub Pages slouží právě tento snapshot.

## Zakázané postupy

- Ruční editace `docs/embed/*.js`
- Volání ad-hoc `sync:pages` / dílčích build kroků místo `embed:publish`
- Ověřování Experience změn proti Pages bez předchozího publish
- Zaměňování Embed Demo (Live) s `docs/embed/live.html` (Release Snapshot)
