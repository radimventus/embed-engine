# PT-011 — Embed AI Integration

## Verdict

**Pass** — Embed Chat talks to `AIService.sendMessage`; full pipeline runs in-memory for one page session.

## Pipeline

```text
Embed Chat UI
      → AIService.sendMessage
      → ConversationAnalyzer
      → DecisionMemoryService
      → PromptBuilder (ResolvedMemory via MemoryContextBuilder)
      → OpenAIProvider (transport)
      → Chat UI
```

## Architecture

| Check | Status |
| --- | --- |
| Chat UI → AIService only | Pass (`getEmbedAIService().sendMessage`) |
| Chat UI never imports OpenAIProvider | Pass (bootstrap module only) |
| Runtime independent of Chat UI | Pass |
| Provider unaware of UI | Pass |
| Analyzer on every message | Pass |
| DecisionMemoryService updates history | Pass |
| PromptBuilder uses ResolvedMemory | Pass |
| OpenAIProvider remains transport | Pass |

## Session

- One active in-memory session per page load
- Reload starts a new conversation
- No persistence

## Errors

Mapped to `ConversationError` (missing key, timeout, HTTP, invalid response, provider).
