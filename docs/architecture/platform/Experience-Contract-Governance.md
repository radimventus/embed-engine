# Experience Contract Governance

**Status:** Accepted (Governance SSOT — Experience Contract Governance Freeze)  
**Version:** 0.1  
**Date:** 2026-07-23  
**ID:** ECG-01  
**Layer:** Platform Architecture · Governance  
**SSOT for:** Versioning, compatibility, stability tiers, extension rules, deprecation, ADR gates for Experience Delivery contracts, and **Viewport Ownership Contract**  
**Not SSOT for:** Runtime algorithms, Delivery implementation internals, Builder UI, TypeScript APIs, new architectural layers

**Depends on (architecture — do not redefine):**

- [ELA-01](./Experience-Launcher-Architecture.md) · [EMB-01](./Experience-Modes-and-Builder-Integration.md) · [EDL-01](./Experience-Delivery-Layer.md)
- [EDIC-01](./Experience-Delivery-Implementation-Contract.md) · [LRI-01](./Launcher-Runtime-Integration-Specification.md)
- [ADR-014](../adr/ADR-014-experience-launcher.md) … [ADR-017](../adr/ADR-017-experience-delivery-implementation-contract.md) (frozen decisions; this doc **governs change**, does not amend them)

**Governing ADR:** [ADR-018](../adr/ADR-018-experience-contract-governance.md) (Accepted)

**Principle:** Governance manages **how contracts evolve**. It does **not** change Runtime semantics, Delivery responsibilities, or layer boundaries established by ADR-014…017 / ELA / EMB / EDL / EDIC.

---

## 1. Purpose

Experience Delivery is entering implementation. Contracts will change. Without rules, implementers will:

- break partner Hosts silently,
- reinterpret Stable fields,
- ship “small” changes that alter layer ownership,
- remove fields without a deprecation window.

**ECG-01** defines the rules for evolving Experience contracts over time.

---

## 2. Contracts in scope

| Contract | Defined primarily in | Scope of governance |
| --- | --- | --- |
| **Delivery API** | EDIC-01 §2 | Launch, Close, GetState, Subscribe; request/result shapes |
| **Launch Contract** | EDIC-01 §2.2–2.3 · LRI-01 bootstrap | Experience Configuration + Launch Context + Runtime Bootstrap groups |
| **Runtime Bootstrap Contract** | EDL-01 §7 · EDIC-01 §4 · LRI-01 §6 | Delivery Envelope → Runtime Session boundary (opaque Launch Context; no domain) |
| **Builder Contract** | EMB-01 · EDIC-01 §3 | Declarative `ExperiencePresentationConfig` (+ publish metadata) |
| **Client Studio Contract** | EDIC-01 §5 · ELA-01 Close/Reveal | Readiness signals; PresentationChrome; Close Request; no Delivery ownership |
| **Viewport Ownership Contract** | ECG-01 §9A | Who may manipulate the browser viewport during Launch→Close |

Lifecycle event names (EDIC-01) are governed as part of Delivery API / Event surface (§4 stability).

---

## 3. Contract Versioning

### 3.1 Version identity

1. Experience contracts use **semantic versioning** at the **platform contract** level: `MAJOR.MINOR.PATCH`.
2. The architectural SSOT documents (EDIC-01, EMB-01, …) record the **current contract version** in their header when Accepted revisions ship.
3. Implementations MAY expose a machine-readable contract version (e.g. Delivery capability string). Exact TypeScript shape is out of scope here.
4. Versioning applies to **message/lifecycle contracts**, not to Runtime domain schema (House Package / Decision Session — those follow their own SSOTs).

### 3.2 What counts as each bump

| Bump | When | Examples |
| --- | --- | --- |
| **Patch** | Clarification, typo, non-semantic wording, stricter documentation of existing behaviour, bugfix that restores documented intent | Clarify that Launch Context is opaque; fix diagram label; document existing Mode default |
| **Minor** | Additive, optional, backward-compatible extension | New optional Launch Context field; new optional event; new optional Landing Anchor id; optional PresentationChrome flag defaulting off/safe |
| **Major** | Breaking change (§5.3) | Rename/repurpose required field; remove required field; change lifecycle phase meaning; move responsibility across layers |

### 3.3 Per-contract versioning notes

| Contract | Patch | Minor | Major |
| --- | --- | --- | --- |
| **Delivery API** | Doc-only / restore documented ops | Add optional op/event/field | Remove op; change Launch/Close semantics; change Subscribe event meaning |
| **Launch Contract** | Clarify required vs optional without changing meaning | Add optional subgroup fields | Change required groups; change meaning of Mode / Landing Anchor / Object ID |
| **Runtime Bootstrap** | Clarify Envelope non-domain rules | Add optional technical Envelope fields | Put domain meaning into Envelope; change who creates Session; require Mode as Runtime input |
| **Builder Contract** | Clarify declarative-only rule | Add optional presentation fields with safe defaults | Require Builder to configure Delivery internals; remove Mode enum value in use |
| **Client Studio Contract** | Clarify readiness signal names | Add optional readiness / chrome flags | Require Studio to own overlay/scroll; remove Close in Launcher Mode |

**Rule:** A change that is Major for any listed contract is Major for the platform Experience contract package unless an ADR explicitly isolates version streams (not recommended for pilot).

---

## 4. Compatibility Rules

### 4.1 Forward Compatibility

**Definition:** A **newer Delivery** (and Studio shell) MUST accept and operate with an **older published configuration / Launch Request**, as long as semantic invariants hold.

| Rule | Requirement |
| --- | --- |
| F1 | Unknown optional fields in older configs → ignore or default; do not fail Launch solely for absence of newer fields |
| F2 | Older Mode / Landing Anchor values still in Stable set → MUST keep working |
| F3 | Missing optional Launch Context fields → Launch still succeeds |
| F4 | If older config violates a **new** hard invariant that older Delivery never enforced, newer Delivery MAY reject only if documented as Major + migration; prefer soft defaults for pilot Minor bumps |

### 4.2 Backward Compatibility

**Definition:** **New features MUST NOT change the meaning** of existing contract fields, events, or lifecycle phases.

| Rule | Requirement |
| --- | --- |
| B1 | Extensions are **additive** (new optional fields/events/flags) |
| B2 | Existing field semantics are frozen until Major + deprecation |
| B3 | Default values for new optional fields MUST preserve prior observable behaviour when unset |
| B4 | Runtime public semantic API MUST NOT change as a side-effect of Delivery/Builder presentation extensions |

### 4.3 Breaking Changes

A change is **breaking** (requires **Major** + ADR gate §8) if it does any of:

| # | Breaking criterion |
| --- | --- |
| BC1 | Changes the **meaning** of an existing field, event, or state |
| BC2 | Removes a **required** field/operation or makes a previously optional field required in a way that invalidates existing publishers |
| BC3 | Changes **lifecycle** phase order or meaning (Launch → Reveal → Active → Close → Dispose → Return Host) |
| BC4 | Changes **layer responsibilities** (e.g. Builder owns overlay; Runtime knows Mode as meaning; Studio owns Host scroll lock) |
| BC5 | Renames Stable identifiers without a deprecation alias period (`social-proof`, Mode names, core event names) |
| BC6 | Forces domain content into Launch Context / Delivery Envelope |

Non-breaking (typically Minor/Patch): additive optional fields; new Landing Anchor ids; new Host kinds; new optional events; clarifying docs; implementation swaps that preserve UX meaning (e.g. Reveal animation technique).

---

## 5. Contract Stability

### 5.1 Tiers

| Tier | Meaning | Change bar |
| --- | --- | --- |
| **Stable** | Partner- and Builder-facing; long-lived meaning | Minor only if additive; otherwise Major + deprecation |
| **Evolvable** | May grow faster; still additive by default | Minor preferred; Major if BC\* applies |
| **Internal** | Delivery implementation detail; not a public contract | May change without contract Major **if** public behaviour unchanged |

### 5.2 Classification (initial)

**Stable**

| Element | Notes |
| --- | --- |
| Launch Context (core shape: hostKind, entry metadata pattern) | Opaque / non-Interpretive (EMB-01) |
| Landing Anchor (id concept + launcher default `social-proof`) | Extensible id set via Minor |
| ExperiencePresentationConfig (Mode, chrome flags, Landing Anchor, object binding declarations) | Declarative only |
| Experience Modes (`standalone` \| `launcher` \| `inline`) | Adding a Mode is Major (new architecture) |
| Delivery lifecycle meaning (EDL-01 phases) | Mechanism may change; meaning Stable |
| Layer responsibility split (Host / Builder / Delivery / Studio / Runtime) | Stable — BC4 |
| Runtime as sole semantic authority | Stable — never softened by Delivery contracts |
| **Viewport ownership (Delivery during Active Experience)** | Stable — ECG-01 §9A; clarifying wording is Patch |

**Evolvable**

| Element | Notes |
| --- | --- |
| Delivery Event list (beyond core lifecycle set) | Core set in EDIC-01 is semi-stable; additional telemetry events are Evolvable |
| Telemetry / analytics metadata | Additive |
| Optional Launch Context campaign fields | Additive |
| PresentationChrome optional flags | Additive with safe defaults |
| LRI-01 sequencing prose (clarifications) | Patch/Minor; must not contradict EDL/ELA |

**Internal**

| Element | Notes |
| --- | --- |
| Delivery internals (z-index strategy, focus-trap implementation, scroll-lock technique) | Not Builder-configurable |
| Concrete mount/renderer choice | Renderer-independent contract remains |
| Animation library / scroll API for Reveal | UX meaning Stable; technique Internal |

---

## 6. Extension Rules

When adding features to Experience contracts:

1. **Optional by default** — new parameters MUST be optional (or have defaults that preserve prior behaviour).
2. **No semantic overwrite** — new fields MUST NOT redefine existing fields.
3. **No Runtime API drive-by** — Delivery/Builder/Studio extensions MUST NOT require changes to Runtime domain commands or Interpretation solely to support presentation.
4. **Envelope stays non-domain** — extensions to Delivery Envelope are technical / opaque entry metadata only.
5. **Builder stays declarative** — new Builder fields describe intent; Delivery interprets; Builder never gains Delivery mechanics.
6. **Document the bump** — every extension states Patch / Minor / Major and updates EDIC/EMB/EDL as appropriate.
7. **Acceptance scenario** — behavioural extensions that affect Launcher open/close SHOULD update or reference LRI-01 acceptance scenario when user-visible.

---

## 7. Deprecation Policy

### 7.1 Lifecycle

```text
Introduced
   ↓
Supported
   ↓
Deprecated
   ↓
Removed
```

| Stage | Meaning | Allowed consumers |
| --- | --- | --- |
| **Introduced** | New optional or experimental field/event documented | New publishers MAY adopt |
| **Supported** | Fully supported Stable or Evolvable surface | All supported Hosts/Builders |
| **Deprecated** | Still works; documented replacement; warnings allowed | Existing publishers MUST migrate; new publishers SHOULD NOT use |
| **Removed** | No longer accepted / emitted | Migration complete; Major bump |

### 7.2 Minimum support period

| Tier | Minimum **Deprecated → Removed** window |
| --- | --- |
| **Stable** | **Two** published platform contract Minor lines **or** **90 days**, whichever is longer |
| **Evolvable** | **One** published Minor line **or** **30 days**, whichever is longer |
| **Internal** | No public deprecation required if behaviour unchanged; if it was accidentally documented as public, treat as Evolvable |

**Additional rules:**

1. Deprecation MUST name the replacement and migration path.
2. Removal of Stable elements REQUIRES Major + ADR (§8).
3. During Deprecated, Forward Compatibility still applies (newer Delivery still accepts old config).
4. Silent removal is forbidden.

---

## 8. ADR Policy

| Change type | Gate |
| --- | --- |
| New architectural layer, Mode, or responsibility shift (BC4) | **New ADR required** |
| Breaking contract change (BC1–BC6) | **New ADR required** (+ Major) |
| New Experience Host class that changes Launch Context meaning | **New ADR required** if meaning/ownership changes; else docs Minor |
| Additive optional field / event / Landing Anchor id | **Documentation change** (EDIC/EMB/EDL/ECG as needed); no new ADR |
| Clarify wording, diagrams, LRI sequencing without semantic change | **Documentation only** (Patch) |
| Reveal animation technique, scroll-lock implementation, mount tech | **Implementation only** — must preserve public contract meaning |
| Runtime domain algorithm / Decision Session semantics | **Out of ECG scope** — Runtime / RI / existing Decision ADRs |
| Amending ADR-014…017 decisions | **Forbidden via ECG** — requires explicit superseding ADR; ECG does not rewrite them |

**Rule of thumb:** If a reviewer cannot tell whether Hosts/Builders must change behaviour, escalate to ADR.

---

## 9. Governance Matrix

| Area | Owner | May change | Must not change without ADR |
| --- | --- | --- | --- |
| **Runtime** | Runtime | Domain Session, Interpretation, Projection (own SSOTs) | Becoming Mode/Host-aware as meaning; absorbing Delivery lifecycle; **browser viewport manipulation** (§9A) |
| **Delivery** | Delivery | Internals; additive contract fields per this policy; **browser viewport during Active Experience** (§9A) | Layer ownership; lifecycle meaning; domain Envelope content |
| **Builder** | Builder | Declarative presentation fields (additive) | Delivery mechanics; Runtime domain config |
| **Client Studio** | Studio | Journey UI; chrome cooperation; declarative viewport requests only (§9A) | Owning overlay/Host scroll/Delivery lifecycle |
| **Contracts** | Architecture | ECG / EDIC / EMB / ELA / EDL docs under this policy | Silent breaks; undocumented removals |
| **Governance** | Architecture | ECG-01 / ADR-018 revisions | Using governance to smuggle architecture changes |

**Invariant:** Governance **MUST NOT** alter Runtime semantic authority or Delivery’s non-domain role. ECG manages evolution rules only.

---

## 9A. Viewport Ownership Contract

Normative implementation rule derived from EDL-01 / ELA-01 / LRI-01. **Does not** change layer architecture, Runtime semantics, or Delivery API shapes (EDIC-01).

### 9A.1 Ownership

**Experience Delivery SHALL own the browser viewport from successful Launch until Close completion.**

“Browser viewport” here means: Host page scroll position, Host scroll lock/unlock, fullscreen overlay / delivery surface placement, Reveal settle of the Experience viewport, and restore of Host scroll/focus on Close.

### 9A.2 Exclusive authority

While an Experience is Active (from Launch accepted through Close completion), the following **MUST NOT** directly manipulate the browser viewport:

| Party | Forbidden direct actions (examples) |
| --- | --- |
| **Launcher** | `window.scrollTo`, unlock Host scroll, create/destroy overlay |
| **Runtime** | Any DOM / window scroll or focus as part of domain logic |
| **Client Studio** | Host/page `scrollTo`, Host unlock, overlay lifecycle, competing fixed fullscreen surfaces |
| **Experience Modules** (sections / terminals) | Same as Studio — no Host viewport or Delivery surface ownership |

**Only Delivery** may perform those manipulations.

**Clarification — in-Experience user scroll:** User-driven scrolling **inside** the Delivery-owned Experience scrollport (Journey content) is allowed. That is content navigation within Delivery’s surface, not a second owner of the browser/Host viewport. Programmatic Host or window viewport changes remain Delivery-only.

### 9A.3 Allowed requests (declarative only)

Launcher, Runtime, Client Studio, and Experience Modules **MUST NOT** change the viewport directly. They **MAY** emit **declarative requests** for Delivery to interpret, for example:

| Request (logical) | Intent |
| --- | --- |
| **Reveal Landing Anchor** | Settle Experience viewport on configured Landing Anchor |
| **Scroll Request** | Ask Delivery to scroll the Experience surface to a target |
| **Focus Request** | Ask Delivery to move focus within the Experience / restore to Host |
| **Highlight Request** | Ask Delivery/Studio chrome to emphasize a target (non-domain) |

Delivery **decides whether and how** each request is executed (timing, technique, degrade/ignore). Ignoring an optional request must not corrupt Host restore.

Declarative requests are **not** Runtime Decision Moves and are **not** Delivery API version bumps unless EDIC-01 later promotes specific ones.

### 9A.4 Close rule

On Close completion, Delivery **MUST**:

1. restore the Host viewport / scroll position captured at Launch,
2. unlock Host scroll,
3. dismiss the Delivery surface (overlay) as Mode requires,
4. **release** viewport ownership so the Host again owns the page viewport.

After ReturnedToHost / Idle, Delivery no longer owns the browser viewport.

### 9A.5 Validation invariant

```text
Exactly one layer owns the browser viewport at any point in time.
```

| Phase | Viewport owner |
| --- | --- |
| Host Idle (no Active Experience) | **Host** |
| Launch → Active → Closing (until Return Host completes) | **Delivery** |
| After Close completion / Idle | **Host** |

Violation examples: Studio calling `window.scrollTo` on the Host document; Runtime changing scroll as domain side-effect; Launcher unlocking Host scroll while overlay is Active; two overlays competing for fullscreen.

---

## 10. Relationship to other documents

| Document | Role vs ECG-01 |
| --- | --- |
| ELA / EMB / EDL | Architecture SSOTs — **what** the system is |
| EDIC-01 | Implementation message contract — **what** is exchanged |
| LRI-01 | Integration sequencing — **in what order** |
| ECG-01 | Governance — **how** contracts may change; **Viewport Ownership Contract** (§9A) |
| ADR-018 | Decision to adopt ECG-01 |
| ADR-014…017 | Frozen architecture/contract decisions — **not amended** by ECG |
| LRI-01 | Integration sequencing — references §9A for viewport authority during bootstrap/Reveal/Close |

---

## 11. Acceptance

ECG-01 is complete when:

1. Versioning rules (Patch / Minor / Major) are defined per contract family.  
2. Forward and backward compatibility rules are explicit.  
3. Breaking-change criteria are unambiguous.  
4. Stability tiers and extension/deprecation policies are usable by implementers.  
5. ADR vs docs vs implementation gates are clear.  
6. Governance matrix assigns ownership without new layers.  
7. **Viewport Ownership Contract** is explicit (§9A): Delivery exclusive authority; declarative requests only; Close releases ownership; single-owner invariant.  
8. Document is consistent with ADR-014…017 / ELA / EMB / EDL / EDIC (no architecture rewrite).

**This document is Accepted** as part of the Experience Contract Governance Freeze (with ADR-018).
