# ED-DA-01 — Decision Architecture Boundary Hardening

| Field | Value |
| --- | --- |
| **ID** | ED-DA-01 |
| **Status** | **PASS (partial)** — session pipeline hardened; Client Studio dual-stack retirement remains |
| **Date** | 2026-07-22 |
| **Depends on** | CAP-DST-001, CAP-DST-002, CAP-OUT-001, CAP-DTR-001, CAP-AI-001 |
| **Freeze** | Unchanged — [Decision Architecture v1.0](../decision-architecture-v1.0-freeze.md) |

---

## Goal

Harden Decision Architecture boundaries without changing Runtime behaviour.

---

## 1. Boundary verification

| Artifact | Sole author | Verified |
| --- | --- | --- |
| Interpretation | `interpretDecisionSession` | PASS |
| Decision Story | `composeDecisionStory` | PASS |
| Decision Moves | `composeDecisionMoves(story)` | PASS |
| Decision Outcome | `composeDecisionOutcome(moves)` | PASS |
| Decision Terminal | `composeDecisionTerminal(outcome)` | PASS |
| AI Context | `composeAIContext(terminal)` | PASS |

Ownership map: [`packages/runtime/src/session/OWNERSHIP.md`](../../packages/runtime/src/session/OWNERSHIP.md)

---

## 2. Dependency verification

```text
Interpretation → Story → Moves → Outcome → Terminal → AIContext
```

| Check | Result |
| --- | --- |
| No reverse deps inside `@embed-engine/runtime` session composers | **PASS** |
| No Story → AI / Outcome → AI (direct) / Story → Terminal | **PASS** |
| Cross-package legacy dual stack (`@embed-engine/core` interpretAndCompose) | **OPEN** — documented; retirement remains ED-DA-01 residual |

---

## 3. Runtime ownership

| Check | Result |
| --- | --- |
| Only Runtime creates Story / Moves / Outcome / Terminal / AIContext | **PASS** (session pipeline) |
| Client Studio does not call `compose*` for session artifacts | **PASS** |
| Mutations via `dispatch(command)` only | **PASS** |

---

## 4. Contract / export audit

| Finding | Disposition |
| --- | --- |
| Pipeline helpers (`compose*`, `evaluate*`, `applyDecisionEvent`, …) still exported | Documented as non-Experience surface (ED-DA-03 residual) — no breaking removal this pass |
| Flat `SessionExperience` + nested `context.decision.*` duplication | Documented — ED-DA-05 residual |
| Provider exposes `runtime` + `interpretation` | Documented prefer-`experience.context` — ED-DA-04 residual |

---

## 5. Experience boundary

| Check | Result |
| --- | --- |
| Hero / Gallery / Navigator consume `experience.context` | **PASS** |
| Priority Engine / Decision Terminal UI still on cognitive `interpretAndCompose` | **OPEN** — dual semantic producer (AR-001 R-01) |

---

## 6. AI boundary

| Check | Result |
| --- | --- |
| `composeAIContext` Terminal-only | **PASS** |
| No prompts / NL in AIContext | **PASS** |
| AI Advisor UI not yet bound to `context.decision.ai` | **OPEN** — consumption gap (adapter work, not ownership violation) |

---

## Code changes (this pass)

Behaviour-preserving only:

- `packages/runtime/src/session/OWNERSHIP.md` — ownership SSOT
- Export / barrel policy comments (`runtime` + `session` index)
- `BoundaryOwnership.test.ts` — chain guards
- Provider / legacy core JSDoc clarifying cognitive vs session SSOT
- Engineering Debt status update

---

## Tests

Runtime suite including `BoundaryOwnership.test.ts` must pass (no behavioural regressions).

---

## Remaining hardening (do not redesign Freeze)

| ID | Work |
| --- | --- |
| ED-DA-01 residual | Retire Client Studio `interpretAndCompose` dual stack |
| ED-DA-02 | Room media / hero projection ownership |
| ED-DA-03 | Narrow public exports (breaking façade) |
| ED-DA-04 | Provider = Experience Context only |
| ED-DA-05 | Collapse flat SessionExperience fields |
| ED-DA-06 | Injectable clock |

---

## Compliance assessment

| Criterion | Status |
| --- | --- |
| Runtime pipeline unchanged | **Met** |
| Behaviour unchanged | **Met** |
| Public contracts preserved | **Met** |
| Freeze unmodified | **Met** |
| Session ownership single-author | **Met** |
| Presentation / AI not authors of session artifacts | **Met** (composition); dual-stack UI consumption **Open** |
