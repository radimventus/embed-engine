# SP-03 --- Fronta pozornosti (ONS)

## Cíl

Implementovat inteligentní frontu Attention Cards řízenou Runtime.

## Hlavní scénář

1.  Otevření fronty.
2.  Runtime načte doporučené pořadí.
3.  Zobrazení Attention Cards.
4.  Operátor otevře případ.
5.  Runtime zapíše interakci.

## UI

-   Attention Queue
-   Attention Card
-   Priority Badge
-   AI Reason
-   Queue Toolbar

## Runtime

### Čtení

-   Recommended Queue
-   Priority Engine
-   SLA
-   AI Summary
-   Decision Journey

### Zápis

-   Otevření případu
-   Odložení
-   Přiřazení
-   Dokončení

## Stavy

Loading • Ready • Empty • Error

## Akceptace

-   Runtime určuje pořadí
-   Každá karta obsahuje důvod
-   Primární akcí je otevření případu
-   Kompletní telemetrie interakcí
