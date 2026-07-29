# PIP-01 --- Project Implementation Plan

**Status:** Implementation Baseline\
**Location:**
`docs/platform/project/PIP-01-project-implementation-plan.md`

# Purpose

Tento dokument definuje pořadí implementace víceprojektové architektury
CONIS.

Nevysvětluje architekturu. Tu definují dokumenty SP-01 až SP-08.

PIP-01 určuje implementační roadmapu.

# Dependencies

Implementace vychází z:

-   SP-01 Project Architecture
-   SP-02 Project Manifest
-   SP-03 Project Runtime
-   SP-04 Project Registry
-   SP-05 Project Lifecycle
-   SP-06 Project Workspace
-   SP-07 Builder MVP
-   SP-08 Migration Strategy

# Sprint Roadmap

## SPR-01 --- Project Runtime Foundation

Cíl: - načítání Project podle `projectId` - odstranění hardcoded
zákazníka - napojení na Manifest

Výstup: - Runtime připravený pro více Projectů.

------------------------------------------------------------------------

## SPR-02 --- Project Registry

Cíl: - implementace Registry - evidence Projectů - výběr aktivního
Projectu

Výstup: - funkční seznam Projectů.

------------------------------------------------------------------------

## SPR-03 --- Project Workspace

Cíl: - vytvoření standardní struktury `/projects` - migrace prvního
Project Root

Výstup: - první Project ve Workspace.

------------------------------------------------------------------------

## SPR-04 --- Builder Home

Cíl: - obrazovka Projects - Open - Archive - Delete

Výstup: - první verze Builderu.

------------------------------------------------------------------------

## SPR-05 --- New Project

Cíl: - automatické založení nového Projectu - vytvoření Manifestu -
registrace Projectu

Výstup: - funkční "New Project".

------------------------------------------------------------------------

## SPR-06 --- Migration

Cíl: - převod současného pilotu na Project - ověření Runtime

Výstup: - první referenční Project.

------------------------------------------------------------------------

## SPR-07 --- Validation

Ověřit:

-   Runtime
-   Registry
-   Builder
-   Package Build
-   Client Studio
-   Manager Studio

------------------------------------------------------------------------

## SPR-08 --- Multi-project Smoke Test

Ověřit současně:

-   Domy s energií
-   Atrium
-   Lucern

Každý Project musí fungovat nezávisle.

# Acceptance Criteria

Platforma umožňuje:

-   vytvářet nové Projecty,
-   otevírat více Projectů,
-   publikovat každý Project samostatně,
-   provozovat všechny Projecty nad jedním Runtime.

# Exit Criteria

Architektura je připravena pro komerční onboarding dalších partnerů bez
změn Platformy.

## Guiding Principle

> Implementujeme Platformu jednou. Projecty přidáváme opakovaně.
