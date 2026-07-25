# packages/ai — package boundaries (WP-A)

Physical layer markers aligned with AID-01 / ACC-01.

| Path | Layer | Status (WP-A) |
| --- | --- | --- |
| `src/runtime/` | AI Runtime | Boundary + re-export façade; logic still in `services/`, `prompt/`, … |
| `src/delivery/` | AI Delivery | Placeholder only |
| `src/adapter/` | AI Adapter | Placeholder only (`providers/` unchanged) |
| `src/contract/` | ACC-01 | Placeholder only (no TS models) |

**Public API:** `@embed-engine/ai` root exports are unchanged. Boundary constants are additive exports.

**Not moved:** OpenAIProvider, MockProvider, AIService implementation files.
