# Experience Delivery Layer Architecture

**Status:** Accepted (Architecture SSOT — Experience Delivery architecture freeze)  
**Version:** 0.1  
**Date:** 2026-07-23  
**ID:** EDL-01  
**Layer:** Platform Architecture · Embed Delivery  
**SSOT for:** Experience Delivery Layer responsibilities, delivery lifecycle, delivery state model, Session bootstrap / Delivery Envelope, renderer independence, Host compatibility  
**Not SSOT for:** Runtime Kernel algorithms, Decision Journey content, Builder UI, Client Studio section design, concrete Embed API names (implementation), React/DOM details

**Depends on:**

- [ELA-01 — Experience Launcher Architecture](./Experience-Launcher-Architecture.md) (Accepted)
- [EMB-01 — Experience Modes & Builder Integration](./Experience-Modes-and-Builder-Integration.md) (Accepted)
- [ADR-014](../adr/ADR-014-experience-launcher.md) · [ADR-015](../adr/ADR-015-experience-modes-builder.md) · [ADR-016](../adr/ADR-016-experience-delivery-layer.md) (Accepted)
- [ADR-001 — Runtime Architecture](../adr/ADR-001-runtime-architecture.md)
- [RI-001](../../04-reference-implementation/RI-001-Runtime-Kernel.md) · [RI-002](../../04-reference-implementation/RI-002-Decision-Session.md)

**Principle:** Delivery **delivers** the Experience. Runtime **means** the Experience. Builder **declares** presentation. Host **starts** the Experience.

**Companion contract:** [EDIC-01 — Experience Delivery Implementation Contract](./Experience-Delivery-Implementation-Contract.md) (Accepted — Launch/Close/Events).  
**Companion impl. spec:** [LRI-01 — Launcher Runtime Integration](./Launcher-Runtime-Integration-Specification.md) (Accepted — ordered bootstrap / Reveal / Close for Launcher Mode).

---

## 1. Purpose

ELA-01 defines how users **enter** Client Studio (Launcher, Launch → Reveal → Experience).  
EMB-01 defines **Experience Host**, **Modes**, Builder `ExperiencePresentationConfig`, and **Launch Context**.

**EDL-01** defines the missing middle: the **Experience Delivery Layer** that physically delivers Client Studio to the user — without owning Decision semantics.

---

## 2. Definition — Experience Delivery Layer

### 2.1 What it is

**Experience Delivery Layer** (Delivery) is the platform subsystem that:

1. accepts a start request from an **Experience Host**,
2. resolves declarative presentation configuration,
3. prepares the delivery surface (overlay, inline slot, or full page),
4. mounts **one** Client Studio Experience,
5. performs **Reveal** to the **Landing Anchor**,
6. keeps the Experience **Active**,
7. handles **Close** and disposal,
8. returns control to the Host,
9. bootstraps a **Runtime Session** at the boundary via a **Delivery Envelope**.

Delivery ensures the Experience is **present and operable**. It does **not** decide what the object means.

### 2.2 What it owns

| Concern | Delivery |
| --- | --- |
| Mount Client Studio | Yes |
| Fullscreen overlay (Launcher Mode) | Yes |
| Inline mount (Inline Mode) | Yes |
| Standalone page mount | Yes |
| Viewport / focus management | Yes |
| Host scroll lock / restore | Yes (where Mode requires) |
| Launch → Reveal → Active → Close lifecycle | Yes |
| Pass Launch Context | Yes (to envelope / analytics boundary) |
| Create Runtime Session envelope | Yes (boundary bootstrap) |
| Interpret `ExperiencePresentationConfig` | Yes |
| Domain Interpretation / Story / Moves / Terminal | **No** |
| House Package business meaning | **No** |
| Builder CMS UI | **No** |

### 2.3 Hard prohibitions

Delivery **MUST NOT**:

- contain domain Decision logic,
- interpret House Package facts for meaning,
- compose Decision Story or Moves,
- select rooms or priorities,
- reorder Decision Journey,
- fork Client Studio by Mode or Host,
- assume a specific UI renderer (see §7).

---

## 3. Boundary diagram

```text
┌─────────────────────────────────────────────────────────────┐
│ Experience Host                                             │
│  Partner Website | Standalone Page | Sales Terminal | …     │
│  owns: start trigger, Launch Context, return surface        │
└────────────────────────────┬────────────────────────────────┘
                             │ launch / close request
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ Experience Delivery Layer                                   │
│  owns: mount, overlay/inline/standalone surface,            │
│        viewport, scroll lock, lifecycle, Reveal,            │
│        PresentationChrome, Delivery Envelope                │
│  reads: ExperiencePresentationConfig (from Builder publish) │
└────────────────────────────┬────────────────────────────────┘
                             │ mounts + chrome flags
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ Client Studio (single implementation)                       │
│  owns: Decision Journey UI, chrome omit flags,              │
│        Landing Anchor Reveal cooperation                    │
└────────────────────────────┬────────────────────────────────┘
                             │ getExperience / dispatch
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ Runtime (sole semantic authority)                           │
│  owns: Decision Session, Interpretation, Projection,        │
│        Decision Layer (Story / Moves / Terminal / Outcome)  │
└─────────────────────────────────────────────────────────────┘
```

```text
Builder ──publishes──► ExperiencePresentationConfig
                              │
                              ▼
                         Delivery (interprets)
```

Builder does **not** configure Delivery internals. Delivery **interprets** declarative config.

---

## 4. Layer responsibilities

| Layer | Responsibility | Must not |
| --- | --- | --- |
| **Experience Host** | Start/stop intent; supply Launch Context; own surrounding product chrome | Call Runtime domain commands; invent Studio forks |
| **Builder** | Declare `ExperiencePresentationConfig` | Configure Delivery implementation; own domain logic |
| **Delivery Layer** | Deliver Experience; lifecycle; mount; envelope; Reveal coordination | Domain Interpretation; Journey reorder |
| **Client Studio** | One Journey UI; apply PresentationChrome | Own Session semantics; create overlay policy |
| **Runtime** | Sole semantic authority for Session | Know Host chrome, overlay, Mode as meaning |

---

## 5. Delivery lifecycle

### 5.1 Architectural phases (UX / platform)

Lifecycle is **architectural**, not a prescription of DOM APIs or animation libraries.

```text
Launch
  ↓
Resolve Configuration
  ↓
Prepare Delivery
  ↓
Mount Experience
  ↓
Reveal
  ↓
Active Experience
  ↓
Close
  ↓
Dispose
  ↓
Return Host
```

| Phase | Intent |
| --- | --- |
| **Launch** | Host requests an Experience; Delivery accepts start + Launch Context + object binding. |
| **Resolve Configuration** | Load/merge `ExperiencePresentationConfig` (Mode, chrome, Landing Anchor, …). |
| **Prepare Delivery** | Allocate delivery surface (overlay root, inline target, or page root); capture Host scroll/focus as needed. |
| **Mount Experience** | Attach Client Studio to the surface; bootstrap Runtime Session via Delivery Envelope. |
| **Reveal** | Settle viewport on **Landing Anchor** (default Social Proof in Launcher Mode). Mechanism is implementation (smooth scroll is one option — ELA-01). |
| **Active Experience** | User explores Decision Journey; Delivery keeps Host locked/safe as Mode requires. |
| **Close** | User or Host requests dismissal; Delivery begins teardown. |
| **Dispose** | Unmount Studio; end/suspend Session per policy; release surface. |
| **Return Host** | Restore Host scroll/focus; Host resumes. |

### 5.2 Architecture vs implementation

| Architecture | Implementation (examples — not mandated) |
| --- | --- |
| Mount Experience | `createRoot`, WebView, native view controller, SSR hydrate |
| Overlay | `position: fixed` portal, native modal, iframe shell |
| Reveal | smooth scroll ≈0.5s, instant jump, shared transition |
| Scroll lock | `overflow: hidden`, touch handlers, native scroll disable |
| Dispose | React unmount, dispose Runtime, remove portal node |

Changing implementation must not change lifecycle **meaning**.

---

## 6. Delivery state model

Minimal architectural states (names may map 1:1 to code enums later):

```text
Idle
  → Preparing          (Launch + Resolve Configuration + Prepare Delivery)
  → Mounted            (Experience attached; Session bootstrapped)
  → Revealing          (Landing Anchor settle in progress)
  → Active             (user in Experience)
  → Closing            (Close accepted; teardown in progress)
  → Disposed           (resources released)
  → Idle               (after Return Host)
```

| State | Meaning |
| --- | --- |
| **Idle** | No Active Experience for this Delivery instance |
| **Preparing** | Resolving config / preparing surface |
| **Mounted** | Studio mounted; Session exists; Reveal not finished |
| **Revealing** | Viewport moving to Landing Anchor |
| **Active** | Experience usable |
| **Closing** | Teardown started |
| **Disposed** | Mount and Session cleaned; ready to return Host |

**Rules:**

1. At most **one Active** Experience per Delivery instance (pilot recommendation; multi-instance is ED-EMB-01 / future ADR).
2. Runtime Session must not outlive Dispose unless an explicit suspend/resume Identity ADR says otherwise (pilot default: end Session on Dispose).
3. Host Return occurs only after Dispose completes (or documented failure recovery).

---

## 7. Session bootstrap model

### 7.1 Flow

```text
Launch Context                 (from Experience Host)
        ↓
ExperiencePresentationConfig   (from Builder publish; resolved by Delivery)
        ↓
Delivery Envelope              (Delivery-built boundary package)
        ↓
Runtime Session                (created at Delivery boundary)
        ↓
Decision Session               (RI-002 semantics — Runtime-owned)
```

### 7.2 Delivery Envelope

**Delivery Envelope** is the boundary object Delivery assembles before/at Session creation. It may include:

| Field group | Content | Domain? |
| --- | --- | --- |
| Object binding | `objectId` / package reference | Identity only — not Interpretation |
| Presentation snapshot | Mode, chrome flags, Landing Anchor id | Presentation |
| Launch Context | hostKind, launcherId, referrer, campaign, … | Entry metadata — **not** domain |
| Clock / now | Injectable time (ED-DA-06) | Technical |
| Asset base | CDN / Pages asset origin | Technical |

**Delivery Envelope MUST NOT** embed Priority choices, Story steps, or interpreted House meaning.

### 7.3 Runtime authority

1. Runtime remains the **only semantic authority** (ADR-001).
2. Delivery calls Runtime factory / session create APIs; it does not interpret results for Decision meaning.
3. Launch Context may attach to Session **envelope** (analytics, reproducibility) only as **opaque / non-Interpretive** metadata (EMB-01).
4. Client Studio reads `experience.context` from Runtime; it does not invent Session state.

```text
Delivery
  → resolve HousePackage by objectId (loader / fixture — no meaning composition)
  → createDecisionSessionRuntime({ housePackage, clock, … })
  → optional attachLaunchEnvelope(opaque)
  → mount Studio with injected Runtime + PresentationChrome
```

---

## 8. Rendering independence

### 8.1 Principle

**Delivery Layer MUST NOT assume a concrete Experience renderer.**

Client Studio is today’s React web Experience. Delivery’s contracts must remain valid if the Experience surface is later:

| Renderer | Compatibility expectation |
| --- | --- |
| **React (web)** | Current pilot |
| **Native renderer** | Same lifecycle/states; native mount target |
| **Server-side renderer** | Hydration/mount still follows Prepare → Mount → Reveal → Active |

### 8.2 Implications

1. Delivery defines **surfaces** (overlay / inline / page) and **lifecycle**, not JSX.
2. Mount is “attach Experience runtime view to a target”, not “call ReactDOM”.
3. Reveal is “settle viewport on Landing Anchor”, not “must use `element.scrollIntoView`”.
4. A future native Host (mobile app) reuses Delivery concepts; Runtime stays unchanged.

---

## 9. Future Host compatibility

| Host | Delivery expectation | Runtime change? |
| --- | --- | --- |
| Partner Website | Launcher Mode overlay default | No |
| Standalone Page | Standalone mount | No |
| Sales Terminal | Host-specific shell; same Delivery lifecycle | No |
| Operations Terminal | Same | No |
| Mobile App | Native mount target; same states | No |
| QR Entry | Launch Context rich; Mode often launcher/standalone | No |
| External Integrations | API-driven Launch/Close | No |

New Hosts extend **Launch Context** and choose **Mode** + mount target. They do **not** fork Runtime or Client Studio.

---

## 10. Relationship to ELA-01 / EMB-01

| Document | Owns |
| --- | --- |
| **ELA-01** | Launcher UX, Landing Anchor, Launch → Reveal → Experience meaning |
| **EMB-01** | Experience Host catalogue, Modes, Builder config, Launch Context rules |
| **EDL-01** | Delivery subsystem: lifecycle, states, envelope, mount/dispose, renderer independence |
| **EDIC-01** | Implementation contracts: Launch/Close API, events, Builder/Studio/Runtime handoffs |
| **LRI-01** | Ordered Launcher Mode integration: bootstrap, Reveal, Close, acceptance scenario |

Conflicts: prefer **EDL-01** for Delivery state/lifecycle naming; prefer **ELA-01** for user-facing Launch/Reveal/Experience wording; prefer **EMB-01** for Host/Builder/Mode matrix; prefer **EDIC-01** for implementer message contracts; prefer **LRI-01** for step order in implementation PTs.

---

## 11. Conceptual API (non-normative names)

```text
Delivery.launch({
  host,
  objectId,
  presentation,      // ExperiencePresentationConfig
  launchContext?,
  target?,           // mount node / native handle
})

Delivery.close()
Delivery.getState()  // Idle | Preparing | … | Disposed
```

Existing `Embed.mount` / `Embed.unmount` remain Standalone/Inline-compatible entry points that map onto the same lifecycle.

---

## 12. Acceptance (documentation)

EDL-01 is complete when:

1. Delivery responsibilities are explicit and exclude domain logic.
2. Boundaries Host → Delivery → Studio → Runtime are unambiguous.
3. Lifecycle is described without mandating a technology.
4. State model covers the full Experience presence cycle.
5. Session bootstrap keeps Runtime as sole semantic authority.
6. Renderer independence and future Hosts are stated.
7. Document is usable as SSOT for implementation tickets.

**No implementation in this PT.** This document is **Accepted** under the Experience Delivery architecture freeze.
