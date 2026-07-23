# Experience Launcher Architecture

**Status:** Accepted (Architecture SSOT — Experience Delivery architecture freeze)  
**Version:** 0.2  
**Date:** 2026-07-23  
**ID:** ELA-01  
**Layer:** Platform Architecture · Embed Delivery · Client Studio shell  
**SSOT for:** Experience Launcher, Launcher Mode lifecycle (Launch → Reveal → Experience), open/close contract, Landing Anchor  
**Not SSOT for:** Runtime Kernel semantics, Decision Journey section order, House Package schema, UI pixels, React components, Builder CMS schema fields beyond implications listed here

**Depends on:**

- [ADR-001 — Runtime Architecture](../adr/ADR-001-runtime-architecture.md)
- [ADR-014 — Experience Launcher](../adr/ADR-014-experience-launcher.md) (Accepted)
- [CORE-001 — Platform Architecture Overview](./CORE-001-Platform-Architecture-Overview.md)
- [Decision Experience Blueprint (DEB-01)](../../product/decision-experience/Decision-Experience-Blueprint.md)
- [RI-001 Runtime Kernel](../../04-reference-implementation/RI-001-Runtime-Kernel.md)
- [RI-002 Decision Session](../../04-reference-implementation/RI-002-Decision-Session.md)
- [GitHub Pages Distribution](../../releases/GitHub%20Pages%20Distribution.md)

**Product driver:** Pilot partner sites already own header, footer, navigation, and layout. Full inline Client Studio collides with host UX. Default entry must be **Launcher → fullscreen Experience**, not permanent inline CS.

**Companion SSOT:** [EMB-01 — Experience Modes & Builder Integration](./Experience-Modes-and-Builder-Integration.md) · [EDL-01 — Experience Delivery Layer](./Experience-Delivery-Layer.md).

---

## 1. Vision

### 1.1 Problem

Partners embed Embed Engine into pages that already have a complete chrome. Mounting the entire Client Studio **inline** as a permanent page region:

- fights host layout and scroll,
- duplicates navigation chrome,
- breaks partner branding continuity,
- makes “entering a decision experience” feel like a page redesign instead of a guided session.

### 1.2 Solution

Split **entry** from **experience**:

| Surface | Role |
| --- | --- |
| **Experience Launcher** | Host-page entry point (CTA / hero / card / banner). Not Client Studio. |
| **Client Studio (Experience)** | Full Decision Experience; presence depends on Experience Mode (see EMB-01). |

One Client Studio. Multiple **modes of presence** (`standalone` · `launcher` · `inline`). No second product.

### 1.3 Non-goals

- Redesigning Decision Journey section order.
- Changing Runtime authority or Interpretation.
- Building a second Client Studio app.
- Specifying visual design of partner Launchers.
- Implementing UI in this document.

---

## 2. Definitions

### 2.1 Experience Launcher

**Experience Launcher** is any host-owned or Embed-delivered **entry surface** that starts Client Studio in **Launcher Mode**.

Examples (non-exhaustive):

- Hero CTA (“Prozkoumat dům”)
- Banner / strip
- Product card
- Floating or sticky CTA
- Partner custom button wired to Embed open API

**Rules:**

1. Launcher **is not** part of Client Studio’s section tree.
2. Launcher **does not** own Decision Session semantics.
3. Launcher **may** pass mount options (`objectId`, `assetBase`, locale, …) into Delivery Layer.
4. Launcher **must not** duplicate Studio sections (no mini-Tour Runtime).

### 2.2 Client Studio Experience

The existing Client Studio application — same Decision Journey, same Runtime, same Projection Layer, same Terminal Framework.

In Launcher Mode it is presented as a **fullscreen Experience overlay** above the partner page.

### 2.3 Modes

| Mode | Presence | Host page | Typical use |
| --- | --- | --- | --- |
| **Standalone Client Studio** | CS owns the viewport (SPA / dedicated URL / Pages live) | N/A or minimal shell | Internal QA, demos, Gen1 freeze, `live.html` |
| **Launcher Mode** | CS opens on demand as overlay; host page remains underneath | Partner site with own chrome | **Default for partner pilot** |

Both modes use **one** Client Studio binary / Embed mount path. Mode is a **presentation & lifecycle** concern of Delivery + Studio shell — not a fork of Runtime.

---

## 3. Relationship: Launcher ↔ Client Studio

```text
Partner Page (host)
├── Host header / nav / footer / content
└── Experience Launcher  ──open──►  Client Studio Overlay (Launcher Mode)
                                      ├── Studio shell (incl. Close)
                                      ├── Decision Journey sections (unchanged order)
                                      └── Runtime Session (sole semantic authority)
```

| Concern | Owner |
| --- | --- |
| Host layout & scroll (under overlay) | Partner page |
| Entry CTA / Launcher UI | Partner or Embed Launcher kit (future) |
| Overlay open/close / focus trap / scroll lock | Embed Delivery + Client Studio shell |
| Decision Session / Interpretation / Experience Context | Runtime |
| Section order / Journey | Decision Experience product SSOT (DEB-01 / Gen1 structure) |

**Invariant:** Opening via Launcher must not create a second Runtime product or a second Journey.

---

## 4. Navigation Flow

### 4.1 High-level (UX)

```text
[Partner Page]
      │
      │  user activates Launcher
      ▼
[Launch]
      │  Experience becomes available (overlay + Session)
      ▼
[Reveal]
      │  viewport settles on Landing Anchor
      ▼
[Experience]
      │  user explores Decision Journey
      │  Close Client Studio
      ▼
[Partner Page — restore prior scroll]
```

Architectural UX phases: **Launch → Reveal → Experience** (then Close back to Host).  
Concrete mechanisms inside Reveal (e.g. smooth scroll) are implementation choices, not the architecture itself.

### 4.2 Decision Journey order (unchanged)

Launcher Mode **must not** reorder sections. Canonical journey remains:

```text
Opening (Hero + Social Proof)
  → Object / Property Explorer
  → Walkthrough / Tour (Spatial Terminal)
  → Priority
  → AI Advisor (if enabled)
  → Commercial / Audit
  → Decision Terminal (as defined by product)
```

Exact section IDs remain those of Client Studio (`PILOT_SECTION_IDS` and successors).  
**Entry path changes; Journey structure does not.**

### 4.3 Landing Anchor

**Landing Anchor** is the **default target point of the Experience viewport after Launch**, established during **Reveal**.

It is where the user’s first fully intentional view of the Experience rests — not necessarily the first rendered pixel of the document.

| Rule | Specification |
| --- | --- |
| Default Landing Anchor | **Social Proof** |
| Hero | Remains **part of** the Decision Journey (may sit above the Landing Anchor in the scroll stack). |
| Intent (pilot) | User enters into social validation context, not into Hero as the resting view. |
| Extensibility | Architecture **allows** other Landing Anchors later (e.g. Tour, Priority, AI Advisor) **without** changing Runtime or Decision Journey order. |
| Identity | Stable Experience anchor id (pilot default: `social-proof`). |

**Principle:** Client Studio SHALL NOT assume that the initial user viewport corresponds to the first rendered pixel of the Experience.  
Hero can remain the first rendered content while the Landing Anchor is Social Proof (or another anchor). Decision Journey is not disrupted.

Standalone Mode **may** use `hero` (document start) as Landing Anchor by default, unless product opts into Reveal toward another anchor.

---

## 5. Lifecycle — Launch → Reveal → Experience → Close

### 5.1 UX phases

```text
HostIdle
   │ Launch
   ▼
Launching        (Experience becomes available: overlay mounts; host scroll locked; focus enters Experience)
   │
   ▼
Revealing        (viewport settles on Landing Anchor)
   │
   ▼
Active           (Experience — user in Decision Journey; Runtime Session live)
   │ Close
   ▼
Closing          (overlay dismiss; focus returns to Launcher/host)
   │
   ▼
HostIdle         (host scroll position restored)
```

| UX phase | Meaning |
| --- | --- |
| **Launch** | User starts the Experience; Studio is present and interactive capability is established. |
| **Reveal** | Viewport is brought to the configured **Landing Anchor** so the intended first view is fully visible. |
| **Experience** | User navigates the Decision Journey. |
| **Close** | Experience dismisses; Host state restored. |

### 5.2 Launch

**Trigger:** Launcher activation (click / keyboard equivalent).

**Delivery MUST:**

1. Preserve host scroll position (`scrollX` / `scrollY` or equivalent).
2. Present Client Studio covering the **full viewport** (position fixed / equivalent; z-index above host chrome).
3. Leave the partner page **mounted underneath** (not navigated away).
4. Lock host body scroll while Active (prevent background scroll bleed).
5. Mount or show Client Studio via existing Embed Delivery path (`Embed.mount` or successor open API).
6. Ensure **one** Decision Session for the Experience (Runtime remains sole semantic authority).
7. Move focus into the Experience shell (accessibility).

**Delivery MUST NOT:**

- Rewrite partner DOM layout (header/footer).
- Start a parallel Decision Journey with different section order.
- Require partner to remove their chrome.

### 5.3 Reveal

After the Experience is available (content paintable):

1. Resolve the configured **Landing Anchor** (default: Social Proof).
2. Bring that anchor into the intentional first viewport (fully visible).
3. Transition `Revealing → Active` when Reveal completes (or on timeout fallback).

**Implementation note (not architectural requirement):** one valid Reveal mechanism is a smooth scroll of the Studio’s **internal** scroll container lasting ≈ **0.5 s**. Other Reveal techniques (instant jump, shared-element transition, delayed settle) remain allowed if they achieve the same UX outcome: Landing Anchor as the first intentional view.

Hero may remain partially visible above the Landing Anchor; it is **not** required to be the resting viewport.

### 5.4 Experience (Active)

- User navigates Decision Journey normally (sidebar, in-page scroll, Terminal, etc.).
- Runtime commands unchanged (`SelectRoom`, priorities, …).
- Projection Layer / Experience Context unchanged.
- Escape / Close affordances available (see §5.5).

### 5.5 Close

**Affordances (required in Launcher Mode):**

- Primary: **„Zavřít Client Studio“** in **left navigation**
- Secondary: **„Zavřít Client Studio“** in **footer**
- Recommended: Escape key (same close path)

**On close, Delivery MUST:**

1. Hide/unmount Experience overlay.
2. Unlock host scroll.
3. Restore host scroll position captured at Open.
4. Return focus to the Launcher control that opened the Experience (or a documented fallback).
5. End or suspend the Session per Delivery policy (default recommendation: **end Session** on close for pilot simplicity; persistence is a future Identity concern — out of scope here).

**Close MUST NOT** mutate Decision Journey structure for the next open.

---

## 6. Interaction Diagram

```text
┌──────────────────────┐         open()          ┌────────────────────────────┐
│  Experience Launcher │ ─────────────────────► │  Embed Delivery Layer      │
│  (host page)         │                         │  (mount / overlay chrome)  │
└──────────────────────┘                         └─────────────┬──────────────┘
                                                               │
                                                               ▼
                                                 ┌────────────────────────────┐
                                                 │  Client Studio Shell       │
                                                 │  + Close actions           │
                                                 └─────────────┬──────────────┘
                                                               │
                                               getExperience / dispatch
                                                               │
                                                               ▼
                                                 ┌────────────────────────────┐
                                                 │  Decision Session Runtime  │
                                                 │  (sole semantic authority) │
                                                 └─────────────┬──────────────┘
                                                               │
                                                               ▼
                                                 ┌────────────────────────────┐
                                                 │  Projection → Experience   │
                                                 │  Context → UI sections     │
                                                 └────────────────────────────┘

Close path (reverse): Shell Close → Delivery unmount → restore host scroll → Launcher focus
```

**Boundary rules:**

- Launcher never calls Runtime commands directly except via Delivery open (which may create Session).
- SVG / Room / Priority interactions remain Studio → Runtime (ADR-013).
- Terminal Framework remains inside Experience, not on the partner page.

---

## 7. Mode comparison

| Dimension | Standalone | Launcher Mode |
| --- | --- | --- |
| Host page | Studio is the page | Partner page remains |
| Entry | URL / direct mount | Launcher CTA |
| Viewport | Normal document | Fullscreen overlay |
| Host scroll | N/A | Locked while Active; restored on Close |
| Close action | Optional / navigate away | **Required** (nav + footer) |
| Landing Anchor (default) | Document start (`hero`) | **Social Proof** after Reveal |
| Runtime | Same | Same |
| Decision Journey | Same | Same |
| Default for partners | No | **Yes** |

---

## 8. Builder Implications

*(Implications only — no Builder implementation in this PT.)*

| Topic | Implication |
| --- | --- |
| Placement | Builder configures **where** Launchers appear on partner templates (hero, card, banner), not a second Studio. |
| Object binding | Launcher binds `objectId` / package reference used at Launch. |
| Mode flag | Sites default to Launcher Mode; Standalone is explicit (preview / full-page). |
| Copy | Launcher CTA label is Builder/content; Close label is Studio chrome (Czech pilot: „Zavřít Client Studio“). |
| Analytics | Launch / Close are Experience lifecycle events; distinct from in-Journey signals. |
| Landing Anchor | Declared in presentation config; default Social Proof in Launcher Mode; changeable later without Runtime change. |
| Forbidden | Builder must not invent alternate Journey orders per Launcher. |

---

## 9. Runtime Implications

| Topic | Implication |
| --- | --- |
| Authority | Runtime remains the **only** semantic authority (ADR-001). |
| Session | One Session per Active Experience instance (RI-002). |
| Launch | Delivery creates/attaches Session; Launcher does not interpret House Package. |
| Close | Delivery ends/suspends Session; no Journey rewrite. |
| Projection | Unchanged; UI reads Experience Context only. |
| Commands | No new decision commands required for Launch/Close (shell/lifecycle only). |
| Optional future | `ExperienceOpened` / `ExperienceClosed` as **analytics or session envelope** events — must not become Decision Story Moves without a separate ADR. |

**Runtime MUST NOT** know about partner header/footer, overlay z-index, or Landing Anchor Reveal pixels.

---

## 10. Delivery Layer Implications

Extend Embed Delivery conceptually (API naming TBD at implementation):

| Capability | Description |
| --- | --- |
| `mount` / `open` | Launch Experience in Standalone or Launcher Mode |
| `close` / `unmount` | Tear down overlay; restore host |
| `mode: "standalone" \| "launcher"` | Presentation mode |
| `landingAnchor: "social-proof"` | Launcher Mode default Landing Anchor |
| Host scroll capture/restore | Required for Launcher Mode |
| Focus management | Launch → Experience; Close → Launcher |

Backward compatibility: existing `Embed.mount({ target, objectId, assetBase })` Standalone behavior remains valid for QA/Pages.

---

## 11. Client Studio Shell Implications

Launcher Mode requires shell chrome additions (implementation later):

1. Close control in **left navigation**.
2. Close control in **footer**.
3. Ability to **Reveal** a configured **Landing Anchor** (mechanism TBD; smooth scroll is one option).
4. Stable Landing Anchor ids (pilot default: Social Proof / `social-proof`).
5. No change to section **order** or Decision Terminal semantics.
6. MUST NOT assume the initial viewport equals the first rendered pixel.

Standalone Mode may hide Close or map it to navigate-away — product choice; Launcher Mode Close is mandatory.

---

## 12. Consistency checklist

| Layer | Consistency |
| --- | --- |
| Runtime | No semantic fork; Session unchanged |
| Projection Layer | Still Experience Context → UI |
| Terminal Framework | Remains inside Experience |
| Decision Journey | Order preserved; entry via Launcher only |
| Partner sites | No requirement to remove header/footer/layout |
| Landing Anchor | Default Social Proof after Reveal; extensible without Runtime change |

---

## 13. Out of scope (follow-ups)

- Visual design of Launchers
- Identity / resume Session after Close
- Deep-linking to mid-Journey sections from Launcher
- Multi-object Launcher carousels
- Implementation tickets / UI code

---

## 14. Acceptance (architecture)

This architecture is complete when it:

1. Defines Launcher ↔ Client Studio relationship unambiguously.
2. Describes **Launch → Reveal → Experience → Close** lifecycle (UX terms).
3. Defines **Landing Anchor** (default Social Proof; future anchors without Runtime/Journey change).
4. Enables partner use without host chrome removal.
5. Stays consistent with Runtime, Projection, and Terminal Framework.
6. Preserves Standalone compatibility and a single Client Studio.

**Implementation starts after this Accepted SSOT; UI/code remains a separate PT.**
