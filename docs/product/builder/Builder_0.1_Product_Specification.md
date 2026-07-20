# Embed Engine

# Builder 0.1 -- Product Specification

**Version:** 0.1 (Pilot Edition)

## Poslání

Builder je interní implementační nástroj pro tvorbu Client Studia.

Jeho úkolem není vytvořit projekt automaticky. Jeho úkolem je řídit
implementátora krok za krokem tak, aby vznikl kvalitní a konzistentní
behaviorální model projektu.

Builder 0.1 je první implementací stejného workflow, které bude v
budoucnu automatizováno verzemi 1.x a 2.x.

## Hlavní cíl

Builder 0.1 musí umožnit vytvořit první pilotní projekty:

-   konzistentně
-   opakovatelně
-   bez zapomenutých kroků
-   se zachycením všech rozhodnutí

Úspěchem není rychlost. Úspěchem je vytvoření implementační metodiky.

## Co Builder není

Builder není:

-   CMS
-   editor webu
-   page builder
-   design tool
-   správce souborů

Builder nevytváří stránky. Builder vytváří behaviorální model projektu.
Client Studio je až jeho výstup.

## Výstup Builderu

Po dokončení implementace musí existovat:

-   Knowledge Model
-   behaviorální model
-   Priority Engine
-   obsah všech modulů
-   metadata
-   mediální knihovna
-   validační stav jednotlivých sekcí

Teprve z těchto dat vzniká Client Studio.

## Princip práce

Každý krok obsahuje:

1.  Cíl
2.  Potřebné vstupy
3.  Validaci
4.  Poznámky implementátora
5.  Stav (Nezahájeno / Rozpracováno / Hotovo / Revize)

## Architektura

### Vrstva 1 -- Projekt

-   název
-   klient
-   branding
-   kontakty

### Vrstva 2 -- Média

-   fotografie
-   videa
-   půdorysy
-   dokumenty

### Vrstva 3 -- Knowledge Model

-   lokalita
-   dispozice
-   standardy
-   technologie
-   okolí

### Vrstva 4 -- Behaviorální model

-   cílové skupiny
-   motivace
-   obavy
-   očekávání
-   rozhodovací faktory
-   otázky
-   priority

### Vrstva 5 -- Client Studio

-   Hero
-   Video
-   House Navigator
-   Priority Engine
-   FAQ
-   AI Advisor
-   Audit
-   Kontakt

## Workflow

Projekt → Média → Knowledge Model → Behaviorální model → Priority Engine
→ Obsah modulů → Validace → Publikace

## Role Builderu

Builder:

-   naviguje
-   připomíná
-   kontroluje
-   eviduje
-   validuje

Rozhodnutí provádí implementátor.

## Role implementátora

Implementátor:

-   vybírá obsah
-   vytváří texty
-   rozhoduje
-   zpřesňuje Priority Engine
-   zapisuje důvody rozhodnutí

## Automatizace

Workflow zůstává stejné.

Mění se pouze způsob exekuce jednotlivých kroků.

## Builder 0.1 nesmí obsahovat

-   AI generování projektu
-   automatickou tvorbu Priority Engine
-   automatickou tvorbu textů
-   automatickou tvorbu behaviorálního modelu
-   automatické rozhodování

## Kritéria úspěchu

Po třech pilotních projektech:

-   workflow je konzistentní,
-   žádný krok nebyl opomenut,
-   vznikl kompletní behaviorální model,
-   všechna rozhodnutí byla zaznamenána,
-   vznikla pravidla pro Builder 1.0.

## Roadmapa

### Builder 0.1 --- Guided Builder

Implementátor vykonává většinu práce.

### Builder 1.0 --- Assisted Builder

Builder připravuje návrhy, implementátor je schvaluje.

### Builder 2.x --- Autonomous Builder

Builder sestavuje projekt autonomně a žádá pouze o chybějící informace.

## Architektonická zásada

Builder je navržen jako state machine.

Každý krok má:

-   vstupy
-   validační pravidla
-   výstup
-   navazující kroky

Workflow se nikdy nemění. Mění se pouze způsob exekuce.
