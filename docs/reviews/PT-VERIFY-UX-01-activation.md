# PT-VERIFY-UX-01 — Acceptance Validation Failure

**Status:** ROOT CAUSE CONFIRMED · PUBLISHED (`f75b8eb` on Pages branch)  
**Date:** 2026-07-23  
**Related:** `d31d046` (implementation) · `f75b8eb` (activation)

---

## Verdict

`d31d046` **does implement** smooth landing reveal and the unified sticky header.  
GitHub Pages and the partner host showed the **pre-UX** bundle because **`d31d046` was never published** to the Pages source branch.

This is a **deploy / activation** failure, not a wrong render branch, feature flag, or alternate Header.

---

## What is actually rendered

| Environment | Bundle source | Commit on Pages branch tip | UI |
| --- | --- | --- | --- |
| Local `docs/embed/embed.iife.js` (after `d31d046`) | rebuilt IIFE | contains UX | `data-experience-header`, `Zavolat`, no chrome bar, `fromTop:!0` settle |
| `origin/feature/cap-p04-founding-partner` (before activation push) | Pages `/docs` | **`cb8dfd3` only** | `data-embed-overlay-chrome`, text “Zavřít Client Studio”, no unified header |
| Partner site | typically Pages IIFE URL | same as Pages tip | same legacy Close Bar |

Active Client Studio path (unchanged):

`ClientStudioApp` → `header={<ClientStudioHeader />}` (not Legacy host; legacy only if `embed.enableLegacyCommandRuntime=1`).

The component edited in `d31d046` **is** the live header. It simply never reached the published IIFE.

---

## Why the push missed UX

Operator push (terminal) ran while **HEAD = `cb8dfd3`**:

```text
f6c1008..cb8dfd3  feature/cap-p04-founding-partner -> feature/cap-p04-founding-partner
```

`d31d046` was created **after** that push and remained **local ahead by 1**.

Pages source (docs): branch `feature/cap-p04-founding-partner`, folder `/docs` — no GitHub Actions.  
Until `d31d046` is on that remote tip, live demo cannot show UX polish.

---

## Checks ruled out

| Hypothesis | Result |
| --- | --- |
| Wrong Header / inactive render branch | Ruled out — `ClientStudioHeader` is the AppShell header |
| Legacy Command Runtime flag | Ruled out — default off; would blank header entirely |
| Source changed but IIFE not rebuilt | Ruled out locally — `docs/embed/embed.iife.js` in `d31d046` includes UX markers |
| Partner-only / embed snippet bug | Ruled out — Pages demo matched partner (both served old tip) |

---

## Activation

1. Publish `d31d046` (+ activation commit) to `feature/cap-p04-founding-partner`.
2. Wait for GitHub Pages rebuild (≈1–3 min).
3. Open `https://radimventus.github.io/embed-engine/embed/live.html` (script uses `?v=ux-01`).
4. Confirm: no Close Bar · × in sticky header · visible smooth Hero → Social Proof reveal.

Partner host must load the **updated** Pages IIFE — bump `?v=` on the script `src` (recommended: `embed.iife.js?v=ux-01`) or hard-refresh.

### Post-activation evidence

- `docs/reviews/assets/pt-verify-ux-01-open-hero.png`
- `docs/reviews/assets/pt-verify-ux-01-revealing.png`
- `docs/reviews/assets/pt-verify-ux-01-landing.png`
