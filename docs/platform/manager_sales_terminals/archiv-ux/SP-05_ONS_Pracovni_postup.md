# SP-05 --- Pracovní postup (ONS)

## Cíl

Implementovat doporučený pracovní postup řízený Runtime namísto
statického workflow.

## Hlavní scénář

1.  Runtime připraví doporučený krok.
2.  AI vysvětlí jeho význam.
3.  Operátor provede akci.
4.  Runtime aktualizuje stav.
5.  Automaticky připraví další krok.

## UI

-   Workflow Panel
-   Recommended Step Card
-   AI Explanation
-   Primary Action
-   Progress Indicator
-   Completed Steps

## Runtime

### Čtení

-   Workflow State
-   Decision Journey
-   Priority Engine
-   AI Interpretation
-   SLA
-   Business Rules

### Zápis

-   Dokončení kroku
-   Přeskočení kroku
-   Delegování
-   Aktualizace Decision Journey
-   Změna stavu případu
-   Telemetrie

## Stavy

-   Loading
-   Ready
-   Waiting
-   Completed
-   Error

## Akceptační kritéria

-   Runtime vždy připraví právě jeden doporučený krok.
-   AI vysvětluje důvod doporučení.
-   Dokončení kroku automaticky aktivuje další.
-   Workflow podporuje přeskočení i delegování.
-   Veškeré změny jsou auditovatelné.
