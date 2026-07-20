# Experience Projection Principles v1.0

**Status:** APPROVED\
**Version:** 1.0\
**Scope:** Experience projection between Domain and Renderer\
**Related:** [Runtime Decisions v1.0](./runtime-decisions.md)

------------------------------------------------------------------------

# Purpose

Tento dokument definuje závazná architektonická rozhodnutí pro projekci
doménového stavu do veřejného rendering kontraktu.

Doplňuje Runtime Decisions. Nemění Runtime Kernel.

------------------------------------------------------------------------

# 1. Experience Projection Principle

> **Interpretation (Decision Experience) is the cognitive contract renderers share.
> Decision Stories (Decision Layer) are the guidance contract Decision Terminal renders.
> Legacy decision-flow may still use ExperienceModel for sidebar navigation until unified.**

Canonical stack:

``` text
Object Package + Behavior Pack
        │
        ▼
     Kernel
        │
        ▼
  DecisionState → project() → Interpretation
        │
        ▼
  Decision Strategy → Decision Story → Decision Move
══════════════════════
  Experience Layer
        │
        ▼
  Decision Terminal · Priority · FAQ · AI · Recommendation · …
```

- Decision Terminal is an **Experience Surface** (may appear as right panel, sheet, voice, …).
- See [Decision Layer](./decision-layer/decision-layer.md) and [Decision Terminal](./experience/decision-terminal.md).

Důsledky:

-   Renderer never reads `DecisionState`.
-   Renderer never owns Decision Strategy or Move libraries.
-   Renderer never computes graph traversal from domain registries.
-   Renderer only renders supplied Interpretation / Story projections.
-   Completing a Move emits Signals; it does not write DecisionState in UI.

Pipeline (cognitive + guidance):

``` text
DecisionState
        │
        ▼
     project()
        │
        ▼
  Interpretation
        │
        ▼
  Decision Strategy
        │
        ▼
  Decision Story / Moves
        │
        ▼
  Experience Surfaces
```

Legacy decision-flow path may still project `ExperienceModel` for sidebar navigation until unified.

------------------------------------------------------------------------

# 2. Single Rendering Contract

> Every renderer (Client Studio, Web Experience, Mobile, PDF, API, etc.)
> consumes exactly the same ExperienceModel.

ExperienceModel musí obsahovat každou informaci potřebnou pro
rendering — a nic navíc.

Pokud renderer vyžaduje dodatečnou informaci, první otázka musí vždy
být:

> Does this belong in the Experience projection?

Teprve pokud je odpověď „no“, smí renderer vlastnit dodatečný
presentation state.

------------------------------------------------------------------------

# 3. Domain Ownership

``` text
Domain owns truth.

Projection owns transformation.

Experience owns presentation.

Renderer owns pixels.
```

## Domain

Owns business state.

Příklady v Decision modulu: `DecisionState`, `DecisionRegistry`,
command handlery, business pravidla.

## Projection

Transforms domain state into a renderable representation.

V Decision modulu dnes tuto roli plní `DecisionInterpreter` /
`interpretDecision()`. Projection čte doménu a vytváří
`ExperienceModel`. Nikdy nemění doménový stav.

## Experience

Represents the public rendering contract.

`ExperienceModel` je platformově nezávislá projekce. Je jediným
vstupem pro všechny renderery.

## Renderer

Produces UI only.

No business logic.

No domain reconstruction.

------------------------------------------------------------------------

# 4. Projection Completeness

> A missing field in ExperienceModel is a projection concern, not a
> renderer concern.

### Example — Decision Flow Navigator

UI potřebovalo znalost budoucí navigace (celý lineární flow včetně
budoucích kroků).

Tato informace už existovala v doméně (`DecisionRegistry`), ale nebyla
projektována do `ExperienceModel`.

**Nesprávné řešení:** duplikovat doménovou znalost uvnitř UI
(hardcoded kroky, čtení registry, rekonstrukce grafu).

**Správné řešení:** rozšířit projekci tak, aby ExperienceModel
obsahoval vše potřebné pro rendering.

------------------------------------------------------------------------

# 5. Decision Flow Projection

Decision Flow patří do Experience projection.

Renderer:

-   nikdy nerekonstruuje graf z `DecisionRegistry`,
-   přijímá už projektovanou reprezentaci (např. `decisionFlow`) z
    `ExperienceModel`.

Aktuální / completed / future stavy kroků musí být odvoditelné z
projekce, ne z vlastní navigační logiky rendereru.

------------------------------------------------------------------------

# 6. Runtime Principle (reaffirm)

Runtime principles z [Runtime Decisions v1.0](./runtime-decisions.md)
zůstávají beze změny.

Runtime zůstává odpovědný pouze za deterministickou orchestraci.

Projection belongs outside Runtime.

Runtime pipeline doručuje `ExperienceModel`, ale neimplementuje
doménovou projekční logiku uvnitř `packages/core`.

------------------------------------------------------------------------

# 7. Projection Terminology

Současné názvy v Decision modulu:

-   `DecisionInterpreter`
-   `interpretDecision()`

Ačkoli se současná implementace chová jako Projection Layer, **nic se
nyní nepřejmenovává**.

Důvod: zachovat API stabilitu.

Budoucí pravidlo:

Pokud se stejný architektonický pattern objeví ve více modulech
(Finance, Compare, AI a další), projekt může standardizovat terminologii
Projection.

Do té doby ponechat současné názvy.

------------------------------------------------------------------------

# 8. Architecture Evolution Rule

> New architectural abstractions are introduced only after they appear
> in multiple independent modules.

Do not rename or generalize based on a single implementation.

------------------------------------------------------------------------

# 9. Quality Gate

Každý budoucí PR review musí odpovědět na dvě otázky:

### Question 1

Does this change violate Runtime determinism?

If yes: redesign.

### Question 2

Does this require the renderer to reconstruct domain knowledge?

If yes: extend the Experience projection instead of adding renderer
logic.

------------------------------------------------------------------------

# Summary

-   Runtime owns orchestration.
-   Domain owns truth.
-   Projection owns transformation.
-   ExperienceModel is the single rendering contract.
-   Renderers are passive consumers.
-   New abstractions emerge from repeated implementation, never
    speculation.
