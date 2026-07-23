# Experience Delivery Implementation Contract

**Status:** Accepted (Implementation Contract SSOT — Implementation Specification Freeze)  
**Version:** 0.1  
**Date:** 2026-07-23  
**ID:** EDIC-01  
**Layer:** Platform Architecture · Embed Delivery · Implementation Contract  
**SSOT for:** Delivery API contract, Launch/Close contracts, lifecycle events, Builder → Delivery → Studio → Runtime message boundaries, architectural error handling  
**Not SSOT for:** TypeScript types, React/DOM APIs, concrete class names, framework choice, Runtime algorithms, Decision Journey content

**Depends on (Accepted):**

- [ELA-01](./Experience-Launcher-Architecture.md) · [EMB-01](./Experience-Modes-and-Builder-Integration.md) · [EDL-01](./Experience-Delivery-Layer.md)
- [ADR-014](../adr/ADR-014-experience-launcher.md) · [ADR-015](../adr/ADR-015-experience-modes-builder.md) · [ADR-016](../adr/ADR-016-experience-delivery-layer.md)
- [ADR-001](../adr/ADR-001-runtime-architecture.md) · [RI-001](../../04-reference-implementation/RI-001-Runtime-Kernel.md) · [RI-002](../../04-reference-implementation/RI-002-Decision-Session.md)

**Governing ADR:** [ADR-017](../adr/ADR-017-experience-delivery-implementation-contract.md) (Accepted)

**Companion sequencing:** [LRI-01 — Launcher Runtime Integration Specification](./Launcher-Runtime-Integration-Specification.md) (Accepted — ordered Launcher Mode bootstrap / Reveal / Close).

**Principle:** This contract is binding for every Delivery implementation. It specifies **what** must be exchanged and **when** — not **how** it is coded.

---

## 1. Purpose

Architecture (ELA / EMB / EDL) is frozen.  
**EDIC-01** removes implementation ambiguity between:

| Party | Role in contract |
| --- | --- |
| **Builder** | Publishes declarative presentation config |
| **Experience Host** | Issues Launch / Close |
| **Delivery Layer** | Interprets config; owns presence lifecycle; emits events |
| **Client Studio** | Renders one Journey; consumes readiness signals |
| **Runtime** | Sole semantic authority; mode-/host-agnostic |

---

## 2. Delivery API (architectural)

Public Delivery surface (names are logical; not TypeScript).

### 2.1 Operations

| Operation | Direction | Meaning |
| --- | --- | --- |
| **Launch** | Host → Delivery | Start an Experience with a Launch Request |
| **Close** | Host or Studio → Delivery | Request teardown of Active Experience |
| **GetState** | Any → Delivery | Query Delivery state (EDL-01 state model) |
| **Subscribe** | Observer → Delivery | Observe Delivery Events |

### 2.2 Launch Request

Minimal architectural input to start an Experience:

```text
Launch Request
├── Experience Configuration
│   ├── Experience Mode          (standalone | launcher | inline)
│   ├── Landing Anchor           (default: social-proof in launcher)
│   └── Presentation Config      (ExperiencePresentationConfig chrome/entry)
├── Launch Context
│   ├── Host ID / hostKind
│   ├── Entry Point
│   ├── Launcher ID              (optional)
│   ├── Referrer                 (optional)
│   └── Campaign Metadata        (optional)
└── Runtime Bootstrap
    ├── Object ID
    ├── Runtime Configuration    (technical: assetBase, clock policy, …)
    └── Session Bootstrap hints  (opaque; non-domain)
```

| Group | Required | Notes |
| --- | --- | --- |
| Experience Mode | Yes | From Builder config / Host deployment |
| Landing Anchor | Yes (may use mode default) | Reveal target |
| Presentation Config | Yes | Declarative chrome/entry from Builder |
| Host ID / hostKind | Yes | Launch Context |
| Object ID | Yes | Package identity for Session |
| Entry Point / Launcher ID / Referrer / Campaign | Optional | Launch Context; non-domain |
| Runtime Configuration | Yes (minimal) | Technical only — not Interpretation |

### 2.3 Launch Result

```text
Launch Result
├── accepted: boolean
├── deliveryInstanceId?: string
├── failure?: Delivery Failure   (if not accepted / failed early)
└── (async progress continues via Delivery Events)
```

Launch may return synchronously as “accepted into Preparing” while Mount/Reveal complete asynchronously via events.

### 2.4 Close Request

```text
Close Request
├── reason?: "user" | "host" | "error" | "replace"
└── restoreHost: boolean         (default true)
```

### 2.5 Delivery Events (contract)

Standard lifecycle events (observers / analytics / Host adapters):

| Event | Emitted when |
| --- | --- |
| **LaunchRequested** | Host submitted Launch Request |
| **LaunchStarted** | Delivery entered Preparing |
| **Mounted** | Client Studio attached; Session bootstrap succeeded |
| **RevealStarted** | Reveal toward Landing Anchor began |
| **RevealCompleted** | Landing Anchor is the intentional viewport |
| **ExperienceActive** | Experience usable (Active state) |
| **CloseRequested** | Close accepted |
| **Disposed** | Studio unmounted; Session ended/suspended per policy |
| **ReturnedToHost** | Host scroll/focus restored; Delivery Idle |

Events are **infrastructure signals**. They are **not** Decision Story Moves unless a future ADR promotes specific ones.

---

## 3. Builder Contract

### 3.1 What Builder passes

Builder publishes **only** declarative configuration consumable as:

```text
ExperiencePresentationConfig
  (mode, launcher metadata, chrome flags, entry/Landing Anchor, objectId, assetBase?)
```

Builder may also publish Host placement metadata for Launchers (kind, label, trigger binding) as part of that config.

### 3.2 What Builder must not pass / own

Builder **MUST NOT**:

- specify overlay implementation,
- specify scroll-lock or Reveal mechanism,
- own Delivery lifecycle,
- call Runtime domain commands,
- encode Decision Journey order,
- configure Delivery internals (z-index, focus-trap strategy, etc.).

**Rule:** Builder declares. Delivery interprets and realizes.

---

## 4. Runtime Contract

### 4.1 What Delivery passes to Runtime

At Session bootstrap, Delivery supplies a **Delivery Envelope** / bootstrap package:

| Input to Runtime boundary | Allowed | Forbidden as domain input |
| --- | --- | --- |
| Object ID → resolved HousePackage | Yes (identity → facts package) | Delivery must not invent Interpretation |
| Runtime Configuration (clock, asset base) | Yes (technical) | — |
| Session Bootstrap / opaque launch envelope | Yes (non-Interpretive) | Priorities, Story, Moves |
| Launch Context | Attach as opaque envelope only | Mode, Host chrome, campaign as House meaning |

### 4.2 What Runtime must not know

Runtime **MUST NOT** know or branch on:

- whether presence is Launcher / Inline / Standalone,
- overlay vs page mount,
- Host header/footer,
- Reveal mechanism,
- Builder CMS structure.

Runtime remains the **sole semantic authority** for Decision Session (RI-002).

---

## 5. Client Studio Contract

### 5.1 What Studio expects from Delivery

Before/while becoming Active, Studio consumes readiness — architectural signals (not framework hooks):

| Signal | Meaning |
| --- | --- |
| **mount ready** | Studio view is attached to a delivery surface |
| **runtime ready** | Runtime Session exists and Experience projection is available |
| **viewport ready** | Reveal completed (or Mode skipped Reveal); Landing Anchor policy satisfied |

Studio may also receive **PresentationChrome** flags derived from Presentation Config:

```text
showHero, showFooter, showCloseAction, landingAnchorId, …
```

### 5.2 What Studio must not do

Client Studio **MUST NOT**:

- create overlays or lock Host scroll,
- own Delivery lifecycle / Dispose,
- resolve Builder publish payloads,
- bootstrap Runtime Session itself when launched via Delivery (Delivery owns boundary bootstrap),
- branch Journey trees by Mode.

Studio **MAY** request Close (user chrome) by sending Close Request to Delivery.

### 5.3 Close chrome (Launcher Mode)

Per ELA-01: „Zavřít Client Studio“ in left nav and footer → Close Request → Delivery.

---

## 6. Host Contract (summary)

| Host does | Host does not |
| --- | --- |
| Emit Launch Request / Close Request | Interpret House Package |
| Supply Launch Context | Own Decision Session |
| Provide mount target when required | Implement Reveal |

---

## 7. Error handling (architectural)

Failures are classified by phase. Behaviour is contractual; recovery UI is product-specific.

| Failure | Typical phase | Delivery MUST | Runtime | Host |
| --- | --- | --- | --- | --- |
| **Launch failure** | Launch / Resolve Configuration | Reject Launch Result; emit no Mounted; remain Idle or return to Idle; report failure | Not started | May retry / show Host error |
| **Runtime bootstrap failure** | Mount Experience | Abort mount; Dispose any partial surface; emit failure (no ExperienceActive); end partial Session if any | Must not leave orphaned semantic Session | Notified via Launch Result / events |
| **Reveal failure** | Reveal | Prefer degraded Active at safe viewport (document start) **or** Close+Dispose if Mode requires Landing Anchor; emit RevealCompleted with degraded flag **or** CloseRequested | Session may remain valid | Optional notice |
| **Close failure** | Close / Dispose | Best-effort unmount + unlock Host scroll; force Disposed; emit ReturnedToHost if Host restore possible; log failure | Force Session end/suspend | Host may remount page as last resort |

**Invariant:** Domain errors inside Active Experience (e.g. command rejection) are Runtime/Studio concerns — not Delivery lifecycle failures — unless they require forced Close.

---

## 8. Sequence diagram

Architectural message flow (happy path, Launcher Mode):

```text
Host                Builder              Delivery             Client Studio         Runtime
 │                     │                    │                      │                   │
 │                     │ publish            │                      │                   │
 │                     │ ExperiencePresentationConfig              │                   │
 │                     │───────────────────►│ (resolved at Launch) │                   │
 │                     │                    │                      │                   │
 │ Launch Request      │                    │                      │                   │
 │  (config + Launch Context + Object ID)   │                      │                   │
 │─────────────────────────────────────────►│                      │                   │
 │                     │                    │ LaunchRequested      │                   │
 │                     │                    │ LaunchStarted        │                   │
 │                     │                    │                      │                   │
 │                     │                    │ resolve package      │                   │
 │                     │                    │ create Session ─────────────────────────►│
 │                     │                    │◄──────── Session / Experience ready ─────│
 │                     │                    │                      │                   │
 │                     │                    │ mount + PresentationChrome               │
 │                     │                    │─────────────────────►│                   │
 │                     │                    │ Mounted              │                   │
 │                     │                    │ runtime ready        │                   │
 │                     │                    │ mount ready          │                   │
 │                     │                    │                      │                   │
 │                     │                    │ RevealStarted        │                   │
 │                     │                    │ reveal Landing Anchor│                   │
 │                     │                    │─────────────────────►│                   │
 │                     │                    │ RevealCompleted      │                   │
 │                     │                    │ viewport ready       │                   │
 │                     │                    │ ExperienceActive     │                   │
 │                     │                    │                      │                   │
 │                     │                    │     user explores Journey / dispatch     │
 │                     │                    │                      │──────────────────►│
 │                     │                    │                      │◄── experience ────│
 │                     │                    │                      │                   │
 │ Close Request ◄─────│────────────────────│◄── Close (chrome) ───│                   │
 │ or Host Close       │                    │ CloseRequested       │                   │
 │                     │                    │ unmount              │                   │
 │                     │                    │─────────────────────►│                   │
 │                     │                    │ end/suspend Session ────────────────────►│
 │                     │                    │ Disposed             │                   │
 │◄── ReturnedToHost ──│────────────────────│                      │                   │
```

Builder appears as **publisher of config**, not as a runtime participant in every Launch. Host may load pre-published config from CDN/CMS without a live Builder process.

---

## 9. Mapping to EDL-01 states

| Delivery Event | EDL-01 state (approx.) |
| --- | --- |
| LaunchRequested / LaunchStarted | Preparing |
| Mounted | Mounted |
| RevealStarted / RevealCompleted | Revealing → Active |
| ExperienceActive | Active |
| CloseRequested | Closing |
| Disposed | Disposed |
| ReturnedToHost | Idle |

---

## 10. Compatibility requirements

1. Contract must work for Partner Website, Standalone Page, Sales/Operations Terminals, Mobile, QR, External apps (EMB-01 Hosts).
2. Contract must not require React.
3. Existing `Embed.mount` / `unmount` SHOULD map onto Launch/Close + events without breaking Standalone/Inline.

---

## 11. Acceptance

EDIC-01 is complete when:

1. All layers have explicit contracts (Builder, Delivery, Studio, Runtime, Host).
2. Launch Request / Result / Close / Events are defined without TypeScript.
3. Runtime remains mode-agnostic; Delivery remains non-domain.
4. Error handling covers launch, bootstrap, reveal, close failures architecturally.
5. Sequence diagram is usable as the basis for an implementation PT.

**No code in this PT.** This document is **Accepted** as part of the Implementation Specification Freeze.
