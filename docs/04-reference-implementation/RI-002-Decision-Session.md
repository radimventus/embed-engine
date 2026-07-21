# RI-002 — Decision Session

| Field | Value |
| --- | --- |
| **ID** | RI-002 |
| **Title** | Decision Session |
| **Status** | Frozen |
| **Version** | 1.0 |
| **Date** | 2026-07-21 |
| **Owner** | Platform Architecture |
| **Document type** | Reference Implementation Specification (documentation-only) |
| **Conforms to** | [ESS-001](../03-specification-standard/ESS-001-Embed-Specification-Standard.md) v1.0, [EQS-001](../03-specification-standard/EQS-001-Engineering-Quality-Standard.md) v1.0 |
| **Depends On** | Reference Architecture v1.0 (Conceptual Freeze), [RI-001 — Runtime Kernel](./RI-001-Runtime-Kernel.md), [ADR-001](../architecture/adr/ADR-001-runtime-architecture.md), [ADR-002](../architecture/adr/ADR-002-decision-state.md), [ADR-003](../architecture/adr/ADR-003-cognitive-processing-pipeline.md), [ADR-007](../architecture/adr/ADR-007-priority-mvp-policy.md), [Living Experience v0.1 Freeze](../architecture/living-experience-v0.1-freeze.md), [Decision Layer Governance v1](../architecture/decision-layer/decision-layer-governance-v1.md) |
| **Related Documents** | [RUNTIME.md](../architecture/RUNTIME.md), [CORE-101](../architecture/core/CORE-101-cognitive-layer.md), [CORE-002](../architecture/core/CORE-002-decision-state.md), [ADR-009](../architecture/adr/ADR-009-decision-layer.md), [ADR-010](../architecture/adr/ADR-010-decision-strategy.md), Epoch I retrospective (`docs/00-foundation/FOUNDATION-EPOCH-I.md`) |
| **RFC 2119** | Per ESS-001 §3 |

---

## 1. Purpose

The **Decision Session** is the named unit of **one active user decision journey** with an Experience for a bound Object Package.

It exists so that Runtime, Cognitive Layer, Decision Layer, and Experience share one answer to:

> What is the current decision process for this visitor and this object?

Epoch I consolidated mutable decision process concerns under this name (Working Object binding, evidence, Interpretation, Runtime memory, history). Frozen ADRs realize that consolidation as:

| Concern (Epoch I language) | Normative realization |
| --- | --- |
| Authoritative cognitive contents | **DecisionState** (sole Cognitive aggregate — ADR-002) |
| Derived understanding | **Interpretation** (`project()` — ADR-003) |
| Optional guidance snapshot | **Decision Story** (Decision Strategy — ADR-009 / ADR-010) |
| Hosting / lifecycle envelope | **RuntimeState** for the **active Experience** (RI-001, ADR-007) |

### 1.1 Distinctions

| Concept | What it is | What it is not |
| --- | --- | --- |
| **Decision Session** | One active Experience decision journey (boundary + ownership) | A second Cognitive aggregate; a UI; a report document |
| **Runtime** | Public façade / Kernel orchestration (RI-001) | The Cognitive contents themselves |
| **DecisionState** | Sole Cognitive aggregate; authoritative process knowledge | Runtime infrastructure; Interpretation; Session identity alone |
| **Interpretation** | Read-only derived meaning from DecisionState | Writable Session store; Experience UI state |
| **Experience** | Surfaces that render and emit Signals | Owner of Cognitive mutation |
| **Decision Report** | Presentation / design surface language (layout) | Cognitive Session contract (not redefined here) |

**Rationale (non-normative):** ADR-002 states DecisionState is not “session storage.” RI-002 does **not** contradict that: Session names the **active journey boundary**; DecisionState remains the **only Cognitive aggregate** inside that boundary.

---

## 2. Scope

### 2.1 In scope

- Session purpose, ownership, lifecycle, and observability
- Mapping Session contents to DecisionState / Interpretation / Story / Runtime hosting
- Mutation rules (Signal → `reduce` only for Cognitive writes)
- MVP persistence boundary (active Experience / Runtime memory — ADR-007)
- Conformance against public Runtime-observable Session behavior

### 2.2 Out of scope

- Redesign of DecisionState fields (ADR-002 / CORE-002)
- Redesign of Runtime Public Contract (RI-001)
- Experience rendering contracts
- Durable persistence / restore architecture (explicitly postponed — ADR-007)
- Multi-visitor collaborative Sessions (postponed — ADR-007)
- Decision Trajectory (Future Architecture)
- Inventing a parallel `Context` aggregate (rejected by ADR-002 / ADR-003)

---

## 3. Normative language

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** are interpreted per [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119) (ESS-001 §3).

Non-normative text is marked **Note:**, **Rationale:**, **Example:**, or placed under Implementation Guidance / Examples / Open Questions.

---

## 4. Architecture alignment

Frozen pipeline (MUST NOT be redefined):

```text
Signal → reduce() → DecisionState → project() → Interpretation
```

Session placement:

```text
Runtime (RI-001)
  └── active Decision Session (this RI)
        ├── DecisionState          ← sole Cognitive aggregate
        ├── Interpretation         ← derived
        └── Decision Story?        ← optional Strategy output
Experience surfaces render Interpretation / Story and emit Signals
```

Concepts used only from Reference Architecture / ADRs / RI-001 — no new architectural concepts.

---

## 5. Responsibilities

### 5.1 Decision Session owns (as boundary)

For one active Experience, the Session **owns the coherence of**:

| Content | Normative carrier | Source |
| --- | --- | --- |
| Authoritative Cognitive state | DecisionState | ADR-002 |
| Accumulated Signals (history as data) | `DecisionState.signals` | ADR-002 |
| Focus / attention | `DecisionState.focus` (Living Experience) | Living Experience v0.1 |
| Priorities / facts / conflicts / environment / metadata | DecisionState fields | ADR-002 |
| Active Interpretation | `RuntimeState.interpretation` via `project()` | ADR-003, RI-001 |
| Optional Decision Story | `RuntimeState.decisionStory` | ADR-010, RI-001 |
| Active-Experience lifetime | Runtime memory until destroy / reload | ADR-007 |

### 5.2 Explicit non-responsibilities

The Decision Session MUST NOT:

| Non-responsibility | Source |
| --- | --- |
| Own Runtime infrastructure (EventDispatcher, ModuleRegistry, …) | ADR-001, RI-001 |
| Implement `reduce` / `project` | ADR-003 |
| Author Decision Stories or Move graphs | Decision Layer Governance; ADR-010 |
| Own Object Package truth | Object Package product contract |
| Own Experience UI / React local chrome (e.g. chat transcript not in DecisionState) | Living Experience known compromises |
| Define Decision Report layout or design tokens | Design docs only |
| Introduce a second Cognitive aggregate named Context / Filter store | ADR-002 / ADR-003 |
| Persist across tabs, reloads, or backends in MVP | ADR-007 |

**Note — Decision Filter:** Product docs exclude Decision Filter from Object Package. No frozen ADR defines Decision Filter as a Session-owned type. RI-002 MUST NOT invent Filter semantics. See Open Questions.

**Note — AI conversation:** Interpretation MAY expose `conversationContext` and related framing fields. Turn-by-turn AI chat history held only in React is **not** Cognitive Session truth (Living Experience).

---

## 6. Ownership

| Role | Actor | Rule |
| --- | --- | --- |
| **Creates** | Host via Runtime `createRuntime` + successful `load` | Session begins when DecisionState + Interpretation are initialized for the bound Object Package (RI-001) |
| **Owns (orchestration)** | Runtime / Kernel | RuntimeState is the sole envelope; StateManager is sole RuntimeState owner (ADR-001, RI-001) |
| **Owns (Cognitive contents)** | DecisionState as data | No component “owns” mutating DecisionState except by producing the next value via `reduce` |
| **Mutates Cognitive contents** | `reduce(previous, Signal)` only | Orchestrated by Kernel `applySignal` / Cognitive `dispatch` (ADR-003, RI-001) |
| **Derives Interpretation** | `project(DecisionState)` only | Kernel commits result into RuntimeState |
| **May recompose Story** | Injected Decision Strategy composer | Optional; Kernel hosts, does not author |
| **Observes** | Experience / host via `getState` / `subscribe` | MUST NOT require Kernel import |
| **Destroys** | Host via Runtime `destroy` (or new `load` starting fresh Cognitive state) | ADR-007: destroy / reload → fresh DecisionState |

Experience MUST NOT write DecisionState. Strategy MUST NOT write DecisionState.

---

## 7. Public Contract

The Decision Session has **no separate public factory** beyond RI-001. Session behavior is the Cognitive / Story portion of the Runtime Public Contract for one active Experience.

### 7.1 Observable Session snapshot

A conforming Session snapshot is the Cognitive-related fields of RuntimeState while a Session is active:

| Field | Session meaning |
| --- | --- |
| `decisionState` | Authoritative Cognitive aggregate |
| `interpretation` | Active derived understanding |
| `decisionStory` | Optional active Story (`null` if absent) |
| `version` | Monotonic Session progression counter (Runtime) |
| `status` | Runtime lifecycle (`ready` while Session active for MVP) |
| `objectPackage` | Opaque bound package handle |

### 7.2 Operations (via Runtime)

| Intent | Runtime operation | Session effect |
| --- | --- | --- |
| Start Session | `load(objectPackage)` | Initialize DecisionState + Interpretation; Session active when `ready` |
| Advance Session | `applySignal(signal)` or Cognitive `dispatch` | Replace DecisionState via `reduce`; refresh Interpretation; optional Story; `version++` |
| Observe | `getState()` / `subscribe` | Read immutable snapshots |
| End Session | `destroy()` | Session disposed; further mutation rejected |

### 7.3 Execution Semantics

| Topic | Rule |
| --- | --- |
| Ordering | Signal order is significant within a Session |
| Concurrency | Same as RI-001: concurrent mutating calls undefined unless host serializes |
| Determinism | Identical initial DecisionState + identical Signal sequence → identical DecisionState and Interpretation |
| Sync | `applySignal` synchronous; `load` / `dispatch` async per RI-001 |
| Side effects | Stateful via RuntimeState replacement + listener notification |

### 7.4 Purity declarations

| Computation | Classification | Side effects |
| --- | --- | --- |
| Session start (`load` init path) | Stateful | RuntimeState Cognitive fields set |
| Session advance (`applySignal`) | Stateful | DecisionState / Interpretation / optional Story replaced; notify |
| `reduce` / `project` | Pure (Cognitive) | Values only |
| Session observe (`getState`) | Pure w.r.t. mutation | Snapshot only |
| Session end (`destroy`) | Stateful | Status destroyed; listeners cleared |

### 7.5 Guarantees / non-guarantees

**Guarantees**

- One active Session per Runtime instance in MVP (single visitor — ADR-007).
- Cognitive writes only through `reduce`.
- Interpretation never writes DecisionState.
- MVP Session memory is Runtime-only.

**Non-guarantees**

- Cross-reload continuity.
- Multi-tab shared Session.
- Stable Session UUID distinct from Runtime instance (see Open Questions).
- That Experience-local UI state is part of the Session.

---

## 8. Lifecycle

| Phase | Trigger | Observable |
| --- | --- | --- |
| **Creation** | `createRuntime` | Runtime `idle`; Session not yet active |
| **Activation** | Successful `load` | `ready`; DecisionState + Interpretation present |
| **Mutation** | Each successful Signal application | `version++`; new DecisionState / Interpretation (/ Story) |
| **Suspension** | Not defined for MVP | MUST NOT invent pause/resume without ADR |
| **Completion** | Product/Experience may signal completion UX | Cognitive completion is not a separate frozen Session status; see Open Questions |
| **Expiration** | Not defined for MVP | No TTL policy frozen |
| **Disposal** | `destroy` | `destroyed`; Session ended |
| **Recovery** | Not in MVP | Post-MVP restore may only rehydrate DecisionState before `project()` (ADR-007) |

---

## 9. State Model

### 9.1 Session identity

MVP identity is the **active Runtime instance** after successful `load` for a given `objectId` / Object Package binding.

A distinct portable `sessionId` type is **not** frozen by architecture. See Open Questions.

### 9.2 Mutable vs immutable

| Kind | What | Rule |
| --- | --- | --- |
| **Immutable values** | Each DecisionState / Interpretation / Story snapshot | Replaced, not mutated in place |
| **Mutable Session progression** | Which snapshot is current | Only via orchestrated replacement |
| **Derived** | Interpretation, ranking highlights inside Interpretation | From `project` only |
| **Transient (Runtime)** | `status`, listeners, `version` | RI-001 |
| **Transient (Experience-local)** | UI chrome, local AI transcript | Not Session Cognitive truth |

### 9.3 Relationship with RuntimeState

```text
RuntimeState
  status, version, objectPackage     ← Runtime infrastructure
  decisionState                      ← Session Cognitive authority
  interpretation                     ← Session derived understanding
  decisionStory                      ← Session optional guidance snapshot
```

DecisionState is **not** Runtime infrastructure (ADR-002). It is **hosted** by Runtime for the active Session (ADR-007, RI-001).

---

## 10. Relationships

| Peer | Relationship | Boundary |
| --- | --- | --- |
| **Runtime Kernel** | Creates, hosts, advances, disposes Session | Session does not replace RI-001 API |
| **Experience** | Observes Interpretation / Story; emits Signals | No DecisionState writes |
| **DecisionState** | Cognitive core of Session | Sole Cognitive aggregate |
| **Interpretation** | Derived Session understanding | Read-only w.r.t. DecisionState |
| **Decision Strategy / Story / Move** | Optional guidance composition into Session envelope | No Cognitive authorship in Kernel; no DecisionState writes |
| **Priority / FAQ / AI** | Experience peers on one Interpretation | Share one Session mind (Living Experience) |
| **Object Package** | Bound input; truth outside Session | Opaque to Core; not Session-owned |
| **Decision Filter** | Not defined as Session type here | Open Question |
| **Decision Report** | Presentation/design concept | Not Cognitive Session contract |

---

## 11. Mutation Rules

1. Experience / host MAY emit Signals into Runtime.
2. Kernel MUST advance Cognitive Session state only by:
   - `reduce(previousDecisionState, signal)` → next DecisionState
   - `project(nextDecisionState)` → Interpretation
   - optional Strategy → Decision Story
   - atomic RuntimeState commit
3. Direct mutation of DecisionState fields MUST NOT occur.
4. Interpretation MUST NOT write DecisionState.
5. Strategy MUST NOT write DecisionState.
6. Object Package MUST NOT be mutated by Session progression.
7. After `destroy`, mutation MUST fail (RI-001).

---

## 12. Persistence Boundary

| Inside Session (MVP) | Outside Session |
| --- | --- |
| DecisionState in Runtime memory | Durable DB / CRM profiles |
| Interpretation / Story snapshots in Runtime memory | LocalStorage / URL-encoded state (rejected MVP — ADR-007) |
| Signal history as DecisionState data | Backend session restore (future ADR only) |
| Runtime `version` / status | Experience-local UI-only state |

**MVP:** Active Experience only. Reload, new tab, or `destroy` starts a **fresh** DecisionState after `load` (ADR-007).

This RI MUST NOT prescribe storage engines, schemas, or sync protocols.

---

## 13. Invariants

1. At most one active Decision Session per Runtime instance in MVP.
2. DecisionState is the only Cognitive aggregate in the Session.
3. Only `reduce()` produces the next DecisionState.
4. Only `project()` produces Interpretation.
5. Interpretation never writes DecisionState.
6. Kernel never authors Stories.
7. Session Cognitive memory is Runtime-hosted for the active Experience only (MVP).
8. Experience does not reconstruct DecisionState as architecture.
9. Pipeline order remains `Signal → reduce → DecisionState → project → Interpretation`.
10. RI-001 Runtime responsibilities remain unchanged by this RI.

---

## 14. Error Handling

| Case | Observable behavior |
| --- | --- |
| Mutate after dispose | Reject per RI-001; no Session change |
| `reduce` / `project` throw | Reject; prior Session Cognitive snapshots retained |
| Observe before activation | `decisionState` / `interpretation` may be absent; host MUST NOT treat as active Session |
| Corrupted / inconsistent snapshots | Non-conformant implementation; recovery = new Runtime + `load` (MVP) |
| Experience writes DecisionState | Contract violation (non-conformant) |

---

## 15. Observability

| Channel | Session relevance |
| --- | --- |
| **Events** | Signals applied; RuntimeEvents per RI-001 |
| **Metrics** | MAY count Signal applications / `version` — not mandated |
| **Diagnostics** | `getState()` Cognitive fields; subscriber stream |
| **Logging** | SHOULD include Signal `type` and `version` on Cognitive failures; MUST NOT require logging Object Package marketing content |
| **Traceability** | Ordered `signals` + monotonic `version` |

---

## 16. Conformance Requirements

Black-box against Runtime-observable Session behavior:

| # | Test |
| --- | --- |
| S1 | After successful `load`, Session snapshot includes DecisionState and Interpretation |
| S2 | `applySignal` changes DecisionState only consistently with Cognitive rules for that Signal |
| S3 | Interpretation updates without Experience writing DecisionState |
| S4 | Identical initial state + Signal sequence → identical DecisionState and Interpretation |
| S5 | `destroy` ends Session; further `applySignal` fails |
| S6 | New `load` after destroy (new Runtime) yields fresh DecisionState (no silent restore) |
| S7 | Priority / FAQ / AI consumers can share one Interpretation from one Session |
| S8 | No public requirement to import Kernel to observe Session |
| S9 | Decision Story, when present, does not appear as an Interpretation field inventing Story authorship in Cognitive Layer |

---

## 17. Implementation Guidance

Non-normative.

### Recommended organization

- Keep Session as a **conceptual boundary**, not necessarily a separate class name.
- Prefer RuntimeState Cognitive fields as the Session snapshot.
- Keep DecisionState pure data (ADR-002).

### Recommended decomposition

- Cognitive: DecisionState + reduce + project
- Hosting: Runtime / StateManager
- Guidance: Strategy composer injection
- Presentation: Experience only

### Known risks

- Treating “Decision Session” as a second writable aggregate beside DecisionState
- Persisting UI chat transcript as Cognitive truth
- Assuming CommandRuntime `ExperienceModel` is the Session contract
- Inventing Session suspend/expire without ADR
- Confusing design “Decision Report” with Session

---

## 18. Examples

Informative only.

### 18.1 Single visitor walkthrough

```text
runtime = createRuntime()
await runtime.load(housePackage)     // Session active
runtime.applySignal(roomOpened)
runtime.applySignal(prioritySelected)
// Priority, FAQ, AI all read same interpretation
runtime.destroy()                    // Session disposed
```

### 18.2 Fresh Session after reload

```text
// previous Runtime destroyed or page reloaded
runtime2 = createRuntime()
await runtime2.load(housePackage)    // fresh DecisionState — no MVP restore
```

### 18.3 Optional Story in Session envelope

```text
runtime = createRuntime({ storyComposer })
await runtime.load(housePackage)
runtime.applySignal(signal)
// decisionStory updated by Strategy; DecisionState still only via reduce
```

---

## 19. Open Questions

Do not treat as resolved by this RI.

| # | Ambiguity | Smallest clarification candidate |
| --- | --- | --- |
| Q1 | Is Decision Session a **distinct public type**, or only a **named boundary** over RuntimeState Cognitive fields? | Editorial ADR: “Session = active Experience Cognitive envelope; no second aggregate.” |
| Q2 | Portable **sessionId** / correlation id across hosts | ADR if product needs cross-system trace ids |
| Q3 | Explicit Session status (`completed` / `abandoned`) vs RuntimeStatus only | ADR if product completion is first-class |
| Q4 | **Decision Filter** — historical product term vs Session responsibility | Define or retire Filter in product vocabulary ADR |
| Q5 | **Decision Report** vs Session — report as Experience surface only? | Confirm in Experience RI; keep design docs non-Cognitive |
| Q6 | Whether AI turn transcript belongs in DecisionState later | Signal/facts ADR; until then UI-local remains non-authoritative |
| Q7 | Mid-Session Object Package replacement without destroy | Not defined; likely forbidden without ADR |
| Q8 | Mapping Epoch I “Working Object / Evidence / Runtime Memory” labels to exact fields | Keep ADR-002 field names normative; treat Epoch I as retrospective |

---

## 20. Versioning and change control

- Status **Frozen**, Version **1.0**.
- Editorial clarifications that do not change Public Contract, invariants, purity, execution semantics, or conformance MAY proceed without Version bump (ESS-001 §11).
- Public Contract changes MUST increment Version.
- Architecture changes require ADR before RI revision.

### Changelog

| Version | Date | Notes |
| --- | --- | --- |
| 1.0 | 2026-07-21 | Initial Frozen RI consolidating Decision Session boundary around DecisionState / RI-001 |

---

## 21. Quality checklist (ESS-001)

- [x] Required ESS sections present (merged with work-package structure)
- [x] Terminology aligned with Reference Architecture / ADR-002 / RI-001
- [x] No new architectural concepts (Session = named boundary; DecisionState remains sole aggregate)
- [x] RFC 2119 language
- [x] Implementation-independent
- [x] Pure / Stateful declarations
- [x] Execution Semantics defined
- [x] Black-box conformance tests
- [x] Error model defined
- [x] Version / Status metadata present

---

## 22. EQS-001 gates (documentation-only)

| Gate | Result |
| --- | --- |
| Architecture | Pass — no new concepts; pipeline unchanged; Runtime contract unchanged |
| Implementation | N/A — documentation-only |
| Documentation | Pass — RI-002 + index / cross-ref updates |
| Testing | N/A — no code |
| Conformance | Pass — S1–S9 defined |
| Naming | Pass — Decision Session / DecisionState relationship explicit |
| Dependencies | N/A — docs only |
| Complexity | Pass — consolidation of existing sources |
| Backward compatibility | Pass — does not modify RI-001 API |

**Definition of Done:** documentation-only RI delivered; Runtime Public Contract unmodified; commit created.
