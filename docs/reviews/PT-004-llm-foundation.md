# PT-004 — LLM Foundation

## Verdict

**Pass** — Vendor-neutral LLM contracts + MockProvider. No OpenAI integration.

## Package

`@embed-engine/ai`

```text
packages/ai/src/
  models/       ChatRequest, ChatResponse, PromptContext, SystemPrompt
  providers/    LLMProvider, MockProvider
  services/     AIService
```

## Pipeline

```text
Experience → AIService.chat() → LLMProvider.chat() → (Mock | future OpenAI | …)
```

## Validation

- MockProvider returns valid `ChatResponse`
- AIService delegates only through `LLMProvider`
- Provider swap via `setProvider` without AIService changes
- Runtime does not depend on `@embed-engine/ai`
- No vendor SDK / API keys in package

## Next (PT-005)

Implement a real `LLMProvider` (e.g. OpenAI) — register it with `createAIService(provider)` only.
