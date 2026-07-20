# CORE-001 --- Cognitive Layer

**Status:** Draft\
**Version:** 0.2\
**Depends on:** ADR-001 -- Runtime Architecture\
**References:** ADR-002 -- DecisionState Aggregate; ADR-003 -- Cognitive Processing Pipeline\
**Next Milestone:** M2 -- Cognitive Layer

------------------------------------------------------------------------

# Poslání

Runtime zajišťuje, aby systém běžel.

Cognitive Layer zajišťuje, aby systém rozuměl objektu i uživateli a
vytvářel interpretaci objektu podle aktuálního DecisionState.

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
  DecisionState   ← sole cognitive aggregate
        ▲
        │
     Signals
        │
        ▼
 Object Package
──────────────────────────────
 Runtime Infrastructure
──────────────────────────────
Runtime → Kernel → EventDispatcher / StateManager / ModuleRegistry
```

Canonical processing order is defined in **ADR-003**.

DecisionState structure is defined in **ADR-002**.

Runtime remains independent of Cognitive reduce/project logic.

------------------------------------------------------------------------

# Základní princip

Objekt + Uživatel + DecisionState → Interpretace

Objekt se nemění.

Mění se pouze jeho interpretace.

------------------------------------------------------------------------

# Doménové objekty

## Object Package

Neměnná fakta o objektu.

## Signal

Neměnná významová událost (immutable domain data).

## DecisionState

Jediný kognitivní agregát. Struktura: **ADR-002**.

## Interpretation

Odvozené, read-only porozumění. Vzniká přes `project()` podle **ADR-003**.

------------------------------------------------------------------------

# Priority

Priority nejsou engine ani služba.

Priority jsou součástí DecisionState (viz ADR-002).

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

# Canonical pipeline

Viz **ADR-003**:

Signal → reduce() → DecisionState → project() → Interpretation

CORE-001 nedefinuje vlastní pipeline a neobsahuje samostatný Context agregát.

------------------------------------------------------------------------

# Implementační roadmapa

-   M2.1 Decision State (CAP-02)
-   M2.2 Signals (CAP-03)
-   M2.3 reduce()
-   M2.4 project() / Interpretation
-   M2.5 Experience Binding
