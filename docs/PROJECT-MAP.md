# Project Map

One-page orientation for Embed Engine. Not a specification.

```text
                    Product (why / what)
                           │
                     Roadmap (when)
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
         Architecture              Builder
      (Runtime Kernel)        (project workflow)
              │                         │
         Decision ──► Interpretation ──► Experience
              │                         │
              └────────────┬────────────┘
                           ▼
                    Implementation
                           │
                           ▼
                     Client Studio
                      (renderer)
```

## Relationships

| Concept | Role |
| --- | --- |
| **Product** | Principles and vision. Governs what may enter the Engine. |
| **Roadmap** | Phases and sequencing. Does not override Product or Architecture. |
| **Architecture** | Runtime Kernel boundaries. Domain-agnostic orchestration. |
| **Decision** | Domain module: answers, flow, filters. Lives outside Core. |
| **Experience** | Public projection (`ExperienceModel`). Sole contract for renderers. |
| **Builder** | Implementation workflow that produces project knowledge and content for Client Studio. |
| **Client Studio** | Application renderer. Passive consumer of Experience. No domain reconstruction. |
| **Implementation** | Rules for building UI and using assistants — follows Product, Geometry, Design Language. |
| **Archive** | History only. Never active SSOT. |

## Rule of thumb

> Object Package is the source of truth about an object.  
> Experience is its interpretation for rendering.  
> Runtime delivers Experience. Client Studio paints pixels.

## Start here

1. [README.md](./README.md) — folder index and SSOT table  
2. This map — relationships  
3. Reading order in README — active documents only  
