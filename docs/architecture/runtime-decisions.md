# Runtime Decisions v1.0

**Status:** APPROVED\
**Version:** 1.0\
**Scope:** Runtime Kernel\
**Applies to:** Embed Engine Core

------------------------------------------------------------------------

# Purpose

Tento dokument definuje závazná architektonická rozhodnutí Runtime
Kernelu.

Jeho cílem není popis implementace, ale vymezení stabilních
architektonických hranic, které musí zůstat zachovány při dalším vývoji
platformy.

Veškerá implementace Runtime musí být s tímto dokumentem v souladu.

------------------------------------------------------------------------

# Core Mission

Embed Engine Runtime je deterministický Decision Runtime.

Jeho jediným úkolem je převést sekvenci uživatelských příkazů na
platformově nezávislý model uživatelského rozhodování.

Runtime:

-   neobsahuje business logiku,
-   neobsahuje UI,
-   neobsahuje pravidla konkrétní domény,
-   neobsahuje renderování.

Runtime představuje stabilní Kernel platformy.

------------------------------------------------------------------------

# Public API

Runtime poskytuje jediný veřejný vstupní bod:

``` ts
const experience = runtime.dispatch(command);
```

Veřejný kontrakt:

``` ts
dispatch(command): ExperienceModel
```

Každé volání musí synchronně vrátit aktuální `ExperienceModel`.

Žádný jiný objekt Runtime není součástí veřejného API.

------------------------------------------------------------------------

# Runtime Pipeline

``` text
Command
    │
    ▼
Validation
    │
    ▼
CommandResolver
    │
    ▼
CommandHandler
    │
    ▼
DecisionState
    │
    ▼
Interpreter
    │
    ▼
ExperienceModel
```

------------------------------------------------------------------------

# Responsibilities

## Runtime

Odpovídá za orchestrace pipeline, dispatch, dependency wiring, lifecycle
Runtime a koordinaci jednotlivých kroků.

Nikdy neobsahuje business logiku, rozhodovací pravidla, UI ani
renderování.

## CommandHandler

-   přijímá Command
-   validuje vstup
-   provádí deterministickou změnu `DecisionState`

Nesmí vytvářet UI, `ExperienceModel` ani provádět nedeterministické
operace.

## Interpreter

-   čte `DecisionState`
-   vytváří `ExperienceModel`

Nikdy nemění `DecisionState`.

Interpreter v Decision modulu plní roli Projection Layer. Závazná
pravidla projekce jsou v
[Experience Projection Principles v1.0](./experience-projection.md).

Projection belongs outside Runtime.

------------------------------------------------------------------------

# DecisionState

Doménový objekt reprezentující aktuální stav rozhodovacího procesu.

Příklady:

-   answers
-   currentDecision
-   history
-   variables
-   flags
-   progress

Nepatří do Runtime Core.

------------------------------------------------------------------------

# ExperienceModel

Platformově nezávislá reprezentace výsledku interpretace.

Je jediným Single Source of Truth pro:

-   React
-   AI Agent
-   REST API
-   Mobile
-   CLI
-   Voice

Neobsahuje UI komponenty.

> ExperienceModel is the only public contract between Engine and
> Renderer. Renderers must never reconstruct domain state.

Podrobnosti: [Experience Projection Principles v1.0](./experience-projection.md).

------------------------------------------------------------------------

# Package Boundaries

## packages/core

-   Runtime
-   Workflow
-   CommandResolver
-   CommandHandler
-   Interpreter (interface)
-   ExecutionContext

Core musí zůstat domain-agnostic.

## packages/decision

-   DecisionDefinition
-   DecisionRegistry
-   DecisionState
-   NavigateCommand
-   SetAnswerCommand
-   DecisionInterpreter
-   Decision Rules

Veškerá rozhodovací logika vzniká zde.

------------------------------------------------------------------------

# ExecutionContext

Interní provozní kontext Runtime.

Obsahuje infrastrukturu Runtime a odkaz na `DecisionState`.

Není doménovým modelem.

------------------------------------------------------------------------

# Determinism Contract

Pro stejný počáteční `DecisionState` a stejnou sekvenci `Command` musí
Runtime vždy vytvořit:

-   stejný `DecisionState`
-   stejný `ExperienceModel`

Výsledek nesmí záviset na globálním stavu, náhodě, pořadí vláken ani
externích vedlejších efektech.

------------------------------------------------------------------------

# Architectural Rules

**Runtime**

-   orchestrace
-   determinismus
-   stabilní veřejné API

**Decision**

-   business logika
-   rozhodovací pravidla
-   DecisionState
-   interpretace domény

**Renderer**

-   UI
-   vizualizace
-   platform-specific rendering
-   pasivní konzument `ExperienceModel`
-   žádná rekonstrukce domény

Tyto vrstvy musí zůstat striktně oddělené.

------------------------------------------------------------------------

# Evolution Rule

Nové moduly (Priority, Finance, Lead, Media, AI a další) musí být
implementovány bez změny Runtime Kernelu.

Nové architektonické abstrakce se zavádějí až poté, co se stejný pattern
objeví ve více nezávislých modulech.

------------------------------------------------------------------------

# Quality Gate

Při review každého PR:

1.  Does this change violate Runtime determinism? If yes: redesign.
2.  Does this require the renderer to reconstruct domain knowledge? If
    yes: extend the Experience projection instead of adding renderer
    logic.

------------------------------------------------------------------------

# Definition of Done

Architektura Runtime je správná, pokud:

-   Runtime neobsahuje doménovou logiku.
-   Decision doména je oddělena od Core.
-   `dispatch()` vrací `ExperienceModel`.
-   `ExperienceModel` je jediný veřejný výstup Runtime.
-   Renderer nezná interní stav Runtime.
-   Renderer nerekonstruuje doménovou znalost.
-   Runtime nezná konkrétní renderer.
-   Nový modul lze přidat bez změny Runtime.

------------------------------------------------------------------------

# Architectural Principle

> **Embed Engine je dlouhodobě rozšiřitelný Decision Runtime. Runtime
> poskytuje stabilní infrastrukturní Kernel. Doménová logika vzniká v
> modulech. Veřejným kontraktem Runtime je vždy `ExperienceModel`.**
