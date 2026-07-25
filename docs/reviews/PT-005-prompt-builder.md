# PT-005 — Prompt Builder

## Verdict

**Pass** — PromptBuilder is the sole Runtime → LLM translator. MockProvider only transports PromptPackage.

## Pipeline

```text
Decision Context + Object + Conversation (+ Memory stub)
        ↓
PromptBuilder → PromptPackage
        ↓
promptPackageToChatRequest / AIService.chatWithPackage
        ↓
LLMProvider (Mock)
```

## Section order (mandatory)

1. system  
2. partner-identity  
3. object-context  
4. decision-context  
5. decision-memory (stub)  
6. conversation-context  
7. user-message  

## Package layout

```text
packages/ai/src/prompt/
  PromptBuilder.ts
  PromptAssembler.ts
  SystemPromptFactory.ts
  builders/
  models/ PromptPackage, DecisionMemory, KnowledgeContext
```

## Stubs

- `DecisionMemory` — empty facts / preferences / constraints  
- `KnowledgeContext` — empty entries  

## Validation

- Deterministic `PromptPackage` for identical input  
- Section order matches `PROMPT_SECTION_ORDER`  
- MockProvider receives package via `chatWithPackage` — no prompt assembly in provider  
