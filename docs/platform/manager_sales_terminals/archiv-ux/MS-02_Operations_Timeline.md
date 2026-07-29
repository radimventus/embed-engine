# MS-02 — Operations Timeline
## Implementační specifikace (SSOT v1.0)

## Cíl sprintu
Navrhnout časovou osu práce operátora. Timeline je hlavní navigační vrstva Operations Studia a zobrazuje vše důležité v chronologickém pořadí.

## Business hodnota
- Okamžitý přehled změn.
- Dohledatelnost všech událostí.
- Rychlé navázání na rozpracovanou práci.

## UX scénář
1. Operátor otevře Timeline.
2. Vidí nejnovější události nahoře.
3. Vybere událost.
4. Otevře detail Decision Journey.
5. Provede akci a vrátí se zpět.

## Informační architektura
Každá položka obsahuje:
- čas,
- typ události,
- objekt,
- prioritu,
- stav,
- doporučenou akci.

## UI komponenty
- TimelineList
- TimelineItem
- EventBadge
- PriorityIndicator
- QuickActions
- FiltersBar

## Design Tokens & znovupoužitelné komponenty
- AppShell
- Card
- Badge
- Priority Chip
- Timeline Row
- Button
- Typography
- Spacing podle platformních tokenů.

## Runtime integrace
Čtení:
- Runtime Events
- Decision Journey
- Priority
- AI Summary

Zápis:
- Otevření detailu
- Označení jako vyřízené
- Předání do Sales
- Přidání poznámky

## Stavy
Loading • Empty • Error • Success

## Akceptační kritéria
- Události jsou řazené chronologicky.
- Filtry fungují bez změny významu dat.
- Každá položka otevře správný detail.
- Všechny akce se zapisují do Runtime.

## Implementační checklist
- [ ] Timeline layout
- [ ] Timeline item
- [ ] Filtry
- [ ] Quick actions
- [ ] Runtime integrace
- [ ] Test stavů

## Otevřené otázky
- Podporovat seskupení událostí podle Decision Journey?
- Přidat AI shrnutí nad Timeline?
