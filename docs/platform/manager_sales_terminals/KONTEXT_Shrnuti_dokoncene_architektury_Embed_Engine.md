# KONTEXT -- Shrnutí dokončené architektury platformy Embed Engine

## Účel dokumentu

Tento dokument slouží jako stručný kontext pro další návrh, implementaci
a práci AI agentů. Shrnuje stav architektury po dokončení referenčních
SSOT dokumentů.

------------------------------------------------------------------------

# Stav projektu

Architektonická fáze je dokončena.

Byly definovány ústavní principy platformy, architektura, produktový
model, Terminal Framework, Projection Framework i specifikace hlavních
Terminalů.

Další rozvoj má probíhat především implementací schopností (CAP) nad
schválenou architekturou.

------------------------------------------------------------------------

# Aktuální sada SSOT dokumentů

-   00_PLATFORM_CONSTITUTION_v2.0
-   01_PLATFORM_ARCHITECTURE_v2.1
-   02_PRODUCT_MODEL_v1.0
-   03_TERMINAL_FRAMEWORK_v1.0
-   04_PROJECTION_FRAMEWORK_v1.0
-   05_MANAGER_TERMINAL_SPECIFICATION_v1.0
-   06_SALES_TERMINAL_SPECIFICATION_v1.0

------------------------------------------------------------------------

# Referenční architektura

Knowledge → Runtime → Identity → Perspective → Projection → Terminal →
Human

------------------------------------------------------------------------

# Klíčové principy

-   Runtime je jediným autorem významu.
-   Identity určuje, kdo se rozhoduje.
-   Perspective určuje úhel pohledu.
-   Projection skládá pohled nad Runtime.
-   Terminal prezentuje Projection uživateli.
-   Uživatelské rozhraní nikdy nevytváří vlastní sémantiku.

------------------------------------------------------------------------

# Terminály platformy

## Builder Terminal

Slouží k tvorbě a správě Experience.

## Client Terminal

Provází zákazníka rozhodovacím procesem.

## Sales Terminal

Pomáhá obchodníkovi určit nejlepší další krok v Decision Journey.

## Manager Terminal

Pomáhá manažerovi řídit provoz, priority a rozhodování.

------------------------------------------------------------------------

# Typy Projection

-   Operations Projection
-   Decision Guidance Projection
-   Decision Intelligence Projection
-   Experience Quality Projection
-   Builder Projection

------------------------------------------------------------------------

# Stav implementace

Architektura je uzavřena.

Nové funkce mají být přednostně realizovány jako nové Projection nebo
nové schopnosti Runtime. Rozšiřování architektury je přípustné pouze
tehdy, pokud implementace odhalí skutečnou architektonickou mezeru.

------------------------------------------------------------------------

# Doporučení pro další práci

-   Zachovat Runtime jako jediný zdroj významu.
-   Implementovat po capability (CAP).
-   Každou změnu nejprve posoudit jako rozšíření existující
    architektury.
-   Nezavádět nové architektonické vrstvy bez jasného odůvodnění.

------------------------------------------------------------------------

# Závěr

Platforma disponuje ucelenou referenční architekturou připravenou pro
implementaci. Tento dokument slouží jako výchozí kontext pro nová
vlákna, nové členy týmu i AI agenty.
