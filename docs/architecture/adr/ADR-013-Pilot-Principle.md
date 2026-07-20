# ADR-013 --- Pilot Principle

**Status:** Accepted\
**Date:** 2026-07-21

## Context

Embed Engine je ve fázi pilotáže.

Nejvyšší prioritou projektu není dokončení architektury ani implementace
všech plánovaných modulů.

Nejvyšší prioritou je:

> **Získat prvního platícího zákazníka a úspěšně realizovat pilot.**

Projekt proto potřebuje jednotné rozhodovací pravidlo.

## Decision

Po dobu pilotní fáze se každá nová funkce posuzuje podle následujících
otázek:

1.  Přiblíží nás tato funkce k prvnímu platícímu zákazníkovi během
    následujících 60--90 dní?
2.  Je nezbytná pro úspěšnou realizaci pilotu?
3.  Je cena za její odložení vyšší než cena její implementace dnes?

Pokud není alespoň jedna odpověď **ANO**, funkce se: - neimplementuje, -
zapíše do roadmapy, - přehodnotí po úspěšném dokončení pilotní fáze.

## Scope

Platí pro všechny části projektu: - Core - Runtime - Client Studio -
Priority - AI - Revenue - UX - Business Dashboard - všechny nové moduly

## Immediate Consequences

### Implementovat

-   funkce nutné pro pilot,
-   stabilitu,
-   onboarding klienta,
-   prodejní podporu,
-   základní reporting,
-   jednoduchý finanční model.

### Odložit

-   Revenue Engine,
-   pokročilé simulace,
-   AI predikce,
-   behaviorální analýzy,
-   enterprise funkce,
-   optimalizace bez přímého dopadu na pilot.

## Guiding Principle

> **Pilot má vždy přednost před elegancí architektury.**

Architektura musí podporovat dodání produktu, nikoliv jeho odkládat.

## Success Metric

Každý dokončený sprint musí prokazatelně zvyšovat pravděpodobnost
získání prvního platícího zákazníka nebo úspěšné realizace pilotu.
