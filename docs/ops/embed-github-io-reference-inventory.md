# Inventory — `radimventus.github.io` references (PT-EMBED-MIGRATION-01)

Scan date: 2026-07-29  
Canonical production origin: **`https://conis.cz`**

## Production surfaces — cleared / updated

| Path | Status |
| --- | --- |
| `apps/` | **None** |
| `scripts/` (repo root) | **None** |
| `packages/embed/scripts/{sync-pages,publish-release,validate-pages}.mjs` | **Updated** — `PAGES_ORIGIN = https://conis.cz` (comment may mention forbidden github.io) |
| `docs/embed/*` (official snippet, live, partner-snippet, index) | **Updated** — conis.cz only |
| `packages/ai-delivery-edge/src/handler.ts` | **Updated** — CORS defaults `conis.cz` |
| `packages/ai-delivery-edge/src/handler.test.ts` | **Updated** |
| `packages/ai-delivery-edge/README.md` | **Updated** |
| `docs/ops/ai-delivery-edge/{README.md,deployment.json}` | **Updated** |
| `docs/releases/GitHub Pages Distribution.md` | **Rewritten** for conis.cz |
| `docs/releases/Embed Foundation v1.md` | **Updated** |
| `docs/reference/Client-Studio-{Reference,Gen1}.md` | **Updated** |
| `docs/implementation/Engineering Debt.md` | **Updated** |
| `docs/reviews/PT-INT-02-canonical-partner-snippet.md` | **Updated** (canonical guidance) |

## Archival / historical only (not production install instructions)

These files still contain frozen github.io URLs as **historical evidence** of past validation. They must not be copied into CMS.

| Path |
| --- |
| `docs/reviews/PT-EMBED-01-validation.md` |
| `docs/reviews/PT-HERO-00-validation.md` |
| `docs/reviews/PT-UX-SYNC-01-plan.md` |
| `docs/reviews/PT-TOUR-VERIFY-01.md` |
| `docs/reviews/PT-INT-01-partner-integration.md` |
| `docs/reviews/Embed-Rendering-Parity.md` |
| `docs/reviews/PT-VERIFY-UX-01-activation.md` |
| `docs/reviews/PT-RELEASE-TOUR-01.md` |
| `docs/reviews/PT-AI-RUNTIME-DIAG-01.md` |
| `docs/reviews/assets/pt-ai-runtime-diag-01/trace.json` |
| `docs/reviews/assets/pt-ux-sync-02/report.json` |
| `docs/reviews/assets/pt-ux-sync-02/published-tour-verify.json` |
| `docs/reviews/assets/pt-publish-01/report.json` |

## Explanatory comment (allowed)

| Path | Note |
| --- | --- |
| `packages/embed/scripts/sync-pages.mjs` | Comment documents why github.io must not be used as `assetBase` |

## Partner CMS (outside repo)

| Host | Status |
| --- | --- |
| `https://www.domysenergii.cz/embed` BaseKit widget | **Still legacy github.io until operator paste** — see migration checklist §4 |
