# SP-01 --- Operations Home (ONS)

## Cíl

Implementovat vstupní obrazovku jako inteligentní pracovní start.

## Hlavní scénář

1.  Runtime připraví nejlepší doporučení.
2.  Zobrazí se doporučený případ.
3.  AI stručně vysvětlí proč.
4.  Operátor otevře případ.

## UI

-   Recommended Case Card
-   AI Explanation
-   Primary Action
-   Secondary Actions

## Runtime

### Čtení

-   Priority Engine
-   Decision Journey
-   Runtime Events
-   AI Summary

### Zápis

-   Otevření případu
-   Přijetí doporučení
-   Přechod do detailu

## Stavy

Loading, Ready, Empty, Error

## Akceptace

-   Jediná primární akce
-   Jedno doporučení
-   AI stručné vysvětlení
-   Zápis všech akcí do Runtime
