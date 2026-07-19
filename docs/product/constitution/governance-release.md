ČÁST 16 — Governance & Release
Management
16.1 Poslání
Governance zajišťuje dlouhodobou kvalitu produktu.
Řídí způsob:
●
●
●
●
●
vývoje,
schvalování,
vydávání verzí,
změn architektury,
technického dluhu.
Cílem není řídit lidi.
Cílem je řídit kvalitu produktu.
16.2 Filozofie
Engine je společné aktivum.
Žádný klient nesmí určovat jeho architekturu.
Každá implementace musí zvyšovat hodnotu společného produktu.
16.3 Produktová hierarchie
Product Vision
↓
Product Bible
↓
Architecture
↓
Roadmap
↓
Backlog
↓
Sprint
↓
Release
Každá úroveň vychází z úrovně nad ní.
16.4 Typy změn
Každá změna spadá do jedné z kategorií:
CORE
Zlepšuje celý Engine.
MODULE
Nový modul.
IMPROVEMENT
Vylepšení existující funkce.
FIX
Oprava chyby.
EXPERIMENT
Pilotní ověření.
CUSTOM
Požadavek jednoho klienta.
CUSTOM není automaticky součástí produktu.
16.5 Rozhodovací pravidlo
Před schválením nové funkce se vždy posuzuje:
●
●
●
●
●
●
zvýší hodnotu produktu?
využije ji více klientů?
je architektonicky čistá?
zvyšuje technický dluh?
lze ji konfigurovat?
lze ji vypnout?
Pokud většina odpovědí není ANO, funkce nebude zařazena do Core.
16.6 Roadmap
Roadmap není seznam přání.
Je strategický plán rozvoje.
Každá položka musí mít:
●
●
●
●
obchodní přínos,
technický přínos,
prioritu,
odhad náročnosti.
16.7 Backlog
Backlog obsahuje všechny schválené úkoly.
Každý úkol má:
●
●
●
●
●
●
ID,
prioritu,
popis,
odhad,
stav,
vlastníka.
16.8 Sprint
Každý sprint obsahuje pouze úkoly:
●
●
●
připravené,
schválené,
architektonicky ověřené.
Do sprintu se nepřidávají neplánované změny.
16.9 Release
Každá verze prochází stejným procesem.
Vývoj
↓
Code Review
↓
Testování
↓
Pilot
↓
Release Candidate
↓
Produkce
16.10 Verzování
Používá se Semantic Versioning.
Například:
1.0.0
↓
1.0.1
↓
1.1.0
↓
2.0.0
Význam:
PATCH
oprava.
MINOR
nová funkce.
MAJOR
architektonická změna.
16.11 Release Notes
Každý release obsahuje:
●
●
●
●
●
●
číslo verze,
datum,
nové funkce,
opravy,
změny API,
migrační poznámky.
Release musí být dohledatelný.
16.12 Feature Flags
Nové funkce lze zapnout pouze vybraným klientům.
Například:
Pilot.
↓
Beta.
↓
Produkce.
Tím se minimalizuje riziko.
16.13 Beta Program
Vybraní klienti mohou testovat nové moduly.
Výhody:
●
●
●
●
rychlá zpětná vazba,
ověření UX,
ověření výkonu,
ověření obchodního přínosu.
16.14 Technický dluh
Každá nová funkce se hodnotí také podle technického dluhu.
Pokud zvyšuje složitost bez odpovídající obchodní hodnoty, nebude implementována.
16.15 Architektonická rada
Strategické změny schvaluje Product Architect.
Posuzuje:
●
●
●
●
dopad na Engine,
budoucí rozvoj,
kompatibilitu,
opakovatelnost.
Architektura má vždy přednost před individuálním požadavkem klienta.
16.16 Dokumentace
Každá nová funkce musí obsahovat:
●
●
●
●
●
●
●
popis,
důvod vzniku,
technický návrh,
UX,
API,
testovací scénáře,
historii změn.
Nedokumentovaná funkce není dokončená.
16.17 Deprecation Policy
Staré funkce se nemažou okamžitě.
Postup:
Označení.
↓
Upozornění.
↓
Přechodné období.
↓
Odstranění.
Tím je zajištěna kompatibilita.
16.18 Rozhodování podle dat
Nové funkce nejsou přidávány na základě pocitu.
Rozhodnutí vycházejí z:
●
●
●
●
●
Analytics,
Business Intelligence,
zpětné vazby klientů,
roadmapy,
strategie produktu.
16.19 Produktové principy
Každá změna musí:
●
●
●
●
●
zvýšit hodnotu Engine,
být opakovatelná,
být škálovatelná,
respektovat architekturu,
být měřitelná.
16.20 Release Pipeline
Idea
↓
Analýza
↓
Specifikace
↓
Architektura
↓
Vývoj
↓
Testy
↓
Pilot
↓
Release
↓
Monitoring
↓
Vyhodnocení
16.21 Definition of Done
Funkce je dokončena pouze tehdy, pokud:
●
●
●
●
●
●
●
funguje,
je otestována,
je zdokumentována,
má definované KPI,
podporuje konfiguraci,
neporušuje architekturu,
je připravena pro release.
16.22 Produktová kontinuita
Produkt se nikdy nepřepisuje od začátku.
Vyvíjí se evolučně.
Každá nová verze staví na předchozí.
Tím se dlouhodobě snižují náklady na vývoj.
16.23 Definice úspěchu
Governance funguje správně tehdy, pokud:
●
●
●
●
●
produkt zůstává dlouhodobě udržitelný,
nové funkce nezvyšují chaos,
každá implementace posiluje společný Engine,
technický dluh zůstává pod kontrolou,
vývoj podporuje obchodní strategii.
16.24 Motto Governance
Nejlepší produkty nevznikají rychlým vývojem.
Vznikají disciplinovaným vývojem správných věcí ve správném pořadí.
