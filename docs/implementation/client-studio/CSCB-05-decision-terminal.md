# CSCB-05 — Decision Presentation (Decision Terminal)

| Field | Value |
| --- | --- |
| **Capability** | CSCB-05 — Decision Presentation |
| **Status** | **DONE** |
| **Date** | 2026-07-22 |
| **Commit** | `feat(client-studio): implement decision terminal` |

---

## Implementation summary

Decision Terminal is the canonical Runtime presentation surface. It answers one question:

> Given everything you've explored and what matters to you, what should you pay attention to?

The surface:

- presents Decision Summary, Story, Drivers, and Outcome Cards
- projects Runtime Context only (pass-through DTO)
- never ranks, filters, reorders Story/Moves, or invents semantics
- live-updates via `useDecisionSessionRuntime` when Context changes
- restores from the active Decision Session on reload / navigation

Priority cards remain the intent capture peer (CSCB-04). Terminal is presentation only.

---

## Runtime fields consumed

| Presentation block | Runtime source |
| --- | --- |
| Summary recommendation / status / confidence / next action | `decision.terminal.outcome.*` |
| Summary primary explanation | `decision.story.primaryExplanation` |
| Summary focus room / reason | `decision.focus.focusRoomName`, `focusReason` |
| Story chapters (order preserved) | `decision.story.chapters` |
| Story next step | `decision.story.nextDecisionStep` |
| Moves + active move | `decision.moves.moves`, `activeMoveId` |
| Drivers — priorities | `decision.priorityIds` |
| Drivers — strong influence | `decision.focus.focusPriorityId`, `focusSignalKind` |
| Drivers — supporting args | `decision.story.supportingArguments` |
| Drivers — rationale | `decision.terminal.outcome.rationale` |
| Outcome strengths | `decision.terminal.outcome.rationale` |
| Outcome considerations | `decision.terminal.outcome.unresolvedQuestions` |
| Outcome move progress | `completedMoveIds`, `unresolvedMoveIds` |

Projection helper: `projectDecisionPresentation` — fold-only, no sort / filter / compose.

---

## Decision Story mapping

```text
Runtime story.chapters[]  →  DecisionStoryPanel <ol> (Runtime order)
Runtime moves.moves[]     →  DecisionStoryPanel moves list (Runtime order)
moves.activeMoveId        →  aria-current="step" + active chrome
story.nextDecisionStep    →  footer label
```

Client Studio does not reorder chapters or moves.

---

## Live synchronization

```text
Experience Surfaces (Priority, Spatial, …)
        │
        ▼
Decision Signals (ChangePriority / SelectRoom / …)
        │
        ▼
Runtime Interpretation
        │
        ▼
Experience Context.decision
        │
        ▼
projectDecisionPresentation
        │
        ▼
Decision Terminal (Summary · Story · Drivers · Outcome)
```

No local reconciliation. Provider experience subscription drives re-render.

---

## Modified / added modules

| Module | Role |
| --- | --- |
| `runtime/projectDecisionPresentation.ts` | Pass-through presentation DTO |
| `DecisionTerminal.tsx` | Compose live Terminal |
| `DecisionSummary.tsx` | Outcome + focus summary |
| `DecisionStoryPanel.tsx` | Story chapters + Moves |
| `DecisionDrivers.tsx` | Priorities / focus / args (display only) |
| `OutcomeCards.tsx` | Structured outcome cards |
| `decisionTerminal.test.ts` | Projection + ownership guards |
| `priority-engine-layout.ts` | Title band height (header not clipped) |
| `package.json` | Register Terminal tests |

Legacy `TerminalShell` / `useDecisionTerminal` / `OutcomeCommitment` remain unmounted.

---

## Acceptance checklist

- [x] Runtime Decision Outcome presented correctly  
- [x] Decision Story renders in Runtime order  
- [x] Decision Drivers reflect Runtime Context  
- [x] Updates occur automatically after Runtime changes  
- [x] No semantic logic in Client Studio  
- [x] Responsive layouts remain consistent  
- [x] No Runtime API changes  

---

## Validation

| Check | Result |
| --- | --- |
| Typecheck | **PASS** |
| Tests | **PASS** — 41/41 (includes 3 CSCB-05) |
| Desktop | [assets/cscb-05-terminal-desktop.png](./assets/cscb-05-terminal-desktop.png) |
| Mobile | [assets/cscb-05-terminal-mobile.png](./assets/cscb-05-terminal-mobile.png) |

---

## Follow-up

- Human-readable labels for machine keys are out of scope (presentation of Runtime strings as-is)  
- Next: **CSCB-06 — AI Assistance** (consumes Runtime; creates no semantics)
