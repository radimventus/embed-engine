# 04 -- PROJECTION FRAMEWORK v1.0 (SSOT)

## Status

Referenční dokument (SSOT)

## Účel

Projection je kompoziční vrstva mezi Runtime a Terminal. Organizuje
význam vytvořený Runtime do pohledu vhodného pro konkrétní Perspective.
Nevytváří význam ani business logiku.

## Pipeline

Knowledge → Runtime → Perspective → Projection → Terminal → Human

## Odpovědnost Projection

-   výběr informací
-   priorita informací
-   pořadí informací
-   kompozice navigace
-   výběr doporučených akcí
-   příprava View

Projection nesmí: - interpretovat znalosti - měnit Runtime - obsahovat
business logiku - vytvářet AI doporučení

## Gramatika

Context → Narrative → Insight → Action

## Hierarchie

Terminal → Projection → View → Component

### View

Např. Timeline, Denní briefing, Detail případu.

### Component

Např. KPI, graf, AI doporučení, tabulka.

## Typy Projection

### Operations Projection

Denní briefing, Timeline, Situace vyžadující pozornost, Stav týmu.

### Decision Guidance Projection

Decision Journey, Next Best Action, Poslední aktivita.

### Decision Intelligence Projection

Rychlost rozhodování, Místa ztráty zákazníků, Faktory rozhodnutí.

### Experience Quality Projection

Připravenost Experience, Doporučená vylepšení.

### Builder Projection

Projection používané Builder Studiem.

## Architektonické invarianty

-   Runtime vlastní význam.
-   Projection vlastní kompozici.
-   Terminal vlastní prezentaci.
-   Každý nový Terminal používá Projection definované tímto dokumentem.
