# Object Package — Product Contract

**Status:** APPROVED  
**Version:** 1.0  
**Scope:** Product contract for Object Package  
**SSOT for:** Object Package (product meaning)  
**Not SSOT for:** Runtime API, Experience projection rules, TypeScript shapes, Media Package assets

**Related**

- Runtime: [Runtime Decisions](../architecture/runtime-decisions.md)
- Experience: [Experience Projection Principles](../architecture/experience-projection.md)
- Knowledge: [Knowledge Foundation](./knowledge/README.md)
- Builder: [Builder Workflow](./builder/Builder_Workflow_Specification_BWS_v0.1.md)

---

## 1. Purpose

This document defines Object Package as a **product contract**.

It answers what the system knows about an object, who owns that knowledge, and how it relates to Decision and Experience.

It does not define implementation schemas, JSON formats, or package APIs.

---

## 2. What Object Package Is

Object Package is the **source of truth about a concrete object** offered through Embed Engine (first vertical: a house).

It is a structured carrier of object knowledge used by interpretation to create a personalized Experience.

Core principle:

> Object Package is the source of truth. Experience is its interpretation.

Object Package therefore:

- describes the object as a whole, not only a list of marketing parameters,
- remains independent of UI, renderer, and presentation state,
- can be projected into Experience after Decision interpretation,
- increases Engine reusability across projects without hardcoding object facts into Runtime.

---

## 3. What Object Package Is Not

Object Package is not:

- a Media Package / asset folder / manifest of file paths,
- an ExperienceModel or any rendering contract,
- DecisionState, DecisionRegistry, or Decision Filter,
- Runtime Kernel state,
- a CMS page, wireframe, or Client Studio screen,
- Product Knowledge in the broad sense (see Knowledge Foundation),
- AI, scoring, analytics, or a recommendation engine,
- a database or knowledge base product.

House-specific TypeScript packages and fixtures are **implementations** of this contract for the house vertical. They are not this SSOT.

---

## 4. Lifecycle

```text
Capture (Builder / implementer)
        │
        ▼
Encode (Object Package)
        │
        ▼
Interpret (Decision × Object Package)
        │
        ▼
Project (ExperienceModel)
        │
        ▼
Render (Client Studio / other renderers)
```

1. **Capture** — objective facts about the object are gathered during project implementation (Builder workflow).
2. **Encode** — facts are structured into an Object Package instance for that project/object.
3. **Interpret** — Decision answers select what matters; interpretation reads the Object Package.
4. **Project** — results appear only as fields on ExperienceModel (never as raw Object Package in the renderer).
5. **Evolve** — package content changes when object truth changes, not when UI layout changes.

---

## 5. Ownership

| Role | Responsibility |
| --- | --- |
| **Creates** | Implementer / Builder process for a project |
| **Changes** | Implementer when object facts change (price, rooms, location, media references, metadata) |
| **Must not invent** | Runtime, Renderer, Client Studio UI logic |
| **Must not mutate during dispatch** | Interpretation / projection — read-only consumers |

Product owns the contract. Implementations must remain faithful to this document.

---

## 6. What Runtime May Read

Runtime Kernel:

- orchestrates commands and returns ExperienceModel,
- **does not own** Object Package,
- **does not define** object-domain rules.

Domain modules (outside Core) may receive an Object Package as an injected input to interpretation/projection.

Runtime therefore never treats Object Package as part of its public API.

Public Runtime contract remains:

```text
dispatch(command): ExperienceModel
```

---

## 7. What Emerges From Object Package

From Object Package, after Decision interpretation and projection, Experience may expose:

- projected object summary for rendering,
- highlights relevant to visitor priorities,
- recommended order of attention (e.g. rooms),
- summary readiness and related decision presentation fields.

The renderer never reconstructs Object Package. If UI needs a fact, projection must supply it on ExperienceModel.

---

## 8. Relationship to Experience

```text
Object Package          Decision answers
       │                        │
       └──────────┬─────────────┘
                  ▼
           Interpretation
                  │
                  ▼
           ExperienceModel
                  │
                  ▼
              Renderer
```

| Layer | Owns |
| --- | --- |
| Object Package | Truth about the object |
| Decision | Truth about the visitor’s answers and flow position |
| Interpretation | Meaning derived from both |
| Experience | Presentable projection |
| Renderer | Pixels only |

---

## 9. Relationship to Product and Builder

- **Product Constitution** decides whether object knowledge belongs in the shared Engine story.
- **Builder** is the process that captures and validates inputs that become Object Package content.
- Builder “Knowledge Model” steps are an **implementation workflow** for gathering facts; Object Package is the **product contract** for the encoded object truth those steps produce.

---

## 10. Terminology Guardrails

| Use | Do not use for this meaning |
| --- | --- |
| Object Package | House Package (unqualified) |
| Media Package | Object Package |
| ExperienceHouse (projected) | Object Package |

---

## 11. Quality Gate

Before adding a field or concept to Object Package, answer:

1. Is it truth about the object (not about UI or a single visit)?
2. Will at least one Experience use it after interpretation/projection?
3. Can Runtime remain unaware of it as a public API concern?

If any answer is no, do not add it to Object Package.
