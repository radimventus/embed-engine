# PT-EMBED-BOOTSTRAP-01 — Hero → Client Studio Transition Audit

**Date:** 2026-07-24  
**Scope:** Audit only — no product fixes.  
**Surfaces:**

| Surface | URL | CTA |
| --- | --- | --- |
| Partner IIFE harness | `http://127.0.0.1:8765/embed/audit-harness.html` | `[data-embed-hero-cta]` |
| Embed demo (Vite) | `http://127.0.0.1:5180/` | `#open-client-studio` |

**Artifacts:** `docs/reviews/assets/pt-embed-bootstrap-01/`  
(`audit-harness.json`, `audit-demo.json`, `01-before-harness.png`, `01-before-demo.png`, lean/CDP runners)

---

## Verdict

**B — Bootstrap začne, ale Runtime nevznikne.**

First failure (exact):

`packages/embed/src/delivery/revealEngine.ts` → `waitForSelector` → `poll()`  
busy-loops with `queueMicrotask(poll)` while waiting for `#social-proof` inside the overlay mount.

`#social-proof` is absent because `DecisionSessionRuntimeProvider` returns `null` until async Builder Package bootstrap finishes. The microtask storm starves the event loop, so CSV/`fetch` completion and `createDecisionSessionRuntime` never run. Client Studio Experience tree never mounts.

---

## 1. Event trace (Hero CTA → Client Studio)

| Step | Called? | Returns? | Exception? | Promise reject? | Timeout / hang? |
| --- | --- | --- | --- | --- | --- |
| Hero CTA click | YES | handler entered | no | no | — |
| Click handler (`onOpenExperience` / launcher `onActivate`) | YES | YES (sync) | no | no | — |
| `launchExperience()` | YES | sync body starts; outer Promise never settles in practice | no `Embed.launch: failed…` | no reject observed | main thread wedged before settle |
| `ensureClientStudioStyles()` | YES | YES | no | — | — |
| `createOverlaySurface()` | YES | YES | no | — | DOM: `[data-embed-overlay]` present |
| `mountClientStudio()` | YES | YES (attrs + `createRoot().render`) | no | — | `[data-client-studio-root]` present; mount HTML ~3979 |
| `DecisionSessionRuntimeProvider` mount | YES | renders `null` while `packageReady === false` | no | — | bootstrap `useEffect` scheduled |
| `ensureBuilderPackageBootstrapped()` / CSV `fetch` | demo: YES (requests issued); harness: often starved before request | never completes | no | never rejects (never settles) | starved by microtask loop |
| `createDecisionSessionRuntime` | NO | — | — | — | never reached |
| `runRevealEngine` → `waitForSelector('#social-proof')` | YES | Promise never resolves | no | no | **infinite `queueMicrotask(poll)`** |
| React Experience tree (`RuntimeBootstrapGate` → Hero / Studio) | NO | — | — | — | Provider children not mounted |
| Client Studio ready / Reveal active | NO | — | — | — | — |

Stack proof (demo, Vite):

```text
STACK100 …
    at poll (…/packages/embed/src/delivery/revealEngine.ts:114:7)
STORM_AT 5000 overlay true socialInMount false mountLen 3979 csvHint []
```

Stack proof (harness, IIFE):

```text
STACK100 …
    at E (…/embed/embed.iife.js:684:6203)   // minified waitForSelector poll
STORM_AT 3000 overlay true studio true socialInMount false mountLen 3979
```

---

## 2. Console

### Pre-click (harness)

| Type | Text |
| --- | --- |
| info | `Embed Runtime` / Build `40bfd9e` / Runtime source label / Built timestamp |
| error | `Failed to load resource: … 404` → **`/favicon.ico`** (unrelated) |

### Post-click

| Surface | console.error | Unhandled rejection | React Error Boundary | Other |
| --- | --- | --- | --- | --- |
| Harness | none from Embed.launch | none | none | no `journey.started` (effects usually lose the race) |
| Demo | none from Embed.launch | none | none | `[decision-analytics] journey.started …` then freeze |

No filtered omissions: Playwright captured all console messages for the session; post-click product errors are empty because the thread never reaches failure handling — it busy-loops instead.

---

## 3. Network

### Harness (IIFE) after CTA — ~14s window

- Post-click **requests: 0**
- Post-click **responses: 0**
- CSV: none
- First failing request after CTA: **none** (transition dies before network)

CSV URLs themselves are reachable on the harness origin (`/house-package/*.csv` → HTTP 200 when probed outside the frozen page).

### Demo (Vite) after CTA

| Request | Observed |
| --- | --- |
| Google Fonts Inter CSS | request started |
| `/house-package/gallery.csv` | request started |
| `/house-package/rooms.csv` | request started |
| `/house-package/videos.csv` | request started |

Across a 14s observation window: **responseCount stayed 0** while the main thread was in the microtask storm (fetch completion / JS reactions starved). Same CSVs return HTTP 200 in &lt;50ms via `curl` against `:5180`.

First failed post-click request: **none** (hang, not HTTP error).

---

## 4. Runtime

| Question | Answer |
| --- | --- |
| Runtime created? | **NO** |
| Runtime source log (`Embed Runtime source:` / room counts) | **not emitted** (only Embed *loader* fingerprint on `Embed.mount`) |
| Room count | n/a — Runtime instance never constructed |
| Bootstrap completed? | **NO** |

Demo proves Provider bootstrap **started** (CSV requests + `journey.started`). `createDecisionSessionRuntime` never runs.

---

## 5. React mount

| Layer | Mounted? |
| --- | --- |
| Overlay + `[data-client-studio-root]` attrs | YES |
| `ClientStudioApp` → `DecisionAnalyticsProvider` | YES (demo: `journey.started`) |
| `DecisionSessionRuntimeProvider` | YES, but **`return null`** while not ready |
| `RuntimeBootstrapGate` / `StudioLoading` | NO (child of Provider; not rendered when value is null) |
| Experience sections (`#social-proof`, Hero, Terminal, …) | NO |

Mount stops at Provider empty render. Experience root never appears.

---

## 6. DOM

### Before click

- Hero / host CTA visible  
- No `[data-embed-overlay]`  
- No `[data-client-studio-root]`  
- Screenshot: `docs/reviews/assets/pt-embed-bootstrap-01/01-before-harness.png` (and `01-before-demo.png`)

### After click (observed via instrumentation during storm)

```text
Hero (still under overlay host lock)
  ↓
[data-embed-overlay]          ← YES
  └─ [data-embed-overlay-mount][data-client-studio-root]
       mountLen ≈ 3979
       #social-proof          ← NO
       StudioLoading          ← NO
       Client Studio Experience ← NO
```

First DOM change that **does not** occur: insertion of `#social-proof` (and the rest of the Decision Session tree).

### After screenshot

`page.screenshot` after CTA **times out** (main thread / compositor wedged). No reliable after-CTA PNG; freeze is itself evidence.

---

## 7. Causal chain (why B)

```text
CTA
 → launchExperience
 → overlay + mountClientStudio
 → Provider mounts, packageReady=false → render null
 → runRevealEngine waits for #social-proof (LAUNCHER_DEFAULT_LANDING_ANCHOR)
 → waitForSelector poll: queueMicrotask(poll) forever while missing
 → event loop starved
 → Builder CSV bootstrap never completes
 → Runtime never created
 → #social-proof never appears
 → deadlock
```

Contributing design collision (not the busy-loop itself, but why the selector never appears):

1. Reveal assumes Studio Landing Anchor DOM exists once mount attrs are set.  
2. Provider withholds all children (including `#social-proof`) until Runtime exists.  
3. `waitForSelector` has **no timeout** and uses a **tight microtask poll** (`revealEngine.ts`).

---

## Decision (single letter)

### **B**

Bootstrap begins (overlay, Client Studio mount shell, Provider, and on demo CSV/`journey.started`), but **Decision Session Runtime is never created**.

Not A — CTA reaches Delivery / `launchExperience`.  
Not C — Runtime never exists; React shell mounts but Experience tree does not.  
Not D — no render error / Error Boundary.  
Not E — nothing to overlay; Experience never painted.

---

## Validation

First stop of Hero → Client Studio is uniquely identified:

**`revealEngine.waitForSelector` microtask busy-loop on `#social-proof` while Provider returns `null` during async Runtime bootstrap.**

That is the concrete integration defect to fix next (timeout/yield in Reveal, or don’t wait for anchors that only exist after Runtime ready / show a loading gate outside the ready gate) — out of scope for this PT.
