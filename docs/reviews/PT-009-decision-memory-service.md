# PT-009 — Decision Memory Service

## Verdict

**Pass** — DecisionMemoryService is the sole writer of DecisionMemory.

## Pipeline

```text
AnalysisResult → DecisionMemoryService.update() → DecisionMemory
```

PromptBuilder only reads. Analyzer only extracts. Providers transport.

## API

- `MemoryUpdateRequest { analysis }`
- `MemoryUpdateResult { added, skipped, duplicated }`
- Append-only, no overwrite, no delete, dedupe by key

## Validation

| Case | Result |
| --- | --- |
| Memory has Budget; analysis returns Budget | added=0, duplicated=1 |
| Memory has Budget; analysis returns Heat Pump | added=1 |

## Architecture

| Check | Status |
| --- | --- |
| Analyzer does not write Memory | Pass |
| PromptBuilder does not write Memory | Pass |
| Providers do not write Memory | Pass |
| `mergeDecisionMemory` removed from public write path | Pass |
