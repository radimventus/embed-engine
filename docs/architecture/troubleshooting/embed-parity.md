# Troubleshooting — Embed parity (Runtime vs Release)

**Status:** Accepted  
**CAP:** CAP-GOV-01  
**Related:** [ADR-019](../adr/ADR-019-runtime-vs-release.md) · [embed-release-workflow.md](../embed-release-workflow.md) · [runtime-ssot.md](../runtime-ssot.md)

## Purpose

Give a fixed diagnosis order when Local, Embed Demo, and Published Embed disagree — without treating every gap as a Runtime defect.

## Terminology

| Term | What it is | How to run / open |
| --- | --- | --- |
| **Local Runtime** | Live Vite host of the one Runtime | `pnpm --filter @embed-engine/client-studio dev` |
| **Embed Demo** | Live Vite partner-style host of the same Runtime | `pnpm --filter @embed-engine/embed demo` |
| **Release Snapshot** | Built tree in `docs/embed/` | created only by `pnpm embed:publish` |
| **Published Embed** | That snapshot on GitHub Pages | e.g. `…/embed/live.html` after commit + push |

Do **not** say “Live Embed” unless you name which of the four you mean.

---

## 1. Nevidím změny v Embedu

### Rule

Diagnosis **always** follows this order. Do not skip ahead to “Runtime bug”.

```text
1. Local Runtime
2. Embed Demo
3. pnpm embed:publish
4. Commit + Push
5. Remote Validation
6. Browser Verification
```

Only after steps 1–6 are green may you treat the issue as a **Runtime / Experience** defect.

### Checklist

#### 1. Local Runtime

- Start Local Runtime.
- Confirm title, CTA markers, Experience chrome, and object id you expect.
- **FAIL here** → Runtime / Experience issue (stop Release diagnosis).
- **PASS** → continue.

#### 2. Embed Demo

- Start Embed Demo.
- Confirm the same Experience markers as Local Runtime.
- **FAIL while Local PASS** → host / Embed delivery issue on the live path (still not Pages).
- **PASS** → continue.

#### 3. `pnpm embed:publish`

```bash
pnpm embed:publish
```

- Must end with **Release Snapshot READY**.
- **FAIL** → Release Validation / publish tooling (not “Pages is wrong Runtime”).
- **PASS** → continue.

#### 4. Commit + Push

- Commit the Release Snapshot (`docs/embed/` and related Pages assets required by the workflow).
- Push to the branch that GitHub Pages serves.
- **Not pushed** → Published Embed will stay stale. Expected. Not a Runtime bug.

#### 5. Remote Validation

```bash
pnpm embed:publish -- --remote
```

- **Never rebuilds.** Validates the existing Release Snapshot in `docs/embed/` against GitHub Pages.
- Need a new snapshot? Run `pnpm embed:publish` first (build), then commit + push, then `--remote`.
- Confirms GitHub Pages serves the fingerprint of the Release Snapshot under test.
- **FAIL** → Pages lag, wrong branch, or snapshot not deployed. Still a **Release** category.
- **PASS** → continue.

#### 6. Browser Verification

- Open **Published Embed** (e.g. Pages `live.html`).
- Confirm title, CTA marker, fingerprint / `Embed.build`, and Experience.
- Must match the Release Snapshot just published — not an older freeze.

### Decision table

| Local | Demo | Publish READY | Remote PASS | Browser | Category |
| --- | --- | --- | --- | --- | --- |
| FAIL | — | — | — | — | Runtime / Experience |
| PASS | FAIL | — | — | — | Live host / delivery (not Pages) |
| PASS | PASS | not run / FAIL | — | — | Release preparation |
| PASS | PASS | PASS | FAIL | — | Deploy / Pages / fingerprint |
| PASS | PASS | PASS | PASS | FAIL | Published surface / caching / wrong URL |
| PASS | PASS | PASS | PASS | PASS | No parity defect |

### Forbidden shortcuts

- Opening Published Embed first and declaring “Runtime broken”.
- Editing `docs/embed/*.js` by hand.
- Comparing against archival freezes (`reference-build`, `gen1`, archived IIFE hosts) as if they were Local Runtime or Embed Demo.
- Skipping publish because “Demo already looks fine”.

---

## 2. Quick map — where to develop vs where to publish

| Goal | Surface |
| --- | --- |
| Daily development | **Local Runtime** |
| Partner launcher check without publish | **Embed Demo** |
| Cut a partner-visible build | **`pnpm embed:publish`** → Release Snapshot |
| Prove partners see that build | Commit + push → **Remote Validation** → **Published Embed** |

Full workflow diagram: [embed-release-workflow.md](../embed-release-workflow.md).
