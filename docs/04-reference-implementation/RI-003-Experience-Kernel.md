# RI-003 — Experience Kernel

| Field | Value |
| --- | --- |
| **ID** | RI-003 |
| **Title** | Experience Kernel |
| **Status** | Frozen |
| **Version** | 1.0 |
| **Date** | 2026-07-21 |
| **Owner** | Platform Architecture |
| **Document type** | Reference Implementation Specification (documentation-only; implementation follows) |
| **Conforms to** | [ESS-001](../03-specification-standard/ESS-001-Embed-Specification-Standard.md) v1.0, [EQS-001](../03-specification-standard/EQS-001-Engineering-Quality-Standard.md) v1.0 |
| **Depends On** | Reference Architecture v1.0, [RI-001](./RI-001-Runtime-Kernel.md), [RI-002](./RI-002-Decision-Session.md), [Living Experience v0.1](../architecture/living-experience-v0.1-freeze.md), [Decision Layer Governance v1](../architecture/decision-layer/decision-layer-governance-v1.md), [experience-projection.md](../architecture/experience-projection.md), ADR-003, ADR-008 (Proposed), ADR-009 |
| **Related Documents** | [decision-layer/README.md](../architecture/decision-layer/README.md), [RUNTIME.md](../architecture/RUNTIME.md), [ADR-006](../architecture/adr/ADR-006-interpretation-projection-layer.md) (historical ReactExperienceModel path) |
| **RFC 2119** | Per ESS-001 §3 |

---

## 1. Purpose

The **Experience Kernel** is the implementation contract for the **Experience Layer**: the set of **Experience Surfaces** that present one Decision Session and return user intent as **Signals**.

It exists so implementers can wire presentation without touching Cognition, Strategy, or Runtime internals.

| Concept | Role | Experience Kernel relation |
| --- | --- | --- |
| **Runtime** | Orchestrates Cognitive pipeline; hosts Session (RI-001) | Experience binds to Runtime; does not replace it |
| **Decision Session** | Active journey boundary (RI-002) | Experience observes Session snapshots; does not own them |
| **Interpretation** | Derived meaning | Primary Cognitive input to most surfaces |
| **Decision Story** | Guided Moves | Input to Decision Terminal |
| **Object Package** | Object truth | Not read raw by Experience; arrives via Interpretation / projected fields |
| **UI components / framework** | Pixels | Outside this contract — hosts choose technology |

**Note:** “Experience Kernel” names this RI contract. It is **not** the Runtime Kernel and MUST NOT place Decision Terminal or surfaces inside Runtime / Cognitive Kernel (Decision Layer SSOT).

---

## 2. Responsibilities

### Owns

- Composition of **Experience Surfaces** for one active Session
- Reading **Interpretation** (and **Decision Story** where Terminal is present)
- Emitting **Signals** for user intent
- Experience-local presentation state that is **not** Cognitive truth
- Keeping peer surfaces coherent on the same Interpretation tick (Living Experience)

### Must not own

| Forbidden | Authority |
| --- | --- |
| DecisionState writes | ADR-003, RI-002 |
| `reduce` / `project` | ADR-003 |
| Decision Strategy / Move library / Behavior Pack rules | Decision Layer |
| Object Package mutation or domain reconstruction | Object Package + Living Experience |
| Runtime / Kernel internals | RI-001 |
| Framework-specific public API (React, DOM, CSS) | ESS-001 |

---

## 3. Composition

Canonical IA (do not invent parallel trees):

```text
Active Experience (one Decision Session)
  ├── Experience Surfaces (peers)
  │     ├── Decision Terminal  → renders Decision Story (+ Interpretation context)
  │     ├── Priority           → renders Interpretation
  │     ├── FAQ                → renders Interpretation
  │     ├── AI Advisor         → renders Interpretation
  │     ├── Recommendation     → renders Interpretation (when present)
  │     └── other guided surfaces as product adds them
  ├── Inputs: Interpretation, optional Decision Story, opaque Object Package binding via Runtime
  └── Outputs: Signals → Runtime.applySignal / Cognitive dispatch
```

| Term | Use in this RI |
| --- | --- |
| **Experience Surface** | Frozen composition unit (Decision Layer) |
| **Scene / Module** | Not frozen Experience IA — host layout concerns; see Open Questions |
| **Asset** | Media/binary resources referenced by Object Package / walkthrough hosts — not Experience Kernel Cognitive contract |

Signals are immutable Cognitive inputs (ADR-003). Experience creates Signal values; Runtime applies them.

---

## 4. Public Contract

Framework-agnostic. Observable behavior only.

### 4.1 Bind

```text
bindExperience({ getSessionSnapshot, subscribeSession, applySignal })
```

| Input | Meaning |
| --- | --- |
| `getSessionSnapshot` | Returns current Session snapshot (Interpretation required when active; Story optional) — RI-002 / RI-001 |
| `subscribeSession` | Notifies on Session snapshot changes |
| `applySignal` | Forwards Signal into Runtime (RI-001) |

### 4.2 Surface obligations

| Surface class | MUST read | MUST emit intent as | MUST NOT |
| --- | --- | --- | --- |
| Interpretation peers (Priority, FAQ, AI, …) | `interpretation` | Signal | Read DecisionState; own Strategy |
| Decision Terminal | `decisionStory` (+ Interpretation context as needed) | Signal (e.g. Move completion / navigation intent) | Author Stories/Moves; sit in Runtime Kernel |

### 4.3 Coherence

When Session `version` advances, all bound surfaces MUST observe the **same** Interpretation (and Story, if present) for that version — Living Experience “one mind.”

### 4.4 Execution Semantics

| Topic | Rule |
| --- | --- |
| Ordering | Signal order matters; host SHOULD serialize user intents |
| Sync | Signal emission into Runtime follows RI-001 (`applySignal` sync) |
| Determinism | Presentation MAY be non-deterministic (animation); Cognitive results MUST remain deterministic via Runtime |
| Concurrency | Undefined if two surfaces emit Signals concurrently without host serialization |

### 4.5 Purity

| Computation | Class | Side effects |
| --- | --- | --- |
| Render from snapshot | Stateful (presentation) | UI only — not DecisionState |
| Emit Signal | Stateful | Runtime Session advance (via RI-001) |
| Derive view-model from Interpretation | Pure if no I/O | MUST NOT invent Cognitive meaning absent from Interpretation/Story |

---

## 5. Lifecycle

| Phase | Behavior |
| --- | --- |
| **Creation** | Host constructs Experience binding to a Runtime |
| **Activation** | Session active (`load` succeeded); surfaces may render Interpretation |
| **Interaction** | User acts → Signal → Runtime → new snapshot → surfaces update |
| **Update** | Every Session `version` bump refreshes peer surfaces |
| **Completion** | Product UX may show commitment/outcome; no separate Experience status frozen — Session/Runtime lifecycle remains authority (RI-002) |
| **Disposal** | Unbind subscriptions; Runtime `destroy` ends Session (RI-001) |

---

## 6. Runtime Interaction

| Direction | Contract |
| --- | --- |
| Runtime → Experience | Experience **observes** Runtime/Session via `getState` / `subscribe` (or thin host adapters). Runtime does not “push UI.” |
| Experience → Runtime | Experience **only** communicates intent by `applySignal` / Cognitive `dispatch` carrying a Signal. |
| Activation | Host loads Object Package on Runtime; Experience activates when Session snapshot is ready. |

Do not redefine RI-001 operations.

---

## 7. Decision Session Interaction

| Concern | Rule |
| --- | --- |
| Read | Experience reads Interpretation / optional Story from Session snapshot (RI-002) |
| Write Cognitive | Forbidden — emit Signal instead |
| Visibility | Session changes become visible through subscription / polled snapshot after Runtime commit |
| Local UI state | Allowed (e.g. open panel, draft text) — MUST NOT be treated as Session truth |

---

## 8. Rendering Boundary

```text
Experience Kernel (this RI)     → what to show from Interpretation/Story; what Signal to emit
Renderer / UI / Framework       → how pixels are produced (out of contract)
```

| Layer | Allowed |
| --- | --- |
| Experience Kernel | Surface roles, Signal mapping, coherence rules |
| Rendering | Layout, widgets, accessibility — host-specific |
| UI framework | React/etc. — implementation detail, not Public Contract |

Historical `ReactExperienceModel` / CommandRuntime path is **not** the Cognitive Experience contract (Living Experience; ADR-006 annotation).

---

## 9. State Boundary

| State | Owner | Experience may |
| --- | --- | --- |
| RuntimeState | Runtime | Observe status/version |
| Decision Session / DecisionState | Session / `reduce` | Observe via Interpretation only (not DecisionState) |
| Interpretation / Story | `project` / Strategy | Read |
| Experience-local | Experience host | Read/write for presentation only |

No overlapping Cognitive ownership.

---

## 10. Observability

| Channel | Minimum |
| --- | --- |
| Events | Signal emissions (type); Session `version` observed |
| Metrics | MAY count Signals per surface — optional |
| Diagnostics | Log Signal type + Session version on failed apply |
| Tracing | Correlate UI intent → Signal → Session version |

---

## 11. Invariants

1. Experience never writes DecisionState.
2. Experience never owns Strategy / Move libraries / Behavior Pack rules.
3. Renderers never reconstruct domain state from Object Package.
4. Peer surfaces share one Interpretation per Session version.
5. Decision Terminal is Experience Layer only — never Runtime Kernel.
6. Public Experience contract stays framework-agnostic.
7. RI-001 and RI-002 remain unchanged by this RI.

---

## 12. Error Handling

| Case | Behavior |
| --- | --- |
| Render before Session ready | Show inert/empty presentation; do not invent Interpretation |
| `applySignal` after Runtime destroy | Fail per RI-001; Experience SHOULD disable input |
| Missing Story for Terminal | Terminal MUST NOT invent Moves; MAY hide or show empty guidance |
| Surface invents Cognitive meaning | Non-conformant |

---

## 13. Conformance Requirements

| # | Observable check |
| --- | --- |
| E1 | Bound surfaces update when Session `version` changes |
| E2 | User intent reaches Runtime only as Signal |
| E3 | No Experience code path writes DecisionState |
| E4 | Priority/FAQ/AI (when present) reflect the same Interpretation after one Signal |
| E5 | Terminal (when present) renders Story without embedding Strategy rules |
| E6 | Public Experience API types/docs do not require a specific UI framework |
| E7 | Experience does not import Behavior Pack composition rules |

---

## 14. Implementation Guidance

Non-normative. Prefer simplicity.

1. One Session subscription at the Experience root; pass Interpretation down.
2. Map UI events → existing Signal types; do not add Cognitive fields in UI.
3. Keep Terminal Story rendering separate from Priority/FAQ Interpretation cards.
4. Isolate framework adapters (e.g. React context) behind the bind contract.
5. Do not merge CommandRuntime ExperienceModel into Cognitive surfaces without an ADR.
6. Avoid abstract “Scene engines” until IA freezes that term.

---

## 15. Examples

Informative.

### 15.1 Synchronized peers

```text
subscribeSession(snapshot => {
  priority.render(snapshot.interpretation)
  faq.render(snapshot.interpretation)
  ai.render(snapshot.interpretation)
})
onPriorityClick(id => applySignal(prioritySignal(id)))
```

### 15.2 Terminal Move completion

```text
terminal.render(snapshot.decisionStory)
onMoveComplete(moveId => applySignal(moveCompletedSignal(moveId)))
```

### 15.3 Local UI vs Session

```text
localDraft = ""           // Experience-local
onSend => applySignal(aiTurnSignal(localDraft))  // becomes Cognitive only after reduce
```

---

## 16. Open Questions

| # | Ambiguity | Note |
| --- | --- | --- |
| Q1 | Formal type name `ExperienceKernel` vs host module only | Implement as binding + surfaces; type name optional |
| Q2 | **Scene / Module** vocabulary in product IA vs Experience Surfaces | Do not treat as Cognitive architecture until ADR |
| Q3 | Asset loading ownership (walkthrough host vs Experience) | Keep media I/O in host; Signals for meaning |
| Q4 | ADR-008 Terminal implementation gate still Proposed | Follow ADR-008 before production Terminal slice |
| Q5 | Dual CommandRuntime ExperienceModel coexistence | Living Experience debt; Cognitive path is normative here |
| Q6 | Recommendation surface readiness | Peer pattern same as Priority when product enables it |

---

## 17. Versioning

Frozen v1.0. Public Contract changes require Version bump (ESS-001 §11).

| Version | Date | Notes |
| --- | --- | --- |
| 1.0 | 2026-07-21 | Initial Frozen Experience Layer implementation contract |

---

## 18. Quality checklist (ESS-001)

- [x] Metadata, Purpose, Public Contract, Execution Semantics, Purity, Invariants, Errors, Conformance, Versioning
- [x] No new architecture concepts; Surfaces / Signals / Interpretation / Story only
- [x] Framework-independent
- [x] RI-001 / RI-002 unmodified in meaning

---

## 19. EQS gates (docs-only)

| Gate | Result |
| --- | --- |
| Architecture | Pass |
| Implementation | N/A (spec only; impl follows) |
| Documentation | Pass |
| Testing | N/A |
| Conformance | E1–E7 defined |
| Naming | Pass — Experience Kernel = Experience Layer contract |
| Backward compatibility | Pass — no Runtime/Session API change |
