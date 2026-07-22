# Client Studio Gen1 Freeze

**Status:** COMPLETE  
**Date:** 2026-07-22  
**Artifact:** `apps/client-studio/gen1/`  
**URL:** http://127.0.0.1:5175/  
**Source commit:** see `apps/client-studio/gen1/GEN1.json` → `createdFrom`

---

## Confirmation

**Client Studio Gen1 has been successfully frozen** and will serve as the reference baseline for all subsequent Decision Experience generations.

| Check | Result |
| --- | --- |
| Independent local URL | http://127.0.0.1:5175/ via `pnpm cs:gen1` |
| Visual match to freeze-time Studio | Production build of current Client Studio (same CSS/JS/assets snapshot) |
| Isolated from day-to-day `dev` | Output lives in `gen1/`; not overwritten by `vite` / `dev` / `build` → `dist/` |
| Documented | [Client-Studio-Gen1.md](../reference/Client-Studio-Gen1.md) |
| Metadata | [GEN1.json](../../apps/client-studio/gen1/GEN1.json) |

---

## Product boundary

Gen1 freezes the **static** Client Studio image before Decision Experience work.

Further development (Interpretation, adaptive Experience, AI Advisor intelligence, Decision Experience) proceeds **outside** `apps/client-studio/gen1/` — on the main app and future generations. Gen1 is updated only by explicit `pnpm cs:gen1:freeze` + commit.

---

## Launch

```bash
pnpm cs:gen1
```
