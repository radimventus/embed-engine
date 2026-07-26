# MS-13 — Doporučená vylepšení
## Implementační specifikace (SSOT v1.0)

## Cíl

Pomoci majiteli rozhodnout, které změny mají nejvyšší očekávaný přínos pro Embed Experience.

Nejde o seznam chyb, ale o prioritizovaná doporučení.

---

## Business hodnota

- rychlé rozhodování,
- zaměření na největší přínos,
- průběžné zlepšování Experience,
- méně času nad analýzou.

---

## UX scénář

Runtime zobrazí několik doporučení seřazených podle očekávaného dopadu.

Každé doporučení obsahuje:

- očekávaný dopad (vysoký / střední / nízký),
- stručné zdůvodnění,
- AI interpretaci,
- akci **Provést změnu**.

---

## Runtime

Doporučení vznikají z:

- validačních pravidel,
- konfigurace Experience,
- vazeb mezi prioritami a obsahem,
- interních heuristik Runtime.

---

## UX principy

- pouze několik nejdůležitějších doporučení,
- žádné checklisty,
- jednoznačné pořadí podle očekávaného přínosu.

---

## Akceptační kritéria

- Runtime vytvoří prioritizovaný seznam doporučení,
- AI vysvětlí očekávaný přínos,
- každé doporučení otevře správný modul.


---

## Architektonická poznámka

Tento sprint je dočasně veden v sekci **Manager Studio** z důvodu kontinuity návrhu.

Z pohledu cílové architektury však funkčně spadá do **Experience Builderu**, protože řeší návrh, validaci a průběžnou optimalizaci samotné Embed Experience, nikoli každodenní provoz firmy.

Při architektonické revizi platformy bude doporučeno tento dokument přesunout do sekce **Experience Builder** a přejmenovat jej na odpovídající sprint řady **EB-xx**. Tím bude zachována historie návrhu i čisté oddělení mezi:
- **Manager Studio** – řízení provozu a operací,
- **Experience Builder** – tvorba, validace a optimalizace Experience.
