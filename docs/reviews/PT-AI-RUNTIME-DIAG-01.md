# PT-AI-RUNTIME-DIAG-01 — AI Runtime after publish

## Verdict

AI / OpenAI still work. Failures are **host binding / configuration**, not Runtime, Adapter, or model auth.

| Host | First failing layer |
| --- | --- |
| **Local** (Client Studio) | Delivery credential binding (`import.meta.env` dynamic read) |
| **Published** (Pages IIFE) | Remote configuration (no `deliveryUrl` + no public Edge) |

Evidence: `docs/reviews/assets/pt-ai-runtime-diag-01/trace.json`

---

## End-to-end trace

### Local (Client Studio Vite)

```text
Experience          PASS
Runtime             PASS  (createAIServiceFromDelivery)
Delivery            FAIL  ← first failure
  selected:         auto → mode "local"
  implementation:   NotConfiguredDelivery (id: direct-adapter)
  why:              tryCreateLocalDevDelivery() → null
RemoteDelivery      NOT REACHED
Edge                NOT REACHED
Adapter/OpenAI      NOT REACHED (browser)
OpenAI (direct)     PASS  (curl /v1/models with .env.local key → 200)
```

**UX:** `AI není připravená — chybí API klíč.` (`missing_api_key`)

**Root cause (Local):**  
`.env.local` contains `VITE_OPENAI_API_KEY` and Vite `loadEnv(repoRoot)` sees it, but `createLocalDevDelivery.readViteEnv` uses:

```ts
const value = meta.env?.[name]; // dynamic key
```

Vite does **not** rewrite dynamic `import.meta.env[name]` the same way as static `import.meta.env.VITE_OPENAI_API_KEY`. In the browser probe, `tryCreateLocalDevDelivery()` returned `null` despite a present `.env.local` key. `process.env.OPENAI_API_KEY` is also empty in the browser (only `NODE_ENV` defined).

Before migration, Experience/bootstrap typically read the key via a **static** Vite env access. After CAP-AI-PUBLISH-01 the read moved behind Delivery and became dynamic → Local appears “unconfigured”.

---

### Published (GitHub Pages)

```text
Experience          PASS
Runtime             PASS
Delivery            FAIL  ← first failure (configuration)
  selected:         auto → mode "local" (no public URL)
  implementation:   NotConfiguredDelivery
  baked env:        VITE_AI_DELIVERY_URL:""  VITE_OPENAI_API_KEY:""
  window:           __EMBED_AI_DELIVERY__ absent on live.html / partner snippet
RemoteDelivery      NOT REACHED  (no deliveryUrl)
Edge                NOT REACHED  (no public edge deployed; guessed Pages paths → 404)
Adapter             NOT REACHED
OpenAI              NOT REACHED
```

**UX:** Mapped NotConfigured alone → missing-key copy. Observed “Došlo k chybě při generování odpovědi.” matches AIAdvisor **non-ConversationError fallback** / `provider_error` string (same product copy). Either way, chat never leaves the browser.

**Root cause (Published):**  
Release Snapshot is correctly **sterile** (no API key). Published mode requires a public Delivery edge URL via:

- `VITE_AI_DELIVERY_URL=…` at `pnpm embed:publish`, **or**
- `window.__EMBED_AI_DELIVERY__ = { deliveryUrl: "…" }` on the host page

Neither was set for commit `1999e91` / fingerprint `93552bc`. No production Edge is deployed (only local `@embed-engine/ai-delivery-edge` on `127.0.0.1:8787`).

---

## Layer checks (shared)

| Layer | Result | Notes |
| --- | --- | --- |
| OpenAI auth | **PASS** | `.env.local` key → `GET /v1/models` 200 |
| Local Edge → OpenAI | **PASS** | ephemeral edge `/health` + `/v1/chat` → 200 |
| CORS allowlist | OK in edge code | includes `https://radimventus.github.io` |
| Architecture | unchanged | diagnosis only |

---

## Minimal fix (proposal only — not applied)

### A. Local (unblock Dev immediately)

In `packages/ai/src/adapter/openai/createLocalDevDelivery.ts`, read env with **static** Vite access (or equivalent Vite-safe pattern), e.g. direct `import.meta.env.VITE_OPENAI_API_KEY`, so Client Studio injects the key again.

Optional belt-and-suspenders: also document `OPENAI_API_KEY` for Node-only hosts (already supported via `process.env`).

### B. Published (required for Pages AI)

1. Deploy AI Delivery edge somewhere reachable over HTTPS (Fly/Cloudflare/etc.) with `OPENAI_API_KEY` server-side.  
2. Point the Release host at it **without baking secrets**:

```html
window.__EMBED_AI_DELIVERY__ = {
  deliveryUrl: "https://your-delivery-edge.example"
};
```

or republish with:

```bash
VITE_AI_DELIVERY_URL=https://your-delivery-edge.example pnpm embed:publish
```

3. Confirm browser Network: `POST {deliveryUrl}/v1/chat` only — never `api.openai.com`.

Do **not** put `OPENAI_API_KEY` back into the IIFE.

---

## What not to change

- Runtime / Adapter / Experience architecture  
- Sterile publish stripping of `VITE_OPENAI_API_KEY`  
- ACC / AIS scope
