# EPIC-BLD-18 — Decision Story Report

**Status:** Ready for architecture review  
**Commit:** deferred to start of EPIC-BLD-19 (on PASS)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Decision Story Composer interpretuje `EvaluationResult` do čistého doménového modelu `DecisionStory`. Story nevykonává logiku, není Runtime, Presentation ani AI prompt.

```
Evaluation Result
        │
        ▼
Decision Story Composer
        │
        ▼
Decision Story
        │
        ▼
Story Graph
```

---

## Commit před zahájením

| Commit | Obsah |
| --- | --- |
| `9797e1a` | `feat(builder): implement rule evaluation engine` (EPIC-BLD-17) |

---

## DecisionStoryComposer

| Method | Role |
| --- | --- |
| `compose()` | EvaluationResult → DecisionStory + StoryGraph |
| `validateStory()` | Structural validation via StoryValidator |
| `dispose()` | Drop story from session |

---

## DecisionStory

- `id`, `decisionModelId`, `evaluationId`
- `moves[]`, `graph` (StoryGraph), `summary`, `metadata`
- `timestamps`, `validation` (optional after validate)

---

## DecisionMove

Nejmenší jednotka příběhu:

- `id`, `type` (`insight` \| `recommendation` \| `action` \| `summary`)
- `title`, `description`, `priority`, `references[]`, `metadata`

Mapování z EvaluationResult:

| Rule status | Moves |
| --- | --- |
| Passed | insight + recommendation + action |
| Failed | insight (gap) |
| (always) | summary move |

---

## StoryGraph / StoryNode

Oddělené od DecisionGraph — tok příběhu (`relation: next`), ne logické vztahy.

Node kinds (modely only):

- `InsightNode`
- `RecommendationNode`
- `ActionNode`
- `SummaryNode`

---

## StoryValidator

| Method | Role |
| --- | --- |
| `validate()` | Full story |
| `validateMoves()` | Non-empty titles / moves |
| `validateGraph()` | Nodes + edge integrity |

---

## Story Overview

Sekce Builderu `decision-story` (nav **Story**):

- Story / Moves / Story Graph / Validation  
- Compose Story / Validate / Dispose  
- `data-testid="decision-story-overview"`  
- Diagnostický pohled — bez HTML product renderu

---

## Events

| Event | When |
| --- | --- |
| `MoveAdded` | each move during compose |
| `StoryComposed` | compose complete |
| `StoryValidated` | validate complete |

---

## API

`createDecisionStoryApi(composer)`:

- `composeStory()`
- `previewStory()`
- `validateStory()`

---

## Screenshot

`apps/builder-studio/docs/bld-18-decision-story-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (81) |
| build | pass |

### New tests
- composeMovesFromEvaluation + sequential StoryGraph
- StoryValidator structure
- compose + StoryComposed / MoveAdded
- API validate / preview / dispose + StoryValidated

---

## Odchylky od specifikace

| Spec | Implementace | Note |
| --- | --- | --- |
| DecisionStory | + `graph`, `timestamps`, `validation` | Overview + lifecycle |
| StoryGraph | sequential `next` edges | Explicit story flow vs DecisionGraph |
| Nav label | **Story** | Fits crowded section nav |

**Not implemented (by design):** React product render, HTML, Runtime Session, Behavior Engine, AI, Prompt Builder, personalizace.

---

Čeká na architektonickou kontrolu. Commit za EPIC-BLD-18 vznikne na začátku EPIC-BLD-19 při PASS.
