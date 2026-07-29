# 01 --- PLATFORM ARCHITECTURE

## Status

**HISTORICAL — superseded by `01_PLATFORM_ARCHITECTURE_v2.1.md`**

Kurace 2026-07-23: tento soubor není SSOT. Zachován pro historii.

---

*(Obsah v2.0 níže zůstává beze změny jako historický záznam.)*

# 01 --- PLATFORM ARCHITECTURE (v2.0 body retained)

## Status (original)

**Referenční architektonický dokument (SSOT)** — *no longer current*

## Účel

Platform Architecture popisuje stabilní architekturu platformy Embed
Engine. Definuje hlavní stavební bloky, jejich odpovědnosti, hranice a
vzájemné vztahy.

Neřeší produkty, obrazovky ani implementaci.

------------------------------------------------------------------------

# 1. Architektonický přehled

``` text
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
```

------------------------------------------------------------------------

# 2. Stavební bloky

## Knowledge

**Účel:** reprezentace znalostí domény.

**Odpovědnost:** poskytovat konzistentní znalostní model.

**Neodpovídá za:** interpretaci ani prezentaci.

------------------------------------------------------------------------

## Runtime

**Účel:** jediný autor významu.

**Odpovědnost:** interpretace znalostí a tvorba sémantiky.

**Neodpovídá za:** UI ani workflow.

------------------------------------------------------------------------

## Identity

**Účel:** zachování kontinuity.

**Odpovědnost:** propojení rozhodovací historie.

**Neodpovídá za:** interpretaci znalostí.

------------------------------------------------------------------------

## Perspective

**Účel:** určit pohled na znalosti.

**Odpovědnost:** definovat kontext rozhodování.

**Neodpovídá za:** změnu významu.

------------------------------------------------------------------------

## Projection

**Účel:** převést interpretaci do konkrétní podoby.

**Odpovědnost:** kompozice informací.

**Neodpovídá za:** business logiku.

------------------------------------------------------------------------

## Terminal

**Účel:** realizace interakce.

**Odpovědnost:** komunikace s uživatelem.

**Neodpovídá za:** sémantiku ani business logiku.

------------------------------------------------------------------------

# 3. Vztahy

-   Knowledge poskytuje znalosti Runtime.
-   Runtime vytváří význam.
-   Identity uchovává kontinuitu.
-   Perspective určuje kontext.
-   Projection skládá výsledný pohled.
-   Terminal zprostředkovává interakci člověku.

------------------------------------------------------------------------

# 4. Architektonická omezení

-   Runtime je jediným zdrojem významu.
-   Projection nikdy nemění význam.
-   Terminal nikdy neobsahuje business logiku.
-   Identity nikdy neinterpretuje znalosti.
-   Knowledge je nezávislé na uživatelském rozhraní.

------------------------------------------------------------------------

# 5. Rozhodovací tok

Rozhodování probíhá jako kontinuální proces.

Jednotlivé interakce tvoří Decision Journey.

Každá relace představuje Decision Session.

------------------------------------------------------------------------

# 6. Rozsah dokumentu

Patří sem: - stavební bloky platformy, - jejich odpovědnosti, -
vztahy, - architektonické hranice.

Nepatří sem: - Studia, - Terminály jednotlivých produktů, - UX, -
implementace, - technologie.

------------------------------------------------------------------------

# Závěrečné ustanovení

Platform Architecture je jediným referenčním zdrojem architektury
platformy.

Všechny další architektonické dokumenty musí být s tímto dokumentem v
souladu.
