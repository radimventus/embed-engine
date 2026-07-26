# 02 --- PRODUCT MODEL

## Status

**Referenční produktový dokument (SSOT)**

**Verze:** 1.0  
**Kurace:** 2026-07-23 — terminologické sjednocení a odkazy; Studio
Specifications zůstávají mimo rozsah.

## Účel

Product Model definuje produktový model platformy Embed Engine.

Je jediným autoritativním zdrojem definic produktových entit a jejich
vzájemných vztahů.

Neřeší architekturu Runtime, implementaci ani technologie.

------------------------------------------------------------------------

# 1. Produktová hierarchie

    Platform
    │
    ├── Studio
    │     │
    │     └── Terminal
    │             │
    │             └── Experience
    │                      │
    │                      ├── Module
    │                      │       │
    │                      │       ├── Object
    │                      │       └── Asset
    │                      │
    │                      └── Decision Package

------------------------------------------------------------------------

# 2. Platform

Platform je nejvyšší produktová entita.

Sdružuje všechna Studia a poskytuje společnou identitu, architekturu a
provozní prostředí.

------------------------------------------------------------------------

# 3. Studio

## Definice

Studio je samostatný produkt určený jednomu primárnímu typu uživatele.

Studio organizuje práci uživatele.

## Studia

-   Client Studio
-   Sales Studio
-   Manager Studio
-   Builder Studio

Každé Studio má jediného primárního uživatele a jediný hlavní účel
(princip **Studio by User**).

Konkrétní účely, IA a hranice jednotlivých Studií patří do **Studio
Specifications** (mimo tento dokument; kurace Studio Specs je
odložena).

------------------------------------------------------------------------

# 4. Terminal

Terminal je hlavní pracovní plocha Studia.

Terminal realizuje interakci mezi uživatelem a platformou.

Každé Studio obsahuje alespoň jeden Terminal.

Normativní chování Terminalu definuje **03 Terminal Framework**. Tento
dokument pouze umísťuje Terminal do produktové hierarchie.

------------------------------------------------------------------------

# 5. Experience

Experience představuje ucelenou rozhodovací zkušenost.

Je výsledkem spolupráce architektury platformy, produktového modelu a
konkrétního obsahu.

Experience je tvořena moduly.

------------------------------------------------------------------------

# 6. Module

Module je znovupoužitelná funkční část Experience.

Příklady:

-   Hero
-   Market Pulse
-   House Navigator
-   Priority Engine
-   AI Advisor
-   Lead Capture

Poznámka (katalog, ne design SSOT): vizuální a behaviorální freeze Hero
v1.0 žije mimo Product Model (viz ADR Candidate List / architektura
Hero freeze mimo `docs/platform`).

------------------------------------------------------------------------

# 7. Object

Object představuje doménovou entitu.

Příklady:

-   dům
-   byt
-   klient
-   nabídka
-   případ

Object je nositelem znalostí.

------------------------------------------------------------------------

# 8. Asset

Asset představuje konkrétní obsah spojený s Object.

Příklady:

-   fotografie
-   video
-   půdorys
-   dokument
-   PDF
-   vizualizace

Asset sám o sobě nenese význam.

Význam vzniká až interpretací.

------------------------------------------------------------------------

# 9. Decision Package

Decision Package je produktová jednotka připravená pro vytvoření
Experience.

Obsahuje:

-   Object
-   Assets
-   znalosti
-   pravidla
-   metadata

Decision Package propojuje produktový model s architekturou platformy.

------------------------------------------------------------------------

# 10. Produktové vztahy

Platform → obsahuje Studia.

Studio → obsahuje Terminal.

Terminal → realizuje Experience.

Experience → skládá se z Module.

Module → pracuje s Object a Asset.

Decision Package → poskytuje vstupy pro Experience.

------------------------------------------------------------------------

# 11. Rozsah dokumentu

## Patří sem

-   produktové entity
-   definice
-   hierarchie
-   vztahy

## Nepatří sem

-   Runtime
-   Projection
-   Identity
-   Perspective
-   implementace
-   UX
-   UI
-   technologie
-   Studio Specifications (účely, IA, wireframy)

------------------------------------------------------------------------

# Závěrečné ustanovení

Product Model je jediným referenčním zdrojem definic produktových entit
platformy Embed Engine.

Význam zde definovaných pojmů nesmí být měněn v navazujících
dokumentech.
