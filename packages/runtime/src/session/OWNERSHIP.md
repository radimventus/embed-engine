# Decision Session — Semantic Ownership Map (ED-DA-01)

Canonical authors for Decision Architecture v1.0 session pipeline.

| Artifact | Sole author (composer) | Input | Consumers |
| --- | --- | --- | --- |
| Interpretation | `pipeline/interpretSession.ts` → `interpretDecisionSession` | Object + Session + Rules + Signals + Focus | Projection only |
| Decision Story | `decision-story/composeDecisionStory` | Interpretation outputs + Focus + Signals | Moves only |
| Decision Moves | `decision-moves/composeDecisionMoves` | **Story only** | Outcome only |
| Decision Outcome | `decision-outcome/composeDecisionOutcome` | **Moves only** | Terminal only |
| Decision Terminal | `decision-terminal/composeDecisionTerminal` | **Outcome only** | AI Context + Experience |
| AI Context | `ai-context/composeAIContext` | **Terminal only** | AI adapters (projection) |

## Dependency direction (required)

```text
Interpretation → Story → Moves → Outcome → Terminal → AIContext
```

Forbidden:

- Story ← Moves / Outcome / Terminal / AI
- Outcome ← Story / Interpretation (direct)
- Terminal ← Story / Moves / Interpretation (direct)
- AIContext ← Outcome / Story / Interpretation / Presentation (direct)

## Experience modules

May consume: `ExperienceContext` (`experience.context`) via `@embed-engine/runtime`
(public façade / contracts only — ED-DA-03).

Must not compose: Story, Moves, Outcome, Terminal, AIContext.

Must not import: `@embed-engine/runtime/testing` (pipeline helpers).

Must not mutate Runtime except via `dispatch(command)`.

## Export surface (ED-DA-03)

| Entry | Contents |
| --- | --- |
| `@embed-engine/runtime` | Priority Journey + Decision Session **public** façade / contracts |
| `@embed-engine/runtime/session` | Decision Session public API only |
| `@embed-engine/runtime/testing` | `compose*` / `evaluate*` / low-level session — tests & advanced only |

## Legacy note

`@embed-engine/core` cognitive packs are **not** the session SSOT (ED-DA-01R retired Client Studio dual stack).