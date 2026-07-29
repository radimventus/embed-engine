# Client Studio Reference Build

**Status:** ACTIVE (frozen etalon)  
**URL:** http://127.0.0.1:5174/  
**Artifact:** `apps/client-studio/reference-build/`  
**Manifest:** `apps/client-studio/reference-build/REFERENCE.json`

---

## Purpose

The Reference Build is a **stable visual / UX image** of Client Studio.

It exists so the team can:

- compare new work against a known baseline,
- run visual regression checks,
- discuss UX without chasing a moving `localhost` target.

It is **not** for day-to-day development and **not** the production Embed pipeline.

---

## Three environments

| Environment | How to run | Role |
| --- | --- | --- |
| **Development** | `pnpm --filter @embed-engine/client-studio dev` → http://127.0.0.1:4173/ | Working tree; may be incomplete |
| **Production Embed** | conis.cz IIFE → https://conis.cz/embed/ | Host-page delivery |
| **Reference Build** | `pnpm reference` → http://127.0.0.1:5174/ | Immutable visual etalon |

---

## How to start

From the monorepo root:

```bash
pnpm reference
```

Or:

```bash
pnpm --filter @embed-engine/client-studio reference
```

Open:

```text
http://127.0.0.1:5174/
```

No Vite HMR. Static production assets from `apps/client-studio/reference-build/`.

---

## What it contains

Snapshot of Client Studio at freeze time:

- Hero (**pilot Reference Implementation v1.0** — see [Hero-v1.0.md](./Hero-v1.0.md) / [HERO-V1-FREEZE.md](../architecture/HERO-V1-FREEZE.md))
- Sidebar / App Shell / layout
- House Navigator / Media Explorer
- Priority Experience
- Decision Terminal
- AI Advisor / Lead Capture (as shipped at freeze)
- Design tokens (as compiled into the CSS bundle)
- Object / house media from `public/` at freeze time
- Decision Session Runtime **as bundled in that build** (Runtime is not separately “version-frozen”; UX is)

See `REFERENCE.json` for `frozenAt`, `sourceCommit`, and package version.

---

## What does not belong here

- Experimental feature flags
- Work-in-progress branches / uncommitted experiments
- Continuous updates from every PR
- Production Embed snippet hosting (that remains GitHub Pages)
- Using this port as a substitute for `dev` on `:4173`

---

## When and how to update

**Only after a conscious team decision** (e.g. after a Gen1 milestone or agreed visual baseline refresh).

Procedure:

```bash
pnpm reference:freeze
git add apps/client-studio/reference-build
git commit -m "chore(client-studio): refresh Reference Build etalon"
```

`reference:freeze` rebuilds `reference-build/` and rewrites `REFERENCE.json`.

Do **not** wire this into CI auto-publish or `turbo build` side effects.

---

## Related

- ADR: [docs/adr/ADR-Reference-Build.md](../adr/ADR-Reference-Build.md)
- Rendering parity (Embed vs Studio): [docs/reviews/Embed-Rendering-Parity.md](../reviews/Embed-Rendering-Parity.md)
