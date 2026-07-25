# PT-006 — OpenAI Provider Integration

## Verdict

**Pass** — OpenAIProvider is a swappable LLMProvider. Architecture boundaries hold.

## Pipeline

```text
PromptBuilder → PromptPackage → AIService.chatWithPackage
  → OpenAIProvider.chat(ChatRequest) → OpenAI HTTP → ChatResponse
```

## Boundaries

| Rule | Status |
| --- | --- |
| Provider does not assemble prompts | Pass |
| Provider does not import Runtime | Pass |
| Provider does not reference DecisionContext | Pass |
| PromptBuilder / AIService have no OpenAI logic | Pass |
| Provider swap Mock → OpenAI without Runtime/PromptBuilder/Experience changes | Pass |

## Configuration

```bash
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini   # optional
```

No API keys in source. Transport uses `fetch` (no `openai` npm SDK).

## Tests

- `OpenAIProvider.test.ts` — mapping, swap, boundary source checks  
- Vendor neutrality — OpenAI tokens only allowed in `OpenAIProvider.ts`
