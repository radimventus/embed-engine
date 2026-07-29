# SP-04 --- Detail případu (ONS)

## Cíl

Implementovat hlavní pracovní plochu operátora s kompletním kontextem
případu.

## Hlavní scénář

1.  Otevření Detailu případu.
2.  Runtime načte kompletní kontext.
3.  AI zobrazí doporučený další krok.
4.  Operátor provede akci.
5.  Runtime aktualizuje Decision Journey.

## UI

-   Case Workspace
-   Case Summary
-   AI Recommendation
-   Recommended Action
-   Decision Journey Panel
-   Communication Panel
-   Documents Panel

## Runtime

### Čtení

-   Case Detail
-   Decision Journey
-   Priority Engine
-   AI Interpretation
-   Communication History
-   Documents

### Zápis

-   Provedení akce
-   Aktualizace Decision Journey
-   Změna stavu
-   Telemetrie

## Stavy

-   Loading
-   Ready
-   Empty
-   Error

## Akceptační kritéria

-   AI doporučení je zobrazeno jako první.
-   Primární akce je jednoznačně zvýrazněna.
-   Kompletní kontext je dostupný bez přepínání obrazovek.
-   Veškeré změny jsou zapisovány do Runtime.
-   Nejsou zobrazovány technické informace.
