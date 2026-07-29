# 03 --- TERMINAL FRAMEWORK

## Status

**Referenční dokument (SSOT)**

**Verze:** 1.0  
**Kurace:** 2026-07-23 — doplněno z root Terminal Framework / Model /
Grammar bez změny odpovědnosti Terminalu.

## Účel

Terminal Framework definuje jednotný model všech Terminalů platformy
Embed Engine.

Terminal je interakční vrstva mezi platformou a člověkem. Neobsahuje
business logiku ani interpretaci. Jeho úlohou je převést připravenou
interpretaci do srozumitelné interakce.

------------------------------------------------------------------------

# 1. Definice

Terminal je hlavní pracovní plocha Studia.

Každé Studio obsahuje alespoň jeden Terminal.

Terminal je řízen Platform Architecture a používán Product Modelem.

Terminal je execution surface Projection: renderuje Projection
připravenou z Runtime. Nevytváří význam.

------------------------------------------------------------------------

# 2. Odpovědnost

Terminal odpovídá za:

-   prezentaci,
-   navigaci,
-   sběr vstupů,
-   vizualizaci interpretace,
-   realizaci interakce.

Terminal **SHALL**:

-   renderovat Projection,
-   zobrazit Context, Narrative, Insight a Action,
-   sbírat interakce,
-   vracet vstupy / intent platformě (Runtime).

Terminal **SHALL NOT** / nikdy:

-   nevytváří význam,
-   neinterpretuje znalosti,
-   neobsahuje business logiku,
-   nevlastní business rules,
-   neduplikuje Runtime state.

------------------------------------------------------------------------

# 3. Univerzální struktura

Každý Terminal je tvořen vrstvami:

    Context
        ↓
    Narrative
        ↓
    Insight
        ↓
    Action
        ↓
    Interaction Channel

## Context

Co má uživatel právě řešit. Kde jsem? S jakým object / identity / scope
pracuji?

## Narrative

Příběh vysvětlující aktuální situaci. Co se děje?

## Insight

Nejdůležitější zjištění. Co to znamená?

## Action

Jediný doporučený další krok. Co má následovat?

## Interaction Channel

Kanál, kterým Terminal přijímá vstupy uživatele a předává je zpět
platformě.

### Gramatický princip

Všechny Terminaly sdílejí stejnou gramatiku. Liší se především Context
a Narrative. Insight a Action zůstávají konzistentními Runtime
projekcemi.

------------------------------------------------------------------------

# 4. Interakční principy

Každý Terminal:

-   řeší jednu hlavní otázku,
-   vede uživatele jedním směrem,
-   minimalizuje kognitivní zátěž,
-   zobrazuje pouze relevantní informace.

------------------------------------------------------------------------

# 5. Životní cyklus

1.  Terminal přijme Projection.
2.  Zobrazí Context.
3.  Vysvětlí Narrative.
4.  Zdůrazní Insight.
5.  Nabídne Action.
6.  Přijme reakci uživatele (Interaction Channel).
7.  Vrátí vstupy platformě.
8.  Po aktualizaci Projection znovu vykreslí pohled.

Poznámka: výběr Identity / Perspective a skladba Projection probíhá
**před** vstupem do Terminalu (viz 01 Platform Architecture). Rozšířený
lifecycle „Resolve Identity → Select Perspective → …“ z historických
dokumentů je Open Question, pokud by měl být součástí Terminal
Frameworku.

------------------------------------------------------------------------

# 6. Architektonické invarianty

-   Jeden Context v jednom okamžiku.
-   Jeden hlavní Insight.
-   Jedna doporučená Action.
-   Žádná business logika.
-   Žádná interpretace znalostí.
-   Veškeré vstupy jsou předány zpět platformě.
-   Runtime owns semantics. Projection owns composition. Terminal owns
    presentation.

------------------------------------------------------------------------

# 7. Design goal

Každá nová aplikace v Embed Engine má být nejprve vyjádřitelná jako nový
Terminal nad existující Projection, než se zavede nová Runtime
schopnost.

------------------------------------------------------------------------

# 8. Rozsah dokumentu

## Patří sem

-   definice Terminalu,
-   struktura,
-   pravidla interakce,
-   životní cyklus,
-   invarianty.

## Nepatří sem

-   Runtime,
-   Product Model,
-   konkrétní Studia,
-   UX jednotlivých produktů,
-   implementace.

------------------------------------------------------------------------

# Závěrečné ustanovení

Terminal Framework je jediným referenčním zdrojem definice Terminalu a
jeho chování.

------------------------------------------------------------------------

## Provenience (kurace)

Doplněno z:

-   `TERMINAL_FRAMEWORK_v1.0.md`
-   `TERMINAL_MODEL_v1.0.md`
-   `Terminal_Grammar_1.0.md`

Vlastnictví C/N/I/A jako „Projection Grammar“ vs „Terminal structure“ —
viz Open Questions (duplicitní pojmenování, stejný obsah).
