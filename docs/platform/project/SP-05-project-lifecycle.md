# SP-05 --- Project Lifecycle

**Status:** Draft → SSOT po schválení\
**Location:** `docs/platform/project/SP-05-project-lifecycle.md`

# 1. Purpose

Tento dokument definuje životní cyklus Projectu od jeho vytvoření až po
archivaci.

Lifecycle je vlastností Projectu. Platforma pouze umožňuje přechody mezi
jednotlivými stavy.

# 2. Principle

Každý Project prochází stejným životním cyklem.

Neexistují speciální životní cykly pro jednotlivé zákazníky.

# 3. Canonical Lifecycle

``` text
Create
   ↓
Draft
   ↓
Preview
   ↓
Pilot
   ↓
Production
   ↓
Maintain
   ↓
Archive
```

# 4. State Definition

## Create

Vzniká nový Project.

## Draft

Project je rozpracovaný.

## Preview

Project je připraven pro interní prezentaci.

## Pilot

Project je používán pilotním zákazníkem.

## Production

Project je publikován a používán v produkčním prostředí.

## Maintain

Project je dlouhodobě provozován a aktualizován.

## Archive

Project již není aktivně používán.

# 5. Transition Rules

Přechod mezi stavy musí být řízen Platformou.

Project nikdy nepřeskakuje životní cyklus bez explicitního přechodu.

# 6. Responsibilities

Lifecycle určuje:

-   aktuální stav Projectu
-   dostupné operace
-   možnosti publikace
-   možnosti údržby

# 7. Architectural Rules

1.  Lifecycle je vlastností Projectu.
2.  Runtime lifecycle neřídí.
3.  Registry eviduje aktuální stav.
4.  Builder umožňuje změnu stavu.
5.  Publish je možný pouze z odpovídajícího stavu.

# 8. Consequences

Každý Project lze kdykoliv identifikovat podle jeho aktuální fáze
životního cyklu.

## Constitutional Principle

> Platforma řídí přechody. Project nese svůj životní cyklus.
