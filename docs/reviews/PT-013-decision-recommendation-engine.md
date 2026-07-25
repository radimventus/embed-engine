# PT-013 — Decision Recommendation Engine

## Verdict

**Pass** — Deterministic RecommendationContext from ResolvedMemory + Object + DecisionContext; LLM explains, does not invent.

## Pipeline

```text
ResolvedMemory + ObjectContext + DecisionContext
        ↓
DecisionRecommendationEngine (rules)
        ↓
RecommendationContext
        ↓
PromptBuilder (serialize only)
        ↓
LLM
```

## First rules

- budget vs price conflict
- rejected / accepted heat pump
- energy / operating-cost priority weighting
- family size → family layout

## Architecture

| Check | Status |
| --- | --- |
| Engine deterministic | Pass |
| Engine never calls LLM | Pass |
| PromptBuilder only serializes | Pass |
| Provider unaware of RecommendationContext | Pass |
| Runtime unchanged | Pass |
