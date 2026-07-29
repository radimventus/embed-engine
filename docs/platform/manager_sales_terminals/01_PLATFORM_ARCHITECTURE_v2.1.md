# 01 --- PLATFORM ARCHITECTURE

## Status

**Referenční architektonický dokument (SSOT)**

**Verze:** 2.1  
**Kurace:** 2026-07-23 — doplněno z Identity / Perspective / Projection
dokumentů a Platform Architecture 1.0 bez změny stavebních bloků ani
jejich pořadí.

## Účel

Platform Architecture definuje stabilní architekturu platformy Embed
Engine. Je jediným autoritativním zdrojem popisu architektonických
stavebních bloků, jejich odpovědností a vztahů.

Neřeší produkty, UX ani implementační technologie.

------------------------------------------------------------------------

# 1. Architektonický přehled

    Knowledge
        │
        ▼
    Runtime
        │
        ▼
    Identity
        │
        ▼
    Perspective
        │
        ▼
    Projection
        │
        ▼
    Terminal
        │
        ▼
    Human

Každá vrstva má jedinou odpovědnost. Žádná vrstva nesmí přebírat
odpovědnost jiné.

------------------------------------------------------------------------

# 2. Architektonické stavební bloky

## Knowledge

### Účel

Reprezentuje doménové znalosti nezávislé na uživateli i rozhraní.

### Odpovědnost

-   objektový model
-   metadata
-   pravidla
-   vztahy
-   business znalosti

### Vstupy

Doménové informace.

### Výstupy

Konzistentní znalostní model.

### Neodpovídá za

Interpretaci ani prezentaci.

------------------------------------------------------------------------

## Runtime

### Účel

Jediný autor významu.

### Odpovědnost

-   interpretace znalostí
-   aplikace pravidel
-   tvorba rozhodovacího stavu
-   výpočet doporučení

### Vstupy

Knowledge + kontext.

### Výstupy

Sémantický stav.

### Neodpovídá za

UI, workflow, vykreslení.

### Doplnění (kurace)

Decision Session je sdílená napříč Terminaly — Terminaly se liší
perspective / projekcí, nikoli vlastnictvím dat Runtime.

------------------------------------------------------------------------

## Identity

### Účel

Zajišťuje kontinuitu rozhodování.

### Odpovědnost

-   identita
-   historie
-   návaznost
-   dlouhodobý kontext

### Výstupy

Kontinuita Decision Journey.

### Doplnění — úrovně identity (kurace)

Platforma zachovává kontinuitu rozhodování, nejen autentizaci.

| Úroveň | Název | Význam |
|--------|--------|--------|
| L0 | Anonymous Visitor | Dočasná Decision Session |
| L1 | Recognized Device | Lokální rozpoznání zařízení |
| L2 | Persistent Decision Identity | Identita po rozhodnutí zachovat Journey; vlastní více Sessions |
| L3 | Verified Identity | Email / OAuth / enterprise; mapuje na stejnou Persistent Decision Identity |

Evidence (device ID, cookie, historie session, metadata…) zvyšuje
důvěru. Evidence není identita sama.

IP adresa je pouze metadata. Nikdy není primárním identifikátorem.

Registrace komunikuje kontinuitu (pokračovat v rozhodnutí, uložit
Journey), nikoli „vytvořit účet kvůli účtu“.

Identity nikdy nevytváří význam.

------------------------------------------------------------------------

## Perspective

### Účel

Určuje z jakého pohledu budou znalosti interpretovány.

### Příklady

-   klient
-   obchodník
-   management
-   autor

Perspective nemění význam. Mění pouze úhel pohledu.

### Doplnění (kurace)

Perspective není identita ani oprávnění (permissions).

Odpovídá na otázku: *Jakou otázku klademe Runtime?*

Příklady otázek (ilustrativní, ne produktový katalog):

| Perspective | Otázka |
|-------------|--------|
| Client | How should I decide? |
| Operations / management | What changed since my last visit? |
| Sales | What is the next best action? |
| Builder / autor | How should the knowledge model evolve? |

Identity je persistentní. Perspective je dočasný úhel pohledu.

------------------------------------------------------------------------

## Projection

### Účel

Sestavuje konkrétní podobu interpretace.

### Odpovědnost

-   výběr informací
-   pořadí
-   kompozice
-   příprava pro Terminal

Projection nikdy nevytváří nový význam.

### Doplnění (kurace)

Projection **smí**:

-   vybírat informace
-   prioritizovat informace
-   organizovat informace
-   vystavit akce

Projection **nesmí**:

-   vytvářet interpretace
-   vytvářet stories mimo Runtime
-   měnit Runtime semantics

Pipeline (informační tok):

    Runtime → Perspective selection → Projection composition
      → Terminal rendering → User interaction → Runtime

Pouze Runtime smí aktualizovat sémantický stav.

Platforma roste přidáváním Projection, nikoli novými sémantickými
systémy.

------------------------------------------------------------------------

## Terminal

### Účel

Poskytuje interakční plochu člověku.

### Odpovědnost

-   prezentace
-   interakce
-   sběr vstupů

Terminal nesmí obsahovat business logiku.

------------------------------------------------------------------------

# 3. Vztahy mezi bloky

Knowledge → Runtime
:   Runtime interpretuje znalosti.

Runtime → Identity
:   Výsledky interpretace rozšiřují kontinuitu.

Identity → Perspective
:   Kontext ovlivňuje zvolený pohled.

Perspective → Projection
:   Určuje, co bude prezentováno.

Projection → Terminal
:   Připravuje interakční model.

Terminal → Human
:   Uživatel přijímá informace a vrací nové vstupy.

------------------------------------------------------------------------

# 4. Architektonické invarianty

1.  Runtime je jediným zdrojem významu.
2.  Knowledge je nezávislé na UI.
3.  Projection nikdy nemění význam.
4.  Terminal nikdy neobsahuje business logiku.
5.  Identity nikdy nevytváří interpretaci.
6.  Perspective neurčuje pravdu, pouze pohled.
7.  Každá interpretace musí být zpětně vysledovatelná.

------------------------------------------------------------------------

# 5. Rozhodovací tok

Decision Journey → dlouhodobá kontinuita rozhodování.

Decision Session → jedna konkrétní interakce v rámci Journey.

Každá Session rozšiřuje Journey.

Sessions jsou transientní. Journey je persistentní.

------------------------------------------------------------------------

# 6. Závislosti

Platform Architecture vychází z:

-   Platform Constitution

Navazuje na:

-   Product Model
-   Terminal Framework
-   Studio Specifications

------------------------------------------------------------------------

# 7. Rozsah dokumentu

## Patří sem

-   stavební bloky
-   jejich odpovědnosti
-   vztahy
-   hranice
-   invarianty

## Nepatří sem

-   Studia
-   Terminály konkrétních produktů
-   UX
-   UI
-   React
-   API
-   databáze
-   implementace

------------------------------------------------------------------------

# Závěrečné ustanovení

Každý architektonický pojem definovaný v tomto dokumentu je SSOT. Jeho
význam nesmí být měněn v žádném navazujícím dokumentu.

------------------------------------------------------------------------

## Provenience (kurace)

Doplněno z:

-   `Identity_and_Decision_Continuity_Architecture.md`
-   `PERSPECTIVE_MODEL_v1.0.md`
-   `PROJECTION_ARCHITECTURE_v1.0.md`
-   `Platform_Architecture_1.0_Embed_Engine.md`

**Nepřevzato** jako součást tohoto stacku: samostatná vrstva Permissions;
stack `Identity → … → Runtime` z Identity dokumentů; stack
`Authoring → Runtime → Terminal → Persona` z Architecture 1.0 — viz Open
Questions.
