# PT-007 — Conversation Analyzer

## Verdict

**Pass** — Analyzer extracts structured decision knowledge into Decision Memory. Not a chatbot.

## Pipeline

```text
User Message → ConversationAnalyzer → AnalysisResult → DecisionMemory.merge()
```

## Components

| Piece | Role |
| --- | --- |
| `AnalysisRequest` / `AnalysisResult` | Structured contracts only |
| `AnalyzerProvider` | LLM JSON extraction + deterministic fallback |
| `ConversationAnalyzer` | Decision Interpreter entry |
| `AnalysisService` | analyze + merge into Memory |
| `mergeDecisionMemory` | Append-only by key (never deletes / overwrites) |

## Validation scenario

Input: *Máme dvě děti a nechceme tepelné čerpadlo. Rozpočet je maximálně 6,5 milionu.*

Extracts:

- `facts.familySize = 4`
- `constraints.budget = 6500000`
- `rejectedOptions.heating = heat-pump`

## Architecture

- Analyzer does not answer the user
- Analyzer does not mutate Runtime
- Decision Memory is the sole long-term recipient
- PromptBuilder / Runtime / DecisionContext / UI unchanged (Memory stub extended only)
