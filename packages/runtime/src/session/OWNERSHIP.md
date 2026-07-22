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

May consume: `ExperienceContext` (`experience.context`).

Must not compose: Story, Moves, Outcome, Terminal, AIContext.

Must not mutate Runtime except via `dispatch(command)`.

## Legacy note

`@embed-engine/core` cognitive `interpretAndCompose` / pack `composeDecisionStory` is a **parallel legacy producer**, not the session SSOT. Retirement: remaining ED-DA-01 work (Client Studio dual-stack).
