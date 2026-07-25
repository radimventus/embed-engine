# PT-010 — Memory Resolution Engine

## Verdict

**Pass** — DecisionMemory is history; ResolvedMemory is computed active view for prompts.

## Layers

```text
DecisionMemory (append-only history)
        ↓
MemoryResolutionEngine (last-write-wins v1)
        ↓
ResolvedMemory
        ↓
MemoryContextBuilder (serialize only)
        ↓
PromptPackage
```

## Rules (v1)

- Latest `at` per key wins within a bucket
- Accepted vs rejected options: latest `at` across both sides wins
- History never rewritten

## Architecture

| Check | Status |
| --- | --- |
| History immutable under resolve | Pass |
| PromptBuilder does not import ResolutionEngine | Pass |
| MemoryContextBuilder resolves then serializes | Pass |
| Providers unaware of ResolutionEngine | Pass |
