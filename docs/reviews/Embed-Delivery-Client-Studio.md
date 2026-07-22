# Embed Delivery Layer → Client Studio Mount

**Status:** COMPLETE  
**Date:** 2026-07-22  
**Scope:** Replace historical Garden HTML default with Client Studio production mount.

---

## Pipeline (production)

```text
Web Page
  → embed.iife.js / embed.es.js
  → Embed.mount({ target, objectId? })
  → Delivery Layer
       → resolve Object Package (default: house-modern-01)
       → create Decision Session Runtime (once)
       → mountClientStudio()
  → ClientStudioApp (injected Runtime)
  → Experience (Hero · Spatial · Priority · Terminal · AI)
```

## Evidence (demo host, 2026-07-22)

| Checkpoint | Result |
| --- | --- |
| Mounted root | `[data-client-studio-root]` + `[data-embed-root]` |
| Runtime | Single instance created in delivery; Provider accepts injection (no second create) |
| Object Package | `house-modern-01` (`dataset.objectId`) |
| Experience | Modern 01 Hero, Spatial walkthrough, Priority cards, Decision Terminal, AI Advisor |
| Garden HTML | Absent (`Priority Experience` not in DOM) |
| Styles | Inlined via `#embed-client-studio-css` |

Screenshot: [assets/embed-delivery-client-studio-demo.png](./assets/embed-delivery-client-studio-demo.png)

Reproduce:

```bash
pnpm --filter @embed-engine/embed demo
# open http://localhost:5180/
```

## Public API (minimal)

```ts
Embed.mount({
  target: "#embed",          // required
  objectId?: "house-modern-01", // optional; defaults to pilot package
});

Embed.unmount();
Embed.version; // "0.1.0"
```

### Legacy (explicit opt-in only)

```ts
Embed.mount({ target: "#embed", fixture: "garden" });
```

Garden is never the implicit production default.

## Shared Runtime (not duplicated)

1. Delivery calls `createDeliveryRuntime(housePackage)`.
2. `mountClientStudio({ target, runtime })` passes that instance into `ClientStudioApp`.
3. `DecisionSessionRuntimeProvider` uses the injected Runtime when provided; creates one only for standalone SPA.

## Architecture notes

- Embed remains delivery/mount only — no second Client Studio product fork.
- Vite bundles Client Studio into `embed.iife.js` / `embed.es.js` (CSS inlined).
- Node unit tests use a stub for `@client-studio/embed-mount`; production bundles resolve the real `apps/client-studio` mount via Vite alias.
- Host pages must serve Object media at `/house-package` and `/media` (Client Studio `public/`).

## Before → After

| Before | After |
| --- | --- |
| `Embed.mount` → Garden fixture → Priority HTML | `Embed.mount` → Object Package → Runtime → ClientStudioApp |
| Garden implicit when using historical demos | Garden requires `fixture: "garden"` |
| Embed Integration Verification: CS not in IIFE | IIFE mounts Client Studio Gen1 |
