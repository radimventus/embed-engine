# Client Studio Gen1

**Status:** FROZEN  
**URL:** http://127.0.0.1:5175/  
**Artifact:** `apps/client-studio/gen1/`  
**Manifest:** `apps/client-studio/gen1/GEN1.json`

---

## Purpose

Gen1 is the **last static Client Studio** before the Decision Experience / Interpretation / AI product stage.

It is a long-lived visual and functional etalon. It is **not** developed further in place. Ongoing work happens on the main Client Studio app (`dev` → `:4173`) and later generations.

---

## How to start

```bash
pnpm cs:gen1
```

Open:

```text
http://127.0.0.1:5175/
```

No HMR. Static production assets from `apps/client-studio/gen1/`.

Conscious refresh only:

```bash
pnpm cs:gen1:freeze
git add apps/client-studio/gen1
git commit -m "chore(client-studio): refresh Gen1 freeze"
```

---

## What is included

As shipped at freeze time (static Studio):

- Hero
- Media Explorer
- House Navigator
- Priority (UI for collecting input)
- FAQ / advisor chrome present in the Gen1 build (static presentation)
- Lead Capture
- Design tokens and media assets captured at freeze

Runtime is whatever was bundled at freeze (`runtime: "current"` in `GEN1.json`) — Gen1 freezes the **Studio image**, not Runtime as a separate version train.

---

## What is not included

Do **not** evolve Gen1 into these stages (they proceed outside `gen1/`):

- Decision Experience (post-Gen1 product stage)
- Interpretation as a first-class product layer
- Recommendation / adaptive intelligence beyond freeze-time UI
- New AI Advisor behaviour beyond the frozen static chrome
- Day-to-day development (use `:4173`)

---

## Relation to Reference Build

| Instance | Port | Role |
| --- | --- | --- |
| **Gen1** (`pnpm cs:gen1`) | **5175** | Product freeze: last static Studio before Decision Experience |
| Reference Build (`pnpm reference`) | 5174 | Visual regression etalon (Embed Foundation) |

Both are frozen artifacts. Prefer **Gen1** as the named baseline for Decision Experience work.

---

## Environments (after Gen1 freeze)

| Environment | Entry |
| --- | --- |
| Development | http://127.0.0.1:4173/ |
| Gen1 (frozen) | http://127.0.0.1:5175/ |
| Reference Build | http://127.0.0.1:5174/ |
| Production Embed | https://conis.cz/embed/ |
