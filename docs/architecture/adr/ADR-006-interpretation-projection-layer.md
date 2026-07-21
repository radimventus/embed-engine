# ADR-006 — Interpretation & Projection Layer

**Status:** Accepted (Soft Freeze)  
**Date:** 2026-07-19  

---

## Annotation (Decision Layer governance v1 — 2026-07-20)

This ADR remains historical for the **ExperienceModel / ReactProjector** path.

For the **Living Experience / Decision Layer** path, the canonical stack is:

Interpretation → Decision Strategy → Decision Story → Decision Move → Experience surfaces  
(SSOT: [`../decision-layer/README.md`](../decision-layer/README.md)).

Do not treat the ADR-006 diagram as the sole platform architecture. Cognitive Interpretation (`project()`) and Decision Layer guidance supersede for Decision Experience. Legacy sidebar ExperienceModel may coexist until unified (risk R7).

---

## Kontext

Dosavadní implementace vrací z `packages/decision` přímo `ExperienceModel`.

Architecture Review odhalil dvě slabiny:

* `packages/decision` obsahuje doménovou znalost (`HousePackage`, `projectHouse`, `interpretHouseHighlights`)
* `ExperienceModel` začíná přebírat odpovědnost prezentačního kontraktu.

To vytváří nežádoucí coupling mezi Decision Engine a jednotlivými komunikačními kanály.

---

## Nová architektura

```text
                 Object Package
                       │
                       ▼
              Decision Engine
                       │
                       ▼
                Interpretation
               (interní kontrakt)
                       │
=======================│=======================
      hranice Decision package
=======================│=======================
                       ▼
               Projection Layer
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
   ReactProjector            Future Projectors
          │
          ▼
  ReactExperienceModel
          │
          ▼
      React Renderer
```

---

## Odpovědnosti vrstev

### Object Package

Vlastní:

* objektový model
* metadata
* decision graph
* interpretační pravidla

Nikdy nevytváří UI model.

### Decision Engine

Provádí čistou interpretaci.

Výstup:

* Interpretation

Nikdy:

* nevytváří React model
* nevytváří PDF model
* nevytváří AI model

### Interpretation

Je interní doménový model.

Obsahuje pouze význam rozhodnutí.

Například:

* match
* reasonTokens
* activeSignals
* conflicts
* recommendations
* decisionGraphState

Bez textů.

Bez UI.

Bez komponent.

Bez Reactu.

Bez PDF.

### Projection Layer

Jediná odpovědnost:

```text
Interpretation
      ↓
Channel Model
```

Je Adapter.

Neobsahuje business logiku.

### Channel Model

Každý kanál má vlastní kontrakt.

Například:

* `ReactExperienceModel`

Později:

* `AiConversationModel`
* `PdfDocumentModel`
* `ApiResponseModel`

Tyto modely se mohou lišit.

To je očekávané chování.

---

## Invarianty

| ID | Invariant |
| --- | --- |
| **I-1** | Decision nezná renderery. |
| **I-2** | Decision nezná React. |
| **I-3** | Decision nezná AI. |
| **I-4** | Decision nezná PDF. |
| **I-5** | Decision vrací pouze Interpretation. |
| **I-6** | Projectory nikdy nemění význam Interpretation. Provádějí pouze transformaci. |
| **I-7** | Přidání nového komunikačního kanálu znamená pouze `NewProjector.ts`. Žádná změna v Decision. |

---

## Sprint 1 Implementation Plan

### Milestone 1 — Introduce Interpretation

Vytvořit:

`packages/decision/src/Interpretation.ts`

Definovat interní kontrakt.

### Milestone 2 — Refactor Decision

Refaktorovat:

`interpretDecision()`

tak, aby vracel:

`Interpretation`

Odstranit:

* `projectHouse`
* `interpretHouseHighlights`

z této vrstvy.

### Milestone 3 — Create Experience Package

Nový package:

`packages/experience`

Struktura:

```text
packages/experience/
    src/
        Projector.ts
        ReactProjector.ts
        models/
            ReactExperienceModel.ts
    index.ts
```

### Milestone 4 — Generic Projector Contract

```ts
export interface Projector<TModel> {
  project(
    interpretation: Interpretation,
  ): TModel;
}
```

### Milestone 5 — React Projector

Implementovat první konkrétní projektor:

`ReactProjector`

Transformace:

```text
Interpretation
        │
        ▼
ReactExperienceModel
```

### Milestone 6 — Client Studio

Runtime bude mít nový tok:

```text
Object Package
        │
        ▼
Decision Engine
        │
        ▼
Interpretation
        │
        ▼
ReactProjector
        │
        ▼
ReactExperienceModel
        │
        ▼
React UI
```

---

## Acceptance Criteria

Architektura bude považována za uzavřenou, pokud budou splněny všechny následující body:

* `packages/decision` nemá závislost na `@embed-engine/object-house`.
* `packages/decision` vrací pouze `Interpretation`.
* `packages/experience` obsahuje první implementaci `ReactProjector`.
* React UI konzumuje výhradně `ReactExperienceModel`.
* Přidání druhého projektoru (`AiProjector`) nevyžaduje žádnou změnu v `packages/decision`.

---

## Consequences

* Soft freeze of Interpretation / Projection boundaries until Sprint 1 acceptance criteria are met.
* Existing `ExperienceModel` as the sole Engine→Renderer contract is superseded for new work by channel-specific models produced in `packages/experience`.
* Related CommandRuntime-era documents are **historical** and archived:
  [runtime-decisions-command-runtime-v1.md](../archive/runtime-decisions-command-runtime-v1.md).
  Normative Runtime Public Contract is [RI-001](../../04-reference-implementation/RI-001-Runtime-Kernel.md).
  See [RUNTIME.md](../RUNTIME.md).
* Implementation must not begin until this ADR is committed.

---

## Related

* [RI-001 — Runtime Kernel](../../04-reference-implementation/RI-001-Runtime-Kernel.md) — Runtime SSOT
* [RUNTIME.md](../RUNTIME.md)
* [Runtime Decisions (CommandRuntime — Historical)](../archive/runtime-decisions-command-runtime-v1.md)
* [Experience Projection Principles](../experience-projection.md)
* [Object Package Product Contract](../../product/object-package.md)
* [Post-Foundation Development Policy](../../product/post-foundation-development-policy.md)
* [Engineering Playbook](../../implementation/engineering-playbook.md)