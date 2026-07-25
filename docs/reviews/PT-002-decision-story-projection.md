# PT-002 — Decision Story Projection

## Verdict

**Pass** — Decision Story drives three visible Experience surfaces without UI-owned business logic.

## Surfaces

| Surface | Component | Projection field |
| --- | --- | --- |
| Interpretation panel | `PriorityDecisionStoryPanel` | `interpretation` + ordered story |
| Section order | `RecommendedSectionOrder` | `recommendedSectionOrder` |
| Recommendation banner | `DecisionStoryRecommendationBanner` | `interpretation` / primary lens |
| Primary highlight | `DecisionCard` via `PriorityCards` | `highlight.primaryPriorityId` + related |

## Architecture

```text
Runtime priorityIds
        ↓
projectPriorityPipelineStory (PT-001)
        ↓
projectDecisionStoryExperience (PT-002 — Client Studio)
        ↓
ExperienceProjection → UI (read-only)
```

- No Runtime changes
- No new Runtime API
- No AI / FAQ / Report / Hero edits
- Presentation catalogue maps primary id → copy / section order / related ids (does not invent primary)

## Validation

Automated: `projectDecisionStoryExperience.test.ts`

1. energy / layout / privacy → energy lens, AI-first section order, related operating-costs  
2. Switch primary to design → different headline, body, section labels, related set  

Manual partner scenario matches the same switch.
