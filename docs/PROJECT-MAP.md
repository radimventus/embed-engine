# Project Map

One-page orientation for Embed Engine. Not a specification.

```text
                    Product (why / what)
                           │
              Knowledge ◄──Pilots──► validated lessons
                           │
                     Object Package
                           │
                     Roadmap (when)
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
         Architecture              Builder
      (Runtime Kernel)        (encode object truth)
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
| **Object Package** | Source of truth about a concrete object. Product contract: `product/object-package.md`. |
| **Knowledge** | How the Engine understands deciding and interpreting. Framework: `product/knowledge/README.md`. |
| **Pilots** | Real-world process that validates and grows Knowledge. Framework: `product/pilots/README.md`. |
| **Roadmap** | Phases and sequencing. Does not override Product or Architecture. |
| **Architecture** | Runtime Kernel boundaries. Domain-agnostic orchestration. |
| **Decision** | Domain module: answers, flow, filters. Lives outside Core. |
| **Experience** | Public projection for renderers. Decision Experience uses **Interpretation**; legacy flow may still use `ExperienceModel`. |
| **Decision Terminal** | Reusable interpretation surface (not a right panel). Docs: `architecture/experience/decision-terminal.md`. |
| **Builder** | Implementation workflow that encodes object truth and project content for Client Studio. |
| **Client Studio** | Application renderer. Passive consumer of Experience. No domain reconstruction. |
| **Implementation** | Rules for building UI and using assistants — follows Product, Geometry, Design Language. |
| **Archive** | History only. Never active SSOT. |
| **Post-Foundation Policy** | Capability-first / pilot-first / knowledge-first rules after v0.3. Freeze requires ADR. |
| **Engineering Playbook** | Shared development process: Decision Gate, DoR/DoD, AI agent workflow. |

## Rule of thumb

> Object Package is the source of truth about an object.  
> Knowledge is how we interpret that truth for decisions.  
> Experience is the projected result.  
> Runtime delivers Experience. Client Studio paints pixels.  
> Pilots turn reality into Knowledge — not into Runtime features.

## Start here

1. [README.md](./README.md) — folder index and SSOT table  
2. This map — relationships  
3. Reading order in README — active documents only  
