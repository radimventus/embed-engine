ČÁST 03 — Produktová architektura
3.1 Architektonická filozofie
Embed obchodník je navržen jako jeden společný produkt, nikoli jako série individuálních
projektů.
Každý klient používá stejný Engine.
Rozdíl mezi klienty tvoří pouze konfigurace, vzhled a obsah.
3.2 Základní architektura
EMBED ENGINE
(společná codebase)
│
▼
CONFIG
(zapnutí modulů, nastavení)
│
▼
THEME
(logo, barvy, fonty, vzhled)
│
▼
┌────────────┬────────────┐
│ │ │
▼ ▼ ▼
CATALOG CONTENT SETTINGS
│ │ │
└────────────┴────────────┘
▼
MEDIA
▼
Web klienta
3.3 Odpovědnost jednotlivých vrstev
ENGINE
Obsahuje:
●
●
●
●
●
●
logiku aplikace
komponenty
vykreslování
komunikaci mezi moduly
správu událostí
API vrstvu
Engine nikdy neobsahuje:
●
●
●
data klienta
grafiku klienta
obchodní pravidla klienta
CONFIG
Řídí chování systému.
Například:
●
●
●
●
●
●
●
●
aktivní moduly
AI zapnuto/vypnuto
Social Proof
CRM
kalkulačka hypotéky
jazyk
měna
kontaktní formuláře
CONFIG neobsahuje obsah.
Pouze nastavení.
THEME
Obsahuje:
●
●
●
●
●
●
logo
barvy
fonty
ikony
tlačítka
vizuální styl
THEME nikdy neobsahuje logiku.
CATALOG
Obsahuje strukturovaná produktová data.
Například:
●
●
●
●
●
●
domy
dispozice
ceny
parametry
půdorysy
varianty
CONTENT
Obsahuje textový obsah.
Například:
●
●
●
●
●
popisy
CTA
FAQ
články
marketingové texty
SETTINGS
Obsahuje obchodní informace.
Například:
●
●
●
●
●
●
kontakty
pobočky
CRM
měna
jazyk
pracovní doba
MEDIA
Obsahuje:
●
●
●
●
●
●
fotografie
vizualizace
videa
dokumenty
PDF
půdorysy
3.4 Datové pravidlo
Veškerý obsah je mimo Engine.
Engine pouze:
●
●
●
načítá
interpretuje
vykresluje
To umožňuje:
●
●
●
snadné aktualizace,
jednotnou architekturu,
rychlé implementace.
3.5 Princip implementace
Klient
↓
Google Sheets
↓
Cloudinary
↓
CONFIG
↓
API KEY
↓
Embed Script
↓
Web klienta
↓
HOTOVO
Implementace nesmí vyžadovat úpravy společného Engine.
3.6 Multi-tenant architektura
Každý klient je identifikován pomocí:
API KEY
Například:
SL-7F42D19A
Po načtení Engine:
1. ověří API KEY,
2. načte konfiguraci,
3. načte data,
4. načte vzhled,
5. vykreslí aplikaci.
3.7 Produktové moduly
CORE
Povinné moduly.
Například:
●
●
●
●
●
Galerie
Detail domu
Parametry
CTA
Lead formulář
OPTIONAL
Volitelné moduly.
Například:
●
●
●
●
●
AI
Social Proof
Finance
Compare
Analytics
PREMIUM
Pokročilé moduly.
Například:
●
●
●
●
●
Heatmapy
AI Insight
Dashboard
Marketplace
Pokročilé CRM
3.8 Komponentová architektura
Každý modul se skládá z komponent.
Například:
Gallery
↓
Hero
↓
Carousel
↓
Thumbnail
↓
Fullscreen
↓
Video
Komponenty musí být znovupoužitelné.
3.9 Komunikace mezi moduly
Moduly spolu nikdy nekomunikují přímo.
Používají centrální Event Bus.
Například:
HOUSE
SELECTED
_
↓
Gallery
Analytics
Compare
AI
Lead
Social Proof
To umožňuje:
●
●
●
nízkou provázanost,
snadné rozšiřování,
jednoduché testování.
3.10 Vývojová pravidla
Nová funkce:
1. vzniká pouze v Engine,
2. nesmí narušit architekturu,
3. musí být opakovaně použitelná,
4. musí být konfigurovatelná,
5. nesmí obsahovat data klienta.
3.11 Verzování
Používá se semantické verzování.
Například:
Engine
v1.0.0
↓
Config
v1.0
↓
Theme
v1.0
↓
Catalog
v1.0
Každý release obsahuje:
●
●
●
●
číslo verze,
seznam změn,
datum vydání,
migrační poznámky.
3.12 Rozhodovací princip
Před implementací každé nové funkce se vyhodnocuje:
●
●
●
●
●
patří do Core?
lze ji zobecnit?
zvýší hodnotu většině klientů?
nezvyšuje technický dluh?
lze ji vypnout pomocí Config?
Pokud ne, není součástí společného produktu.
3.13 Architektonické principy
●
●
●
●
●
●
●
●
●
●
●
●
jeden Engine
jedna codebase
konfigurace místo úprav
data mimo Engine
modulární návrh
API-first
mobile-first
white-label
multi-tenant
jednoduchost
vysoká znovupoužitelnost
centrální aktualizace
3.14 Definice úspěšné architektury
Architektura je správná tehdy, pokud:
●
●
●
●
●
nový klient nevyžaduje nový projekt,
implementace probíhá pouze konfigurací,
aktualizace probíhá centrálně,
nové funkce zvyšují hodnotu všech implementací,
Engine zůstává jednoduchý, přehledný a dlouhodobě udržitelný.
