# PT-007A — Conversation Extraction

## Verdict

**Pass** — One message → structured `AnalysisResult`. No Memory write. No Runtime.

## Pipeline

```text
User Message → ConversationAnalyzer → AnalysisResult
```

## Contracts

Typed fields only: `Fact`, `Preference`, `Constraint`, `Goal`, `Concern`, `AcceptedOption`, `RejectedOption`, `confidence`.

## Validation scenario

*Máme dvě děti. Rozpočet je 6,5 milionu. Nechceme tepelné čerpadlo.*

→ `familySize` fact, `budget` constraint, `heating=heat-pump` rejected option

## Architecture

| Check | Status |
| --- | --- |
| No chat reply | Pass |
| Analyzer does not import Runtime | Pass |
| Analyzer does not know Experience | Pass |
| Returns only AnalysisResult | Pass |
| No Memory merge in AnalysisService | Pass (deferred to PT-007B) |
