# RI-001 — Runtime Kernel

| Field | Value |
| --- | --- |
| **ID** | RI-001 |
| **Title** | Runtime Kernel |
| **Status** | Frozen |
| **Version** | 1.0 |
| **Date** | 2026-07-21 |
| **Owner** | Platform Architecture |
| **Document type** | Reference Implementation Specification (documentation-only) |
| **Conforms to** | [ESS-001](../03-specification-standard/ESS-001-Embed-Specification-Standard.md) v1.0, [EQS-001](../03-specification-standard/EQS-001-Engineering-Quality-Standard.md) v1.0 |
| **Depends On** | Reference Architecture v1.0 (Conceptual Freeze), [ADR-001](../architecture/adr/ADR-001-runtime-architecture.md), [ADR-002](../architecture/adr/ADR-002-decision-state.md), [ADR-003](../architecture/adr/ADR-003-cognitive-processing-pipeline.md), [Living Experience v0.1 Freeze](../architecture/living-experience-v0.1-freeze.md), [Decision Layer Governance v1](../architecture/decision-layer/decision-layer-governance-v1.md) |
| **Referenced Documents** | [ADR-006](../architecture/adr/ADR-006-interpretation-projection-layer.md), [ADR-009](../architecture/adr/ADR-009-decision-layer.md), [ADR-010](../architecture/adr/ADR-010-decision-strategy.md), [RUNTIME.md](../architecture/RUNTIME.md), [Runtime Boundaries](../architecture/runtime-boundaries.md) (supporting), [CommandRuntime archive](../architecture/archive/runtime-decisions-command-runtime-v1.md) (historical), [PROJECT-MAP](../PROJECT-MAP.md), [architecture/README.md](../architecture/README.md) |
| **RFC 2119** | Per ESS-001 §3 |

---

## 1. Purpose

The **Runtime Kernel** is the execution core of Embed Engine.

It exists to provide a **stable, domain-agnostic orchestration façade** that:

- owns application lifecycle for a bound Object Package,
- coordinates the frozen Cognitive pipeline without owning Cognitive rules,
- exposes a minimal public API to Experience and application hosts,
- keeps business logic, UI, rendering, and domain rules outside Core.

Per [ADR-001](../architecture/adr/ADR-001-runtime-architecture.md):

- **Runtime** is the only public entry point into CORE.
- **Kernel** is the internal orchestrator owned by Runtime.
- Together they form the platform execution unit specified by this RI.

This document is a **specification only**. It does not authorize production redesign, new architecture concepts, or Experience-model changes.

---

## 2. Scope

### 2.1 In scope

- Public Runtime contract and lifecycle
- Kernel orchestration responsibilities and non-responsibilities
- Interaction with Cognitive pipeline (`Signal → reduce → DecisionState → project → Interpretation`)
- Optional hosting of Decision Strategy composition (input injection only; Strategy owns authorship)
- RuntimeState ownership and status model
- Determinism, error, observability, and conformance obligations for implementers

### 2.2 Out of scope

- Implementation of `reduce()` / `project()` algorithms
- Decision Strategy rules, Behavior Pack contents, Move libraries
- Experience rendering (Decision Terminal, Priority, FAQ, AI, …)
- Object Package domain schemas
- Persistence / multi-session restore (postponed by Living Experience / ADR-007)
- Merging or retiring the historical CommandRuntime path (see Open Questions)
- Any change to Platform Canon, Reference Architecture, ESS, or EQS

---

## 3. Normative language

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119), per ESS-001 §3.

Non-normative text is marked **Note:**, **Rationale:**, **Example:**, or placed under Implementation Guidance / Examples / Open Questions.

---

## 4. Architecture alignment

This RI uses only concepts already established by Reference Architecture and accepted/frozen ADRs:

| Concept | Role in this RI | Canonical source |
| --- | --- | --- |
| Runtime | Public façade; lifecycle; Kernel ownership | ADR-001 |
| Kernel | Internal orchestrator; not public API | ADR-001 |
| RuntimeState | Single source of truth for Runtime; single owner | ADR-001 |
| EventDispatcher / StateManager / ModuleRegistry | Infrastructure services coordinated by Kernel | ADR-001 |
| Signal, `reduce()`, DecisionState, `project()`, Interpretation | Cognitive pipeline orchestrated, not authored, by Kernel | ADR-003, Living Experience v0.1 |
| Decision Strategy → Decision Story → Decision Move | Decision Layer; Kernel MUST NOT author Stories | Decision Layer Governance v1, ADR-010 |
| Experience | Renders; emits Signals; MUST NOT reconstruct domain meaning | Living Experience v0.1, Decision Layer Governance v1 |
| Object Package | Bound input to Runtime; not owned by Runtime | product Object Package + ADR-001 `load` |

Frozen Cognitive pipeline (MUST NOT be redefined):

```text
Signal → reduce() → DecisionState → project() → Interpretation
```

Platform map (informative pointer):

```text
Knowledge:     Object Package + Behavior Pack
Kernel:        Signal → reduce → DecisionState → project → Interpretation
Decision Layer: Decision Strategy → Decision Story → Decision Move
Experience:    Decision Terminal · Priority · FAQ · AI · …
```

---

## 5. Responsibilities

### 5.1 Runtime owns

| Responsibility | Source |
| --- | --- |
| Public API surface of CORE | ADR-001 |
| Lifecycle (`create` → `load` → execute → `destroy`) | ADR-001 |
| Ownership of a single Kernel instance | ADR-001 |
| Rejecting operations after destroy | ADR-001 façade + Living Experience destroy semantics |

### 5.2 Kernel owns

| Responsibility | Source |
| --- | --- |
| Coordinate infrastructure services | ADR-001 |
| Orchestrate Cognitive pipeline invocation (`reduce` then `project`) | Living Experience v0.1; ADR-003 (Runtime does not *implement* Cognitive logic) |
| Atomic RuntimeState replacement via StateManager | ADR-001 |
| Listener notification on state change | ADR-001 |
| Module registration lookup infrastructure (no execution logic in registry) | ADR-001 |
| Optional invocation of an injected Decision Strategy composer (hosting only) | ADR-010 (Strategy authors Story; R1 hosting risk named) |

### 5.3 Explicit non-responsibilities

Runtime / Kernel MUST NOT:

| Non-responsibility | Source |
| --- | --- |
| Contain business / domain rules | ADR-001; CommandRuntime-era Core Mission (historical) |
| Contain UI, React, HTML, widgets, layout | Living Experience v0.1; Foundation Runtime ≠ UI |
| Implement Cognitive `reduce` / `project` logic | ADR-003 |
| Author Decision Stories or Move graphs | Decision Layer Governance v1; ADR-010 |
| Own Object Package truth | Object Package product contract |
| Own Experience rendering or presentation models | ADR-001 Out of Scope; Experience Layer |
| Merge Presentation layers with DecisionState / Interpretation | Runtime Boundaries |
| Invent Priority scoring or recommendation rules | Living Experience invariants |

---

## 6. Public Contract

### 6.1 Factory

```text
createRuntime(options?): Runtime
```

| Item | Requirement |
| --- | --- |
| **Input** | Optional configuration. MAY include an injected Decision Strategy composer. MUST NOT require domain packages in Core. |
| **Output** | A Runtime instance in status `idle` |
| **Purity** | Stateful (constructs Runtime / Kernel) |
| **Execution** | Synchronous construction |

### 6.2 Operations

| Operation | Signature (conceptual) | Sync | Precondition | Effect |
| --- | --- | --- | --- | --- |
| `load` | `load(objectPackage): Promise<void>` | Async | Status ≠ `destroyed` | Bind opaque Object Package; initialize Cognitive snapshots; status `loading` → `ready` |
| `dispatch` | `dispatch(event): Promise<void>` | Async | Status ≠ `destroyed` | Route opaque RuntimeEvent; MAY apply Cognitive Signal when event carries one |
| `applySignal` | `applySignal(signal): void` | Sync | Status ≠ `destroyed` | Orchestrate Cognitive pipeline (+ optional Strategy); bump RuntimeState version; notify subscribers |
| `getState` | `getState(): RuntimeState` | Sync | Always | Return immutable snapshot of current RuntimeState |
| `subscribe` | `subscribe(listener): Unsubscribe` | Sync | Status ≠ `destroyed` | Register listener; return unsubscribe |
| `destroy` | `destroy(): void` | Sync | Any | Transition to `destroyed`; clear listeners; subsequent mutating ops MUST fail |

**Note:** ADR-001 lists `createRuntime`, `load`, `dispatch`, `getState`, `subscribe`, `destroy` as the stable public API. Living Experience v0.1 freezes `applySignal` as the Cognitive execution entry used by synchronized Experiences. Both are part of this RI’s Public Contract for the Cognitive Runtime path. See Open Questions for the historical CommandRuntime contract.

### 6.3 Inputs (boundary shapes)

| Input | Opacity / shape rule |
| --- | --- |
| `objectPackage` | Opaque to Core. Concrete schemas live in domain packages. Runtime MUST NOT treat Object Package as part of its public type contract beyond binding. |
| `RuntimeEvent` | Opaque event with at least a `type: string`. Domain modules define concrete types. |
| `Signal` | Immutable Cognitive input defined by Cognitive Layer / ADR-003. Runtime MUST pass Signals through to `reduce` without mutating them. |
| Strategy composer (optional) | Injected function/object that composes a Decision Story from Interpretation-derived inputs + Behavior Pack knowledge. Kernel MUST NOT embed Strategy rules. |

### 6.4 Outputs

| Output | Meaning |
| --- | --- |
| `RuntimeState` | Sole public observable Runtime snapshot (status, version, bound package handle, DecisionState, Interpretation, optional Decision Story) |
| Listener callbacks | Receive RuntimeState snapshots after replacements |
| Thrown errors | Observable rejection for destroyed Runtime and documented precondition failures |

Runtime MUST NOT require Experience to read Kernel, StateManager, EventDispatcher, or ModuleRegistry directly.

### 6.5 Expected behavior

1. After `load`, RuntimeState MUST expose initialized DecisionState and Interpretation consistent with `createInitialDecisionState` + `project` for the bound object identity.
2. Each successful `applySignal` MUST:
   - obtain previous DecisionState (or initialize if absent),
   - compute next DecisionState solely via `reduce(previous, signal)`,
   - compute Interpretation solely via `project(decisionState)`,
   - optionally recompose Decision Story via injected Strategy,
   - replace RuntimeState atomically and increment `version`,
   - notify subscribers with the new snapshot.
3. Identical starting RuntimeState Cognitive fields + identical Signal sequence MUST yield identical DecisionState and Interpretation (Cognitive determinism). Strategy output determinism follows the Strategy specification when a composer is injected.
4. Experience MUST observe meaning through Interpretation / Story snapshots and MUST emit Signals; Experience MUST NOT write DecisionState.

### 6.6 State transitions (summary)

```text
[createRuntime] → idle
idle|ready --load--> loading --(success)--> ready
* --destroy--> destroyed
ready --applySignal--> ready (version++)
destroyed --(mutating ops)--> error (no state change)
```

### 6.7 Execution Semantics

| Topic | Rule |
| --- | --- |
| Ordering | Signal / command order is significant. Later Signals see DecisionState produced by earlier ones. |
| Concurrency | Concurrent mutating calls (`load`, `dispatch`, `applySignal`, `destroy`) are **undefined** unless an implementation documents serialization. Conformant hosts SHOULD serialize mutating calls per Runtime instance. |
| Timing | No wall-clock timing assumptions for Cognitive correctness. |
| Sync vs async | `applySignal`, `getState`, `subscribe`, `destroy` are synchronous. `load` and `dispatch` are asynchronous. |
| Determinism | Cognitive path (`reduce` / `project`) MUST be deterministic for identical inputs. Listener notification order among subscribers is unspecified unless documented by the implementation. |
| Side effects | Stateful: RuntimeState replacement, listener notification, optional Strategy invocation. MUST NOT perform UI I/O or network I/O as part of Core contract. |

### 6.8 Purity declarations

| Computation | Classification | Observable side effects |
| --- | --- | --- |
| `createRuntime` | Stateful | Constructs Runtime / Kernel |
| `load` | Stateful | Status transitions; RuntimeState fields set |
| `dispatch` | Stateful | Event routing; MAY trigger `applySignal` |
| `applySignal` | Stateful | DecisionState replacement via `reduce`; Interpretation via `project`; optional Story; version++; notify |
| `getState` | Pure w.r.t. Runtime mutation | Returns snapshot; MUST NOT mutate RuntimeState |
| `subscribe` / unsubscribe | Stateful | Listener set mutation |
| `destroy` | Stateful | Status `destroyed`; listeners cleared |
| `reduce` / `project` (invoked) | Pure (Cognitive) | No Runtime I/O; values returned only |
| Strategy composer (optional) | Per Strategy spec | MUST NOT be treated as Kernel authorship |

---

## 7. Lifecycle

### 7.1 Initialization

1. Host calls `createRuntime(options?)`.
2. Runtime constructs Kernel and infrastructure services.
3. RuntimeState status is `idle`, `version` is `0`, Decision Story is absent/null.

### 7.2 Configuration

- Object Package binding occurs via `load`, not via global configuration.
- Optional Strategy composer MAY be supplied at construction (hosting injection).
- Runtime MUST remain domain-agnostic: no House-specific imports in Core.

### 7.3 Execution

While status is `ready` (and for `applySignal`, also when advancing from `idle` toward ready Cognitive snapshots as documented by implementation):

- Host / Experience emits Signals (directly via `applySignal` or via `dispatch` carrying a Cognitive Signal).
- Kernel orchestrates Cognitive pipeline and optional Strategy.
- Subscribers receive updated RuntimeState.

### 7.4 Shutdown

- Host calls `destroy()`.
- Status becomes `destroyed`.
- Listeners are cleared.
- Further mutating operations MUST fail with a clear error.
- `destroy` on an already destroyed Runtime MUST be a no-op.

### 7.5 Failure recovery

| Failure | Recovery |
| --- | --- |
| Operation on destroyed Runtime | Reject; no state change; host MUST create a new Runtime |
| Invalid Signal / reduce rejection | Per Cognitive Layer error model; if `reduce` throws, RuntimeState MUST remain unchanged for that call |
| `load` failure | Implementation MUST NOT leave status as `ready` with incomplete Cognitive initialization; prefer failed load leaving non-ready status or rethrow before ready commit |
| Strategy composer failure | MUST NOT corrupt DecisionState / Interpretation already computed; failure policy: reject call without committing Story-only partial writes — see Open Questions if Strategy errors are underspecified |

There is **no** automatic multi-session restore in MVP (Living Experience / ADR-007).

---

## 8. Execution Model

### 8.1 Dispatch / signal flow

```text
Experience / Host
      │
      │  Signal (or RuntimeEvent carrying Signal)
      ▼
Runtime (public façade)
      │
      ▼
Kernel
      ├── EventDispatcher (route opaque events; no business logic)
      ├── reduce(previous DecisionState, Signal) → next DecisionState
      ├── project(DecisionState) → Interpretation
      ├── [optional] Strategy composer → Decision Story
      └── StateManager.replace → notify listeners
```

### 8.2 Execution order

For each Cognitive Signal application, Kernel MUST invoke in this order:

1. `reduce`
2. `project`
3. optional Strategy composition (if configured)
4. atomic RuntimeState commit + notify

Kernel MUST NOT write DecisionState except by accepting `reduce` output. Kernel MUST NOT write Interpretation except by accepting `project` output.

### 8.3 Module orchestration

ModuleRegistry stores Runtime modules (registration, lookup, duplicate prevention). It contains **no** execution logic (ADR-001). Future module wiring MUST NOT move domain rules into Kernel.

### 8.4 Interaction with Experience

- Experience consumes Interpretation (and Decision Story for Terminal).
- Experience emits Signals; it does not call `reduce` / `project`.
- Experience MUST NOT depend on Kernel internals.
- Multiple Experience surfaces (Priority, FAQ, AI, Terminal) share one mind: one RuntimeState / Interpretation stream (Living Experience v0.1).

### 8.5 Interaction with Decision Session / DecisionState

Reference Architecture vocabulary for the Cognitive aggregate is **DecisionState** (ADR-002). Kernel orchestrates replacement of DecisionState snapshots inside RuntimeState.

**Note:** Epoch I retrospective language also uses “Decision Session.” This RI does not redefine that term. Implementers MUST treat DecisionState as the normative Cognitive aggregate unless a future ADR freezes Decision Session as a distinct public type.

### 8.6 State boundaries

| Boundary | Rule |
| --- | --- |
| RuntimeState vs DecisionState | RuntimeState is infrastructure envelope; DecisionState is Cognitive aggregate |
| Interpretation | Derived; never written back into DecisionState |
| Decision Story | Strategy output; not an Interpretation field; not authored by Kernel |
| Experience local UI state | Allowed for presentation (e.g. chat chrome) but MUST NOT be treated as Cognitive truth |

---

## 9. Dependencies

### 9.1 Mandatory

| Dependency | Why |
| --- | --- |
| Cognitive Layer (`Signal`, DecisionState, `reduce`, `project`, Interpretation) | Frozen pipeline |
| RuntimeState / StateManager ownership model | ADR-001 |
| Opaque Object Package binding | ADR-001 `load` |
| Reference Architecture layer discipline | Conceptual Freeze |

### 9.2 Optional

| Dependency | Why |
| --- | --- |
| Decision Strategy composer injection | ADR-010 hosting; Story for Decision Terminal |
| Behavior Pack (via Strategy / domain modules) | Knowledge for composition — not owned by Kernel |
| EventDispatcher handlers beyond Cognitive Signal | Future routing |

### 9.3 Future

| Dependency | Why |
| --- | --- |
| Decision Trajectory | Future Architecture; not MVP |
| Persisted Runtime / session restore | Postponed |
| Unified Runtime replacing CommandRuntime | Living Experience technical debt |
| Dedicated observability backend | Not frozen |

---

## 10. State Model

### 10.1 RuntimeStatus

| Status | Meaning |
| --- | --- |
| `idle` | Created; no Object Package successfully bound for ready execution |
| `loading` | `load` in progress |
| `ready` | Object Package bound; Cognitive snapshots available for signal application |
| `destroyed` | Terminal; Runtime unusable |

### 10.2 RuntimeState fields (public observable)

| Field | Meaning |
| --- | --- |
| `status` | Lifecycle status |
| `objectPackage?` | Bound opaque package |
| `version` | Monotonic replacement counter |
| `decisionState?` | Cognitive aggregate snapshot |
| `interpretation?` | Derived meaning snapshot |
| `decisionStory?` | Optional Strategy output (`null` when absent) |

RuntimeState MUST have a **single owner** (StateManager). Consumers receive immutable snapshots.

### 10.3 Creation / active / idle / disposed mapping

| Work-package term | RI status |
| --- | --- |
| Creation | `createRuntime` → `idle` |
| Idle | `idle` |
| Active | `ready` (and transient `loading`) |
| Disposed | `destroyed` |

---

## 11. Invariants

A conforming implementation MUST uphold:

1. Runtime is the only public CORE entry; Kernel is not a public API.
2. RuntimeState has exactly one owner; replacements are atomic.
3. Business logic, UI, and domain rules are absent from Runtime / Kernel.
4. Only `reduce()` produces the next DecisionState.
5. Only `project()` produces Interpretation.
6. Interpretation never writes DecisionState.
7. Kernel never authors Decision Stories (Strategy does).
8. Core never imports Object Package domain implementations.
9. Adding a new Object Package MUST NOT require Core changes (Runtime Boundaries).
10. Destroyed Runtime rejects mutating operations.
11. Cognitive pipeline order remains `Signal → reduce → DecisionState → project → Interpretation`.
12. Experience does not reconstruct DecisionState meaning from UI heuristics as architecture.

---

## 12. Error Handling

### 12.1 Expected failures

| Case | Observable behavior |
| --- | --- |
| Mutating call after `destroy` | Reject (throw); RuntimeState unchanged |
| Double `destroy` | No-op |
| Cognitive `reduce` / `project` throw | Call fails; prior RuntimeState retained |
| Invalid opaque event with no handler | `dispatch` completes without Cognitive change unless event maps to Signal application |
| Subscribe after destroy | Reject |

### 12.2 Contract violations

Hosts that:

- call `reduce`/`project` from Experience,
- mutate DecisionState outside `reduce`,
- or import Kernel as application API,

are **non-conformant** even if TypeScript compiles.

### 12.3 Recovery strategy

- Prefer reject-without-commit for failed Cognitive applications.
- Recover by creating a new Runtime after destroy.
- Do not silently invent default domain meaning in Core.

### 12.4 Logging expectations

- Core MAY log infrastructure failures (destroy violations, load failures).
- Core MUST NOT log PII or Object Package marketing content as required behavior.
- Structured diagnostics SHOULD include `status`, `version`, and Signal `type` when logging Cognitive failures (informative).

---

## 13. Observability

| Channel | Requirement |
| --- | --- |
| **Events** | RuntimeEvent routing via EventDispatcher; Cognitive progression observed as RuntimeState versions |
| **Metrics** | Not mandated by frozen architecture. Implementations MAY expose counters for signal applications / version — non-normative |
| **Logging** | See §12.4 |
| **Diagnostics** | `getState()` and `subscribe()` are the primary diagnostic surfaces |
| **Traceability** | Monotonic `version` ties successive Cognitive snapshots; Signal order is the causal log |

---

## 14. Conformance Requirements

Before an implementation is conformant to RI-001, verify **public behavior** (black-box):

| # | Conformance test (conceptual) |
| --- | --- |
| C1 | `createRuntime()` yields status `idle` and `version` `0` |
| C2 | Successful `load` yields status `ready` with DecisionState and Interpretation present |
| C3 | `applySignal` increments `version` and updates DecisionState only through Cognitive rules for that Signal |
| C4 | Same initial state + same Signal sequence → same DecisionState and Interpretation |
| C5 | Subscribers are notified after successful state replacement |
| C6 | `destroy` → status `destroyed`; further `applySignal` / `load` / `dispatch` / `subscribe` fail |
| C7 | Second `destroy` does not throw |
| C8 | Public consumers need only Runtime façade (no Kernel import required) |
| C9 | Runtime / Kernel contain no React / DOM imports |
| C10 | When Strategy composer injected, Story updates without Kernel embedding domain composition rules |
| C11 | Experience path can render from Interpretation without reading DecisionState (Living Experience model) |

Tests MUST NOT require inspecting private Kernel fields.

---

## 15. Implementation Guidance

Non-normative.

### 15.1 Recommended patterns

- Keep Runtime thin: delegate all orchestration to Kernel.
- Keep StateManager as sole writer of RuntimeState.
- Inject Strategy; do not hardcode Pack rules in Core.
- Serialize mutating calls at the host boundary.
- Treat Object Package as opaque in Core.

### 15.2 Recommended structure

- Façade type/module: Runtime + `createRuntime`
- Internal: Kernel, StateManager, EventDispatcher, ModuleRegistry
- Cognitive functions imported as pure deps, not reimplemented

### 15.3 Known pitfalls

- **Dual Runtime:** Client Studio may still host CommandRuntime (`dispatch(command) → ExperienceModel`) beside Cognitive Runtime. Do not silently merge contracts (Living Experience debt).
- **Projection in wrong layer:** Presentation projectors (React ExperienceModel) are not Kernel responsibilities (ADR-006 / Runtime Boundaries).
- **Story authorship in Kernel:** Violates Decision Layer Governance.
- **Assuming `dispatch` returns ExperienceModel:** That is the historical CommandRuntime contract, not ADR-001 Cognitive façade.
- **Concurrent `applySignal`:** Undefined without host serialization.

---

## 16. Examples

Informative only.

### 16.1 Minimal Cognitive session

```text
runtime = createRuntime()
await runtime.load(objectPackage)          // idle → loading → ready
runtime.subscribe(state => render(state.interpretation))
runtime.applySignal(roomOpenedSignal)      // version  n → n+1
runtime.applySignal(prioritySignal)        // shared Interpretation updates all surfaces
runtime.destroy()                          // destroyed
```

### 16.2 Optional Strategy hosting

```text
runtime = createRuntime({ storyComposer })
await runtime.load(objectPackage)
runtime.applySignal(signal)
// RuntimeState.decisionStory updated by composer; Kernel did not author Moves
```

### 16.3 Reject after destroy

```text
runtime.destroy()
runtime.applySignal(signal)  // throws; state unchanged
```

---

## 17. Open Questions

Ambiguities recorded at freeze. Resolved documentation items are marked; remaining items MUST NOT be treated as decided by this RI.

| # | Ambiguity | Smallest clarification candidate |
| --- | --- | --- |
| Q1 | **Platform Canon** is named in Epoch I retrospective but no discrete Canon document was found in-repo for normative citation. | Publish or point to the frozen Canon artifact path. |
| Q2 | **Dual Runtime:** ADR-001 Cognitive façade vs archived CommandRuntime `dispatch(command): ExperienceModel`. Living Experience lists merge as postponed debt. | Single ADR declaring long-term public contract and deprecation path. |
| Q3 | ~~**docs/README SSOT** listed `runtime-decisions.md` as Runtime SSOT~~ | **Resolved (WP-002):** RI-001 is sole Runtime SSOT; CommandRuntime archived; see [RUNTIME.md](../architecture/RUNTIME.md). |
| Q4 | ADR-001 Out of Scope lists Interpretation as outside Runtime Infrastructure, while Living Experience requires Kernel **orchestration** of `project`. | Clarify “out of scope” = no authorship / no rules in Kernel; orchestration remains in scope. |
| Q5 | ADR-010 **R1** — Runtime hosting of Strategy remains an open implementation risk. | Separate RI or ADR for Strategy injection contract (inputs, error policy, purity). |
| Q6 | `applySignal` is frozen by Living Experience but not listed in ADR-001’s original API bullet list. | Editorial ADR-001 amendment listing `applySignal` without behavior change. |
| Q7 | Strategy composer failure / partial commit policy is not frozen. | Specify reject-without-commit for Story errors. |
| Q8 | Concurrent mutating calls are undefined. | Specify single-flight / queue semantics if hosts need guarantees. |
| Q9 | “Decision Session” vs DecisionState terminology from Epoch I retrospective. | ADR if Session becomes a distinct public type; otherwise treat as historical wording. |

---

## 18. Versioning and change control

- Status **Frozen**, Version **1.0**.
- Editorial clarifications that do not change Public Contract, invariants, purity, execution semantics, or conformance MAY proceed without Version bump.
- Any Public Contract change MUST increment Version and record a changelog entry (ESS-001 §11).
- Architecture changes require ADR **before** RI revision (ESS-001).

### Changelog

| Version | Date | Notes |
| --- | --- | --- |
| 1.0 | 2026-07-21 | Initial Frozen Reference Implementation Specification for Runtime Kernel |
| 1.0 | 2026-07-21 | Editorial (WP-002): cross-refs + Q3 resolved; Public Contract unchanged |

---

## 19. Quality checklist (ESS-001)

- [x] All required ESS-001 §6 sections present (merged with RI work-package structure)
- [x] Terminology matches Reference Architecture / Decision Layer / ADR-001 (no new concepts)
- [x] No new architectural concepts without ADR
- [x] RFC 2119 normative language used
- [x] Implementation-independent (no language/framework mandate)
- [x] Computations declare Pure or Stateful
- [x] Side effects documented for Stateful operations
- [x] Public Contract includes Execution Semantics
- [x] Conformance Tests are black-box against Public Contract
- [x] Error model defined
- [x] Version and Status metadata present

---

## 20. EQS-001 gates (documentation-only work item)

| Gate | Result |
| --- | --- |
| Architecture | Pass — no new concepts; pipeline unchanged |
| Implementation | N/A — documentation-only |
| Documentation | Pass — RI-001 + index updates; normative text references SSOT |
| Testing | N/A — no code |
| Conformance | Pass — C1–C11 defined for future impl |
| Naming | Pass — Runtime / Kernel per ADR-001 |
| Dependencies | N/A — docs only |
| Complexity | Pass — specification consolidates existing sources |
| Backward compatibility | Pass — does not change Runtime behavior |

**Definition of Done:** documentation-only RI delivered; Canon / Reference Architecture files unmodified by this work package; commit created.
