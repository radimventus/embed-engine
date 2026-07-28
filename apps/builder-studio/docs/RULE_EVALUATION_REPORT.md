# EPIC-BLD-17 — Rule Evaluation Report

**Status:** Ready for architecture review  
**Commit:** deferred to start of EPIC-BLD-18 (on PASS)  
**App:** `@embed-engine/builder-studio`  
**Dev:** `pnpm --filter @embed-engine/builder-studio dev` → http://127.0.0.1:4177  

---

## Verdict

Rule Evaluation Engine deterministicky vyhodnocuje pravidla z DecisionModel. Výstup je `EvaluationResult` — ne Decision Story, ne Runtime, ne AI Context. DecisionModel se nemění.

```
Decision Model
        │
        ▼
Rule Evaluation Engine
        │
        ▼
Evaluation Result
```

---

## Commits před zahájením

| Commit | Obsah |
| --- | --- |
| `0f728aa` | Decision Engine Foundation (už dříve; prompt ho žádal znovu) |
| `8f9aba4` | Decision Runtime Foundation (skutečný předchozí necommitnutý EPIC) |

---

## RuleEvaluationEngine

| Method | Role |
| --- | --- |
| `evaluate()` | Run evaluators → EvaluationResult |
| `validateRules()` | Structural rule validation |
| `dispose()` | Drop evaluation from session |

---

## Models

- **EvaluationResult** — id, decisionModelId, ruleResults[], summary, metadata  
- **RuleResult** — ruleId, status (`Passed`/`Failed`/`Skipped`), score, matchedSignals[], reason  
- **EvaluationContext** — knowledge, decisionKnowledge, signals, priorities  

---

## RuleEvaluator / BasicRuleEvaluator

Interface `supports()` + `evaluate()`.  
`BasicRuleEvaluator` — jednoduché párování `priority.includes(...)` a `signal.<source>...` vůči EvaluationContext.

---

## Evaluation Overview

Sekce Builderu `rule-evaluation` (nav **Evaluation**):

- Rules / Status / Matched Signals / Score / Summary  
- Evaluate / Validate / Dispose  
- `data-testid="rule-evaluation-overview"`

---

## Events

| Event | When |
| --- | --- |
| `EvaluationStarted` | evaluate begin |
| `RuleEvaluated` | each rule |
| `EvaluationCompleted` | evaluate end |

---

## API

`createRuleEvaluationApi(engine)`:

- `evaluateRules()`
- `previewEvaluation()`
- `validateEvaluation()`

---

## Screenshot

`apps/builder-studio/docs/bld-17-rule-evaluation-overview-screenshot.png`

---

## Verification

| Check | Result |
| --- | --- |
| typecheck | pass |
| test | pass (77) |
| build | pass |

### New tests
- BasicRuleEvaluator pass/fail matching
- evaluate + EvaluationStarted / RuleEvaluated / EvaluationCompleted
- validate + dispose + API preview

---

## Odchylky od specifikace

| Spec | Implementace | Note |
| --- | --- | --- |
| EvaluationResult | + `timestamps`, structured `summary` | Overview + lifecycle |
| BasicRuleEvaluator | string/token matching only | Spec: bez složitých algoritmů |
| Nav label | **Evaluation** | Fits crowded section nav |

**Not implemented (by design):** Decision Story, Runtime Session, AI, personalizace, Behavior Engine, automatické učení.

---

Čeká na architektonickou kontrolu. Commit za EPIC-BLD-17 vznikne na začátku EPIC-BLD-18 při PASS.
