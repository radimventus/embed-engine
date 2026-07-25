# WP-A — AI Delivery Package Boundaries — Compliance

**Date:** 2026-07-25  
**CAP:** CAP-AI-DELIVERY-01 / WP-A  
**Package:** `@embed-engine/ai`

## Checks

| Check | Result |
| --- | --- |
| Behavior change | **None** — no request/bootstrap/provider flow changes |
| Public API breaking change | **None** — existing root exports preserved; boundary constants additive |
| Experience change | **None** |
| Decision Runtime change | **None** |
| Release Workflow change | **None** |
| Delivery implementation | **None** — placeholder only |
| Contract TS models | **None** — placeholder only |
| Adapter extraction | **None** — `providers/` unchanged |
| OpenAI move | **None** |

## Structure created

| Path | Role |
| --- | --- |
| `src/runtime/` | Boundary + re-export of AIService / ConversationError |
| `src/delivery/` | Placeholder (`AI_DELIVERY_BOUNDARY`) |
| `src/adapter/` | Placeholder (`AI_ADAPTER_BOUNDARY`) |
| `src/contract/` | Placeholder (`AI_CONTRACT_BOUNDARY`, `AI_CONTRACT_VERSION`) |
| `src/BOUNDARIES.md` | In-package map |

## Files moved

**None.**

## Files added

- `src/runtime/index.ts`
- `src/delivery/index.ts`
- `src/adapter/index.ts`
- `src/contract/index.ts`
- `src/BOUNDARIES.md`
- `docs/architecture/ai/WP-A-boundaries-compliance.md` (this file)

## Next

WP-B / Step B: isolate Runtime from Adapter via Delivery port (logic), still without Gateway.
