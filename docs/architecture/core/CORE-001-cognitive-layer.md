# CORE-001 --- Cognitive Layer

**Status:** Draft\
**Version:** 0.1\
**Depends on:** ADR-001 -- Runtime Architecture\
**Next Milestone:** M2 -- Cognitive Layer

------------------------------------------------------------------------

# Poslání

Runtime zajišťuje, aby systém běžel.

Cognitive Layer zajišťuje, aby systém rozuměl objektu i uživateli a
vytvářel interpretaci objektu podle aktuálního kontextu rozhodování.

------------------------------------------------------------------------

# Architektura

``` text
Experience Layer
        ▲
        │
 Interpretation
        ▲
        │
──────────────────────────────
     Cognitive Layer
──────────────────────────────
        ▲
        │
  Decision State
        ▲
        │
Context ◄──► Signals
        │
        ▼
 Object Package
──────────────────────────────
 Runtime Infrastructure
──────────────────────────────
Runtime → Kernel → EventDispatcher / StateManager / ModuleRegistry
```

------------------------------------------------------------------------

# Základní princip

Objekt + Uživatel + Kontext → Interpretace

Objekt se nemění.

Mění se pouze jeho interpretace.

------------------------------------------------------------------------

# Doménové objekty

## Object Package

Neměnná fakta o objektu.

## Context

Aktuální prostředí rozhodování.

## Signal

Významová událost vzniklá z interakce uživatele.

## Decision State

Centrální agregát rozhodovacího procesu obsahující preference, historii,
konflikty a priority.

## Interpretation

Odvozený pohled na Object Package vzniklý z Decision State a Context.

------------------------------------------------------------------------

# Priority

Priority nejsou engine ani služba.

Priority jsou součástí Decision State.

------------------------------------------------------------------------

# Výstup Cognitive Layer

Výstupem je pouze Interpretation.

Experience Layer rozhoduje, jak bude interpretace prezentována.

------------------------------------------------------------------------

# Mimo rozsah

Do Cognitive Layer nepatří:

-   UI
-   React
-   HTML/CSS
-   Persistence
-   Networking
-   AI / LLM
-   Analytics
-   Telemetry

------------------------------------------------------------------------

# MVP

Context

↓

Signal

↓

Decision State

↓

Interpretation

------------------------------------------------------------------------

# Implementační roadmapa

-   M2.1 Decision State
-   M2.2 Signals
-   M2.3 Context
-   M2.4 Interpretation Engine
-   M2.5 Interpretation Model
-   M2.6 Experience Binding
