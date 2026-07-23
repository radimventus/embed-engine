# Launcher Runtime Integration Specification

**Status:** Accepted (Implementation Specification — Implementation Specification Freeze)  
**Version:** 0.1  
**Date:** 2026-07-23  
**ID:** LRI-01  
**Layer:** Platform Architecture · Embed Delivery · Implementation Specification  
**SSOT for:** Launcher Mode bootstrap sequence, Reveal/Close workflows, Session bootstrap object ownership, failure workflows, reference acceptance scenario  
**Not SSOT for:** TypeScript APIs, React/DOM details, animation libraries, Runtime algorithms, Decision Journey content, new architectural layers

**Authority (Accepted — do not invent beyond these):**

- [ADR-014](../adr/ADR-014-experience-launcher.md) · [ELA-01](./Experience-Launcher-Architecture.md)
- [ADR-015](../adr/ADR-015-experience-modes-builder.md) · [EMB-01](./Experience-Modes-and-Builder-Integration.md)
- [ADR-016](../adr/ADR-016-experience-delivery-layer.md) · [EDL-01](./Experience-Delivery-Layer.md)

**Message contract companion (Accepted):** [EDIC-01](./Experience-Delivery-Implementation-Contract.md) — Launch/Close/Events shapes only; LRI-01 does not redefine them.

**Governing ADR (contract):** [ADR-017](../adr/ADR-017-experience-delivery-implementation-contract.md) (Accepted)

**Principle:** This document is the **direct input to an implementation PT**. It sequences already-accepted architecture. It introduces **no** new layers, Modes, or domain concepts.

**Scope of this specification:** **Launcher Mode** on an Experience Host (partner website default). Standalone / Inline follow the same Delivery lifecycle with Mode-specific Reveal/Close deltas already defined in EMB-01 — not re-specified here except where needed for contrast.

---

## 1. Purpose

After ADR-014…016, implementers still need one ordered integration story:

```text
User Click → Launcher → Delivery → Runtime Bootstrap → Client Studio Mount → Reveal → Experience Active
```

and the reverse Close path — without further architectural debate.

**LRI-01** answers: who does what, in what order, what objects exist, what happens on failure, and what “done” looks like for QA.

---

## 2. Actors and ownership (unchanged)

| Actor | Creates / owns | Does not |
| --- | --- | --- |
| **Experience Host** | Launch intent, Launch Context, host page chrome | Decision Session, Reveal |
| **Experience Launcher** | Entry CTA / trigger; may gather mount options | Overlay policy, Runtime domain commands |
| **Delivery Layer** | Delivery surface, lifecycle, Delivery Envelope, Host lock/restore, Reveal coordination | Domain Interpretation, Journey order |
| **Client Studio** | Journey UI, Close chrome (Launcher Mode), Landing Anchor cooperation | Overlay ownership, Session factory (when Host-launched) |
| **Runtime** | Runtime Session + Decision Session (RI-002) | Mode / Host / overlay awareness as meaning |

---

## 3. Launcher Bootstrap

### 3.1 End-to-end flow

```text
User Click
   ↓
Launcher
   ↓
Delivery Layer
   ↓
Runtime Bootstrap
   ↓
Client Studio Mount
   ↓
Reveal
   ↓
Experience Active
```

### 3.2 Step responsibilities

| # | Step | Owner | Responsibility |
| --- | --- | --- | --- |
| 1 | **User Click** | User / a11y activation | Activates Launcher control (click or keyboard equivalent). |
| 2 | **Launcher** | Experience Launcher on Host | Emits **Launch Request** to Delivery with Object ID, resolved/merged presentation intent, and Launch Context (hostKind, entryPoint, launcherId, referrer, campaign as available). Does **not** mount overlay itself. |
| 3 | **Delivery — accept & prepare** | Delivery | Emit LaunchRequested / LaunchStarted (EDIC-01). Resolve `ExperiencePresentationConfig` (Mode = `launcher`). Capture Host scroll & focus. Prepare fullscreen overlay surface. Lock Host scroll. Enter Preparing. |
| 4 | **Runtime Bootstrap** | Delivery → Runtime | Assemble **Delivery Envelope**. Resolve House Package by Object ID (loader — no meaning). Create **Runtime Session** / Decision Session at Delivery boundary. Attach Launch Context as opaque envelope only. |
| 5 | **Client Studio Mount** | Delivery → Studio | Attach Client Studio to overlay surface with PresentationChrome (Close required; Landing Anchor id; chrome flags). Emit Mounted. Studio receives **mount ready** + **runtime ready**. |
| 6 | **Reveal** | Delivery + Studio | Resolve Landing Anchor (default `social-proof`). Emit RevealStarted. Settle viewport so Landing Anchor is the intentional first view. Emit RevealCompleted. Studio receives **viewport ready**. |
| 7 | **Experience Active** | Delivery + Studio + Runtime | Emit ExperienceActive. User explores Decision Journey. Delivery keeps Host locked. Runtime remains sole semantic authority. |

**Ordering invariants:**

1. Runtime Session exists **before or at** Mount completion — never after ExperienceActive without a Session.
2. Reveal starts only after Mounted (content paintable / Session available).
3. ExperienceActive requires RevealCompleted **or** documented Mode skip (Launcher Mode does **not** skip Reveal by default).
4. At most one Active Experience per Delivery instance (EDL-01 pilot rule).

---

## 4. Delivery Sequence (detailed)

Happy path — Launcher Mode. Event names align with EDIC-01; lifecycle states with EDL-01.

```text
User          Launcher         Delivery              Runtime           Client Studio
 │               │                │                     │                    │
 │ activate      │                │                     │                    │
 │──────────────►│                │                     │                    │
 │               │ Launch Request │                     │                    │
 │               │───────────────►│                     │                    │
 │               │                │ LaunchRequested     │                    │
 │               │                │ LaunchStarted       │                    │
 │               │                │                     │                    │
 │               │                │ resolve config      │                    │
 │               │                │ capture Host scroll/focus                 │
 │               │                │ prepare overlay     │                    │
 │               │                │ lock Host scroll    │                    │
 │               │                │                     │                    │
 │               │                │ Delivery Envelope   │                    │
 │               │                │ create Session ────►│                    │
 │               │                │◄── Session ready ───│                    │
 │               │                │                     │                    │
 │               │                │ mount + chrome ─────────────────────────►│
 │               │                │ Mounted             │                    │
 │               │                │ mount ready / runtime ready              │
 │               │                │                     │                    │
 │               │                │ RevealStarted       │                    │
 │               │                │ reveal Landing Anchor ──────────────────►│
 │               │                │ RevealCompleted     │                    │
 │               │                │ viewport ready      │                    │
 │               │                │ ExperienceActive    │                    │
 │               │                │                     │                    │
 │◄──────────────│────────────────│─── Experience usable ───────────────────│
 │ explores Journey / dispatch via Studio ─────────────────────────────────►│
 │               │                │                     │◄── commands ───────│
 │               │                │                     │── experience ─────►│
```

### 4.1 Operation order (normative for implementers)

1. Accept Launch Request  
2. Resolve Configuration (`launcher` Mode + Landing Anchor + chrome)  
3. Capture Host scroll / focus  
4. Prepare overlay surface  
5. Lock Host scroll  
6. Build Delivery Envelope  
7. Create Runtime / Decision Session  
8. Mount Client Studio  
9. Signal mount ready + runtime ready  
10. Start Reveal → Landing Anchor  
11. Complete Reveal → viewport ready  
12. Enter Active / ExperienceActive  

No step after (7) may invent domain meaning. No step before (8) may claim ExperienceActive.

---

## 5. Reveal Specification

Scope: **Launcher Mode** defaults (ADR-014 / ELA-01 / EMB-01).

### 5.1 Landing Anchor resolution

| Rule | Specification |
| --- | --- |
| Source of truth | Resolved `ExperiencePresentationConfig.landingAnchor` (or equivalent) interpreted by Delivery |
| Default (Launcher) | **`social-proof`** |
| Fallback if missing | Delivery applies Mode default (`social-proof`); does not invent Journey reorder |
| Extensibility | Other anchors (Tour, Priority, …) allowed later **without** Runtime or Journey order change |
| Hero | Remains in Journey document order; **not** required to be resting viewport |

**Resolution algorithm (architectural):**

1. Read Landing Anchor id from presentation config.  
2. If absent → Mode default (`social-proof` for launcher).  
3. Resolve id to the corresponding Experience section / anchor inside mounted Studio.  
4. If anchor cannot be found → follow Reveal failure workflow (§8).

### 5.2 Reveal timing

| Concern | Specification |
| --- | --- |
| When Reveal may start | After Mounted (Session ready + Studio attached + content paintable) |
| When Reveal completes | Landing Anchor is the **intentional first viewport** (fully visible as first resting view) |
| Duration | Architecture does **not** mandate a duration; ≈0.5 s smooth settle is one allowed implementation (ELA-01) |
| Timeout | Implementations SHOULD bound Reveal; on timeout use degraded Active or Close per §8 |

### 5.3 Viewport behaviour

1. Initial user viewport **MUST NOT** be assumed equal to the first rendered pixel (ADR-014).  
2. After RevealCompleted, Social Proof (default) is the resting view; Hero may sit above in the scroll stack.  
3. User may later scroll to Hero or any Journey section — Reveal only sets the **entry** viewport.  
4. Decision Journey order is unchanged.

### 5.4 Scroll restoration (Host)

| Phase | Host scroll |
| --- | --- |
| At Launch / Prepare | Capture Host scroll position |
| While Active | Host scroll **locked** (no background bleed) |
| On Close / Return Host | Restore captured Host scroll |

Studio internal scroll is independent of Host scroll. Reveal moves the **Experience** viewport, not the Host page underneath.

### 5.5 Animation boundary

| Inside architecture | Outside architecture (implementation choice) |
| --- | --- |
| Reveal is a **UX phase** with start/complete semantics | CSS/JS scroll API, shared-element transition, instant jump |
| Outcome: Landing Anchor as first intentional view | Exact easing, duration, reduced-motion preference handling |
| Events: RevealStarted / RevealCompleted | Pixel-perfect animation code |

**Rule:** Changing animation technique must not change Launch → Reveal → Experience meaning.

---

## 6. Session Bootstrap

### 6.1 Object flow

```text
Launch Context                 ← created by Experience Host / Launcher
        ↓
Delivery Envelope              ← assembled by Delivery Layer
        ↓
Runtime Session                ← created by Delivery calling Runtime boundary
        ↓
Decision Session               ← owned inside Runtime (RI-002)
```

### 6.2 Who creates what

| Object | Created by | Consumed by | Notes |
| --- | --- | --- | --- |
| **Launch Context** | Host / Launcher | Delivery (into Envelope) | Non-domain entry metadata |
| **ExperiencePresentationConfig** | Builder (publish); Delivery resolves at Launch | Delivery | Declarative only |
| **Delivery Envelope** | Delivery | Runtime Session factory | Object binding + presentation snapshot + opaque Launch Context + technical context |
| **House Package** | Loader / fixture by Object ID | Runtime | Facts identity — Delivery does not compose meaning |
| **Runtime Session** | Runtime (invoked at Delivery boundary) | Client Studio | Technical session handle |
| **Decision Session** | Runtime (RI-002) | Runtime / Studio via Experience projection | Sole semantic authority |

### 6.3 Envelope contents (reminder — EDL-01)

Allowed: Object ID / package ref, presentation snapshot (Mode, chrome, Landing Anchor id), opaque Launch Context, clock, asset base.  
Forbidden: Priorities, Story, Moves, interpreted House meaning.

### 6.4 Pilot Session policy on Close

Default: **end Session** on Dispose (ELA-01 / EDL-01). Suspend/resume across Close is out of scope until an Identity ADR.

---

## 7. Close Specification

### 7.1 Flow

```text
Close Request
   ↓
Freeze Runtime
   ↓
Dispose Delivery
   ↓
Restore Host
   ↓
Resume Host
```

### 7.2 Step responsibilities

| # | Step | Owner | Responsibility |
| --- | --- | --- | --- |
| 1 | **Close Request** | Studio chrome or Host | User: „Zavřít Client Studio“ (left nav + footer; Escape recommended). Host may also request Close. Emit CloseRequested. |
| 2 | **Freeze Runtime** | Delivery → Runtime | Stop accepting new domain work for this Experience; prepare Session for end. Pilot: **end Session** (no orphaned Session after Dispose). |
| 3 | **Dispose Delivery** | Delivery | Unmount Client Studio; release overlay surface; emit Disposed. Delivery state → Disposed. |
| 4 | **Restore Host** | Delivery | Unlock Host scroll; restore captured scroll position; return focus to Launcher control (or documented fallback). |
| 5 | **Resume Host** | Host | Host page is interactive again. Emit ReturnedToHost. Delivery → Idle. |

### 7.3 Close affordances (Launcher Mode — required)

- Left navigation: „Zavřít Client Studio“  
- Footer: „Zavřít Client Studio“  
- Recommended: Escape → same Close Request path  

### 7.4 Close must not

- Reorder Decision Journey for the next Launch  
- Leave Host scroll locked  
- Leave overlay surface attached  
- Leave an Active semantic Session without Dispose policy (pilot: Session ends)

---

## 8. Failure Behaviour (workflows only)

| Scenario | Expected workflow |
| --- | --- |
| **Bootstrap failure** (invalid Launch Request, missing Object ID, config resolve fails) | Delivery rejects Launch; no overlay Active; no Session; remain/return Idle; Host may show Host-level error and retry. No Mounted / ExperienceActive. |
| **Runtime initialization failure** (package load fail, Session create fail) | Abort Mount; Dispose any partial surface; unlock Host if locked; end any partial Session; no ExperienceActive; report failure to Host; Idle. |
| **Reveal interruption** (anchor missing, Reveal timeout, user Close during Reveal) | Prefer: degrade to Active at safe viewport (document start) **or** if product requires Landing Anchor, Close+Dispose. If user Close during Reveal → enter Close path. Never leave Host permanently locked. |
| **Close interruption** (unmount error, focus restore fail) | Best-effort: force unmount, unlock Host scroll, force Session end, emit Disposed; attempt ReturnedToHost; log failure. Host remount/reload is last resort. |
| **Host unavailable** (Host page torn down, target gone mid-flight) | Delivery aborts lifecycle; Dispose best-effort; end Session; no further Host restore attempts; remain Idle / instance dead. Do not retry forever. |

**Invariant:** In-Journey domain errors (command rejection, empty projection) are Runtime/Studio concerns — not Delivery bootstrap failures — unless they force Close.

---

## 9. Acceptance Scenario (reference)

**Single reference scenario** for implementation PT and QA:

> **Partner Website → Hero → Open Client Studio → Reveal → Social Proof → Experience → Close → Return to Host**

### 9.1 Preconditions

1. Partner website Host is loaded with its own header/footer/nav.  
2. Experience Launcher is present (e.g. Hero CTA „Prozkoumat dům“ or equivalent).  
3. Published presentation config: Mode = `launcher`, Landing Anchor = `social-proof` (or Mode default).  
4. Valid Object ID resolvable to a House Package.  
5. Delivery Layer available (Embed open path).

### 9.2 Steps

| Step | Actor | Action | Expected observable |
| --- | --- | --- | --- |
| A | User | On Partner Website, activates Launcher from Hero (or Hero-adjacent CTA) | Launch Request issued |
| B | Delivery | Bootstrap + Mount | Overlay covers viewport; Host remains underneath; Host scroll locked |
| C | Delivery + Studio | Reveal | Viewport settles on **Social Proof** as intentional first view; Hero may remain above in stack |
| D | User | Explores Experience (scroll / nav / at least one Runtime interaction optional for smoke) | ExperienceActive; Journey usable; Runtime authority intact |
| E | User | Activates „Zavřít Client Studio“ | Close Request |
| F | Delivery | Dispose + Restore | Overlay gone; Host scroll restored; focus returned; Host interactive |

### 9.3 Pass criteria

1. Full lifecycle A→F completes without stuck overlay or locked Host scroll.  
2. First intentional view after open is Social Proof (not assumed Hero resting view).  
3. Decision Journey section order unchanged.  
4. Close from nav **or** footer both return to Host successfully.  
5. Second open of the same Launcher starts a clean Launch (no stale overlay/Session from pilot policy).

### 9.4 Out of scope for this scenario

- Inline Mode permanence  
- Standalone URL entry  
- Session persistence across Close  
- Campaign analytics correctness (Launch Context may be present but not asserted here)

---

## 10. Mapping to accepted documents

| Topic | Authority |
| --- | --- |
| Launch → Reveal → Experience meaning | ADR-014 / ELA-01 |
| Mode defaults, Builder config, Launch Context | ADR-015 / EMB-01 |
| Delivery phases, Envelope, states | ADR-016 / EDL-01 |
| Launch/Close/Event message contract | EDIC-01 (companion) |
| Decision Session semantics | RI-002 / ADR-001 |

LRI-01 **sequences** these; it does not replace them.

---

## 11. Non-goals

- New architectural layers or Modes  
- New ADR  
- Framework- or DOM-specific APIs  
- Production code  
- Changing Runtime semantic authority  
- Redesigning Decision Journey  

---

## 12. Acceptance of this specification

LRI-01 is complete when:

1. An implementer can build Launcher Mode integration **without further architectural decisions**.  
2. Bootstrap, Reveal, and Close have unambiguous ordered workflows.  
3. Session object ownership is explicit.  
4. The Partner Website acceptance scenario covers the full lifecycle.  
5. No new architectural concepts were introduced.

**No code in this PT.** This document is **Accepted** as part of the Implementation Specification Freeze.
