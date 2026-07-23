# Experience Modes & Builder Integration

**Status:** Accepted (Architecture SSOT — Experience Delivery architecture freeze)  
**Version:** 0.2  
**Date:** 2026-07-23  
**ID:** EMB-01  
**Layer:** Platform Architecture · Experience Host · Builder · Embed Delivery  
**SSOT for:** Experience Host, Experience Modes (Standalone / Launcher / Inline), Builder `ExperiencePresentationConfig`, Launch Context, Landing Anchor policy, Close behaviour contract, Delivery vs Runtime responsibility split  
**Not SSOT for:** Runtime Kernel algorithms, Decision Journey section order/content, House Package schema, Builder UI pixels, CMS storage format, React implementation

**Depends on:**

- [ELA-01 — Experience Launcher Architecture](./Experience-Launcher-Architecture.md) (Accepted)
- [ADR-014 — Experience Launcher](../adr/ADR-014-experience-launcher.md) (Accepted)
- [ADR-015 — Experience Modes & Builder](../adr/ADR-015-experience-modes-builder.md) (Accepted)
- [ADR-016 — Experience Delivery Layer](../adr/ADR-016-experience-delivery-layer.md) (Accepted)
- [EDL-01 — Experience Delivery Layer](./Experience-Delivery-Layer.md) (Accepted)
- [ADR-001 — Runtime Architecture](../adr/ADR-001-runtime-architecture.md)
- [DEB-01 — Decision Experience Blueprint](../../product/decision-experience/Decision-Experience-Blueprint.md)
- [RI-001](../../04-reference-implementation/RI-001-Runtime-Kernel.md) · [RI-002](../../04-reference-implementation/RI-002-Decision-Session.md)

**Principle:** One Client Studio. One Runtime. **Experience Host** owns where the Experience starts; **Modes** configure how it is presented; neither changes what the Experience means.

---

## 1. Purpose

ELA-01 defines Launcher Mode lifecycle.  
**EMB-01** defines:

1. **Experience Host** as the environment that owns starting an Experience,
2. the full set of **Experience Modes**,
3. how **Builder** declares presentation config (not Delivery behaviour),
4. **Launch Context** as technical/marketing entry metadata into a Session boundary,
5. which knobs belong to **Delivery** vs **Runtime**,
6. a stable **Landing Anchor** and **Close** contract usable without forking UI.

---

## 1A. Experience Host

### 1A.1 Definition

**Experience Host** is the environment that **owns starting** a Client Studio Experience.

It is the outer platform surface in which a user encounters an entry point (Launcher, page load, QR, Terminal action, external app trigger). The Host does **not** own Decision semantics.

```text
Experience Host
    ↓
Experience Mode
    ↓
Delivery Layer
    ↓
Client Studio
    ↓
Runtime Session
```

| Layer | Owns |
| --- | --- |
| **Experience Host** | Where / from which product surface the Experience is started |
| **Experience Mode** | How Client Studio is presented once started (standalone / launcher / inline) |
| **Delivery Layer** | Mount, overlay, lifecycle, interpreting presentation config |
| **Client Studio** | Single Decision Journey UI |
| **Runtime** | Sole semantic authority for the Session |

### 1A.2 Initial Host catalogue

| Host | Status | Typical Mode | Notes |
| --- | --- | --- | --- |
| **Partner Website** | Pilot | `launcher` (default) | Partner owns chrome; Launcher on page |
| **Standalone Page** | Current | `standalone` | QA, Gen1, Pages `live.html` |
| **Sales Terminal** | Planned | TBD (often standalone or launcher-like) | Sales Studio product surface |
| **Operations Terminal** | Planned | TBD | Manager / ops surface |
| **QR Entry** | Future | typically `launcher` or `standalone` | Physical → digital entry |
| **External Application** | Future | via Delivery API | CRM, portal, native shell |

Hosts may grow without forking Client Studio or Runtime. A new Host selects an Experience Mode and supplies Launch Context; it does not invent a new Studio.

### 1A.3 Rules

1. Host **starts** Experience via Delivery (`open` / `mount`).
2. Host **MUST NOT** call Runtime domain commands directly (room, priority, story).
3. Host **MAY** attach Launch Context (entry metadata).
4. Multiple Hosts share one Client Studio binary and one Runtime model.

---

## 2. Experience Modes Specification

### 2.1 Mode enumeration

| Mode ID | Name | Default for partners? | Presence |
| --- | --- | --- | --- |
| `standalone` | Standalone | No (QA / dedicated URL / Pages live) | Client Studio owns the page viewport |
| `launcher` | Launcher Mode | **Yes** | Host page + Launcher; CS opens as fullscreen overlay |
| `inline` | Inline Mode | No (legacy / constrained embeds) | CS mounted permanently in a host region |

```text
ExperienceMode = "standalone" | "launcher" | "inline"
```

Mode is chosen **for a Host deployment**, not by Runtime.

### 2.2 Shared invariants (all modes)

1. **Single Client Studio implementation** — no mode-specific Studio fork.
2. **Single Runtime** — mode must not change Interpretation, Decision Story, Moves, or Terminal semantics.
3. **Decision Journey section order is identical** across modes.
4. Builder **declares** `ExperiencePresentationConfig` only — it does **not** configure Delivery internals.
5. Delivery **interprets** that config and realizes presence for the Host + Mode.
6. Runtime owns session meaning and remains **mode-agnostic**.

### 2.3 Mode A — Standalone

**Intent:** Full-page Decision Experience (demo, freeze, internal QA, `live.html`).

**Typical Host:** Standalone Page.

**Behaviour:**

```text
Page load
  → Delivery mounts Client Studio into page root
  → Journey from top (Hero → Social Proof → Tour → …)
  → No partner overlay lifecycle
```

| Concern | Behaviour |
| --- | --- |
| Host chrome | Studio is the page (or dedicated host shell) |
| Launcher | Not required |
| Overlay | No |
| Auto-scroll on enter | Off by default |
| Landing Anchor | Top of Journey (`hero`) unless overridden |
| Close Action | Optional (navigate away / none); not required |
| Hide Hero / Footer | Off by default |

### 2.4 Mode B — Launcher Mode (Default)

**Intent:** Partner sites with existing header/footer/nav.

**Typical Host:** Partner Website.

**Behaviour:**

```text
Partner page + Experience Launcher
  → user activates Launcher
  → Delivery opens CS overlay (full viewport)
  → auto-scroll ≈ 0.5 s
  → Landing Anchor = Social Proof (default)
  → user explores Journey
  → Close Client Studio
  → restore host scroll + remove overlay
```

| Concern | Behaviour |
| --- | --- |
| Host chrome | Remains; page stays under overlay |
| Launcher | Required (declared in presentation config) |
| Overlay | Yes — Delivery responsibility |
| Auto-scroll | On by default (~0.5 s) |
| Landing Anchor | `social-proof` default |
| Close Action | **Required** — left nav + footer („Zavřít Client Studio“) |
| Hide Hero / Footer | Off by default (Hero remains in Journey; not landing) |

Detail lifecycle: [ELA-01 §5](./Experience-Launcher-Architecture.md).

### 2.5 Mode C — Inline Mode

**Intent:** Permanent embed inside a partner content region when overlay is undesirable, accepting layout trade-offs.

**Typical Host:** Partner Website (constrained slot).

**Behaviour:**

```text
Partner page region
  → Delivery mounts Client Studio inline into target
  → Journey visible in-place
  → Presentation config may hide Hero and/or Footer to reduce chrome duplication
```

| Concern | Behaviour |
| --- | --- |
| Host chrome | Partner keeps page chrome; CS sits in a slot |
| Launcher | Not used for open (already visible) |
| Overlay | No |
| Auto-scroll | Off by default |
| Landing Anchor | Top of visible Journey (after optional Hero hide) |
| Close Action | Not applicable (no overlay session) |
| Hide Hero | **Configurable** (default recommendation: hide when partner already has object hero) |
| Hide Footer | **Configurable** (default recommendation: hide when partner footer exists below slot) |

**Inline Mode MUST NOT** invent a second Journey or strip Decision Terminal semantics. Hiding Hero/Footer is **presentation chrome**, not removal of Decision meaning.

### 2.6 Mode comparison matrix

| Dimension | Standalone | Launcher (default) | Inline |
| --- | --- | --- | --- |
| Entry | Page load | Launcher activate | Page load (already mounted) |
| Overlay | No | Yes | No |
| Host page under CS | N/A | Yes | Yes (around slot) |
| Auto-scroll | Optional / off | On → Social Proof | Off |
| Close | Optional | Required | N/A |
| Hide Hero/Footer | Rare | Rare | Common (config) |
| Partner default | No | **Yes** | No |

---

## 3. Builder Configuration Model

### 3.1 Builder does not configure Delivery Layer

**Builder** produces a declarative **`ExperiencePresentationConfig`** only.

| Builder does | Builder does not |
| --- | --- |
| Choose Experience Mode | Implement overlay / scroll lock |
| Declare Launcher metadata | Own Delivery lifecycle code |
| Declare chrome flags (Hero, Footer, Close) | Call Runtime domain APIs |
| Declare Auto Scroll / Reveal + Landing Anchor | Interpret House Package |
| Publish config for Hosts to consume | Branch Delivery internals |

**Delivery Layer** reads that config and **realizes** presentation according to Mode + Host capabilities.

```text
Builder
  → ExperiencePresentationConfig  (declarative)
        ↓
Delivery Layer
  → interprets config + Host capabilities
  → mounts / opens / closes Experience
```

### 3.2 Configuration group: Experience Mode

Builder exposes a single primary control:

```text
Experience Mode
  ○ Standalone
  ○ Launcher     ← default for partner deployments
  ○ Inline
```

Selecting a mode **reveals / enables** dependent presentation fields (same Studio; different declared chrome/entry).

### 3.3 ExperiencePresentationConfig (logical)

Logical model published by Builder (storage format TBD):

```text
ExperiencePresentationConfig {
  mode: "standalone" | "launcher" | "inline"

  launcher?: LauncherConfig

  chrome?: {
    showHero: boolean          // default true; Inline often false
    showFooter: boolean        // default true; Inline often false
    showCloseAction: boolean   // forced true in launcher; false in inline
  }

  entry?: {
    autoScroll: boolean           // default true in launcher; false otherwise
    autoScrollDurationMs: number  // default 500
    landingAnchorId: LandingAnchorId  // default "social-proof" in launcher
  }

  objectId: string
  assetBase?: string
}
```

### 3.4 Builder fields (product labels)

| Field | Type | Modes | Notes |
| --- | --- | --- | --- |
| **Experience Mode** | enum | all | Primary selector → `mode` |
| **Launcher** | object / picker | `launcher` | Type, placement, CTA copy, trigger binding |
| **Hero** | boolean `showHero` | mainly `inline` | Hide Studio Opening Hero when partner duplicates it |
| **Footer** | boolean `showFooter` | mainly `inline` | Hide Studio footer when partner layout duplicates it |
| **Auto Scroll** | boolean + duration | `launcher` | Optional Reveal mechanism (default on, ≈500 ms); architecture requires Reveal to Landing Anchor, not a specific scroll API |
| **Landing Anchor** | enum / id | `launcher` (+ optional others) | Default `social-proof` |
| **Close Action** | boolean / labels | `launcher` | Forced on in Launcher Mode |

Builder **MUST NOT** expose:

- Delivery implementation settings (z-index, focus-trap internals, scroll-lock strategy),
- Decision Journey reorder,
- Runtime Interpretation toggles,
- Alternate Studio “skins” that fork section trees,
- Domain rules (room selection, priority logic).

### 3.5 Mode → option matrix (Builder UX)

| Option | Standalone | Launcher | Inline |
| --- | --- | --- | --- |
| Launcher | hidden | **required** | hidden |
| Hero visibility | available | available (default on) | **recommended control** |
| Footer visibility | available | available (default on) | **recommended control** |
| Auto Scroll | available (default off) | **default on** | hidden / off |
| Landing Anchor | available (default `hero`) | **default `social-proof`** | default = first visible |
| Close Action | optional | **required on** | hidden / off |

---

## 3A. Launch Context

### 3A.1 Definition

**Launch Context** is technical and marketing **entry metadata** supplied by the Experience Host when starting an Experience.

It answers *from where / how the user entered*, not *what the object means*.

```text
Experience Host
    ↓
Launch Context
    ↓
Delivery Layer
    ↓
Runtime Session   (boundary attach — not domain input)
```

### 3A.2 Logical shape (illustrative)

```text
LaunchContext {
  hostKind: "partner-website" | "standalone-page" | "sales-terminal"
            | "operations-terminal" | "qr-entry" | "external-application" | …
  entryPoint?: string           // e.g. path, screen id
  launcherId?: string           // which Launcher fired
  launcherKind?: LauncherKind
  referrer?: string
  campaign?: {
    source?: string
    medium?: string
    campaign?: string
    content?: string
  }
  // extensible technical keys — never House facts or priorities
}
```

### 3A.3 Rules

1. Launch Context **MAY** travel with Delivery `open` / `mount`.
2. Delivery **MAY** attach Launch Context to the Session **envelope** (analytics, continuity, audit) at the boundary.
3. Launch Context is **NOT** part of domain Decision logic:
   - MUST NOT drive Interpretation of the House Package,
   - MUST NOT become Priority selection,
   - MUST NOT reorder Decision Journey,
   - MUST NOT invent RoomIds or Decision Moves.
4. Runtime remains **mode-agnostic** and **host-agnostic** regarding meaning; it may store opaque launch metadata for reproducibility/analytics only if RI-002 envelope allows — never as Interpretation input.
5. Future Hosts (Sales Terminal, QR, external apps) extend Launch Context without changing Client Studio or Runtime decision engines.

---

## 4. Landing Anchor

### 4.1 Definition

**Landing Anchor** = default viewport target of the Experience after **Launch**, established during **Reveal** ([ELA-01](./Experience-Launcher-Architecture.md)).

It does **not** remove content above the anchor from the Decision Journey. Hero may remain first in the render order while Social Proof (or another anchor) is the intentional first view.

### 4.2 Default

| Mode | Default `landingAnchorId` |
| --- | --- |
| `launcher` | `social-proof` |
| `standalone` | `hero` (top) |
| `inline` | first visible section after chrome filters |

### 4.3 Extensibility (no Runtime change)

Landing Anchor is a **presentation id** declared in `ExperiencePresentationConfig` and realized by Delivery + Client Studio shell during Reveal against known Experience anchors (`PILOT_SECTION_IDS` + `social-proof`).

Future Builder may offer additional Landing Anchors (Tour, Priority, AI Advisor, …) **without** Runtime or Decision Journey changes, as long as:

1. ids map to existing Experience anchors,
2. Journey order remains fixed,
3. Runtime is not asked to “start at section X” as a semantic Decision Move.

**Forbidden:** encoding Landing Anchor as a Decision Story step or Interpretation input.

---

## 5. Launcher Configuration

### 5.1 Allowed Launcher kinds

| Kind | Description |
| --- | --- |
| `hero` | Partner or Embed hero CTA region |
| `banner` | Horizontal / strip promotional entry |
| `cta-button` | Single button / link control |
| `product-card` | Card on listing / detail |
| `custom-trigger` | Partner-wired element calling Delivery `open` |

### 5.2 LauncherConfig (logical)

```text
LauncherConfig {
  kind: "hero" | "banner" | "cta-button" | "product-card" | "custom-trigger"
  label?: string                 // CTA copy
  placementHint?: string         // Builder placement metadata
  triggerSelector?: string       // for custom-trigger / host wiring
}
```

### 5.3 Hard rules

1. Launcher **contains no Runtime domain logic**.
2. Launcher may only call Delivery **open** with `ExperiencePresentationConfig` + `objectId` + optional **Launch Context**.
3. Launcher must not select rooms, set priorities, or interpret House Package.
4. Multiple Launchers on one Host page may open the **same** Experience config; Delivery owns single Active overlay policy (one Active Experience per page recommended for pilot).

---

## 6. Close Behaviour

Unified close contract (primarily Launcher Mode; optional Standalone):

```text
Close Client Studio
  → Delivery receives close
  → remove / hide overlay
  → unlock host scroll
  → restore host scroll position (captured at open)
  → restore focus to Launcher / documented fallback
  → end or suspend Session (Delivery policy; default: end Session for pilot)
```

**Studio chrome:**

- Left navigation: „Zavřít Client Studio“
- Footer: „Zavřít Client Studio“
- Recommended: Escape → same Delivery `close`

Inline Mode has no overlay close. Standalone may omit or map Close to leave-page.

---

## 7. Delivery Layer Responsibilities

Delivery Layer **owns** realizing Experience presence for a Host:

| Responsibility | Detail |
| --- | --- |
| Accept Host start | `open` / `mount` from Experience Host |
| Interpret presentation config | Read Builder-published `ExperiencePresentationConfig` — do not invent Builder UI |
| Create overlay | Launcher Mode only |
| Lifecycle | Launch → Reveal → Experience → Close |
| Mount Client Studio | Into overlay root or inline/standalone target |
| Host scroll lock / restore | Launcher Mode |
| Focus management | Open / Close |
| Pass presentation chrome | Derived flags into Studio bootstrap |
| Carry Launch Context | To Session envelope / analytics boundary — not as domain Interpretation |
| Create/attach Session | Via Runtime factory at boundary — **no domain interpretation** |
| Single Active policy | Prevent duplicate overlays (pilot) |

**Delivery MUST NOT:**

- Be configured as a Builder “Delivery settings” product surface,
- Interpret House Package facts,
- Compose Decision Story / Moves,
- Own Priority / Terminal semantics,
- Reorder Journey sections,
- Embed business rules in Launcher widgets.

Conceptual API surface (names TBD at implementation):

```text
Embed.open({
  objectId,
  assetBase?,
  presentation: ExperiencePresentationConfig,  // from Builder
  launchContext?: LaunchContext,               // from Host
})
Embed.close()
Embed.mount({ ... })  // Standalone / Inline compatibility
```

---

## 8. Runtime Responsibilities

Runtime **owns** meaning:

| Responsibility | Detail |
| --- | --- |
| Decision Session | Create/update via RI-002 |
| Commands | `SelectRoom`, priorities, … |
| Interpretation / Projection | Experience Context |
| Decision Layer | Story, Moves, Terminal, Outcome |

**Runtime MUST NOT:**

- Know Experience Mode as decision semantics,
- Know Experience Host kind as Interpretation input,
- Create overlays,
- Reveal Landing Anchor,
- Hide Hero/Footer,
- Handle partner header/footer,
- Treat Launch Context campaign/referrer fields as House facts,
- Implement Close as a Decision Move (unless a future ADR explicitly promotes lifecycle events).

Mode / Host differences stop at Delivery + Studio **shell chrome**. Domain path:

```text
Host + Launch Context + PresentationConfig
  → Delivery
  → createSession(housePackage) [+ optional opaque launch envelope]
  → Studio reads experience.context
  → UI
```

---

## 9. Client Studio presentation (no UI fork)

„Žádné větvení UI podle režimu“ means:

1. **One** section tree / Journey.
2. Mode-driven differences are **chrome flags** and **entry behaviour** supplied at bootstrap by Delivery (derived from `ExperiencePresentationConfig`):

```text
PresentationChrome {
  showHero: boolean
  showFooter: boolean
  showCloseAction: boolean
  entryLandingAnchorId?: string
  entryAutoScrollMs?: number
}
```

3. Components may conditionally **omit chrome** based on flags — they must not mount alternate Journey graphs.
4. Forbidden: `if (mode === "launcher") return <LauncherStudio/> else return <InlineStudio/>`.

---

## 10. End-to-end data flow

```text
Experience Host  (Partner Website | Standalone Page | Terminals | …)
        │  starts Experience + Launch Context
        ▼
Builder-published ExperiencePresentationConfig  (declarative only)
        │  consumed by Delivery (not “Builder configures Delivery”)
        ▼
Delivery Layer
  - interpret mode from presentation config
  - apply Host capabilities (overlay | inline | standalone)
  - open/close lifecycle
  - mount Studio + pass PresentationChrome
  - create Session at boundary
  - attach Launch Context to envelope / analytics (non-domain)
        │
        ▼
Client Studio (single implementation)
  - render Journey
  - apply chrome flags
  - entry scroll if configured
        │  dispatch / read context
        ▼
Runtime (sole semantic authority, mode-agnostic)
```

---

## 11. Responsibility summary

| Actor | Responsibility |
| --- | --- |
| **Experience Host** | Owns starting the Experience; supplies Launch Context |
| **Builder** | Declares `ExperiencePresentationConfig` only |
| **Delivery Layer** | Interprets config; realizes Mode; lifecycle; mounts Studio; Session boundary |
| **Client Studio** | One Journey UI; chrome flags; no domain authority |
| **Runtime** | Session meaning only; mode-/host-agnostic |

---

## 12. Acceptance (documentation)

EMB-01 is complete when:

1. Experience Host is defined with an initial catalogue and clear stack Host → Mode → Delivery → Studio.
2. All three modes have explicit behaviour.
3. Builder is limited to declarative `ExperiencePresentationConfig` (does not configure Delivery).
4. Launch Context is defined as Host → Delivery → Session envelope without domain pollution.
5. Runtime is explicitly mode-agnostic and host-agnostic for meaning.
6. Delivery responsibilities are unambiguous and exclude domain logic.
7. Document is usable as SSOT for implementation tickets.

**No UI or Runtime code in this PT.** Commit after acceptance.

---

## 13. Relationship to ELA-01

| Document | Owns |
| --- | --- |
| **ELA-01** | Launcher concept, Launcher Mode lifecycle detail, Landing Anchor, Launch → Reveal → Experience |
| **EMB-01** | Experience Host, full mode set, Builder schema, Launch Context, chrome flags |
| **EDL-01** | Delivery Layer lifecycle, states, Session bootstrap / Envelope, renderer independence |

Conflicts: prefer **EMB-01** for Host/Builder/mode matrix; prefer **ELA-01** for Launcher UX wording; prefer **EDL-01** for Delivery states and bootstrap. This trio is **Accepted** under the Experience Delivery architecture freeze.
