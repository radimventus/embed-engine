# PT-012 — AI Observability & Diagnostics

## Verdict

**Pass** — Passive diagnostics observe each `AIService.sendMessage` turn without changing pipeline results.

## Trace shape

```text
Session
  ↓
Message
  ↓
Analyzer N ms
  ↓
Memory N ms
  ↓
Resolution N ms
  ↓
PromptBuilder N ms
  ↓
Provider N ms
  ↓
Response (+ tokens / memory counts)
```

## Architecture

| Check | Status |
| --- | --- |
| Diagnostics never change Runtime | Pass |
| Diagnostics never change DecisionMemory | Pass (read-only counts + resolve snapshot) |
| Diagnostics only observe | Pass |
| Provider independent of diagnostics | Pass |
| PromptBuilder independent of diagnostics | Pass |
| Fully disableable | Pass (`diagnostics: false` / `createDisabledDiagnostics` / `VITE_AI_DIAGNOSTICS=0`) |

## Privacy

Logs metadata only — never API keys, system prompts, or user message text.
