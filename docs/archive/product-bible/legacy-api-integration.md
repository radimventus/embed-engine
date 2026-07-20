ČÁST 09 — API & Integrační architektura
9.1 Filozofie
Embed Engine je navržen jako API-first platforma.
Komponenty nikdy nepracují přímo s databází.
Komponenty nikdy nepracují přímo s Google Sheets.
Komponenty nikdy nepracují přímo s CRM.
Veškerá komunikace probíhá přes jednotnou integrační vrstvu.
9.2 Architektura
ENGINE
│
▼
API LAYER
│
┌─────────┼─────────┐
│ │ │
CONFIG DATA SERVICES
│ │ │
└─────────┼─────────┘
▼
Google Sheets
Cloudinary
CRM
AI
Analytics
Payment
Budoucí služby
Engine nikdy neví, odkud data pocházejí.
9.3 API filozofie
Každý externí systém je pouze poskytovatel služby.
Například:
Google Sheets.
Raynet.
OpenAI.
Cloudinary.
Budoucí ERP.
Všechny mají stejnou architekturu.
9.4 Hlavní služby
Config Service
Vrací:
●
●
●
●
aktivní moduly
Theme
licence
nastavení
Catalog Service
Vrací:
●
●
●
●
domy
ceny
parametry
varianty
Content Service
Vrací:
●
●
●
●
texty
CTA
FAQ
dokumenty
Media Service
Vrací:
●
●
●
fotografie
videa
PDF
Lead Service
Přijímá:
●
●
formuláře
kontakty
Odesílá:
CRM.
Email.
Notifikace.
Analytics Service
Přijímá:
Event Bus.
Ukládá:
Timeline.
Statistiky.
Heatmapy.
AI Service
Přijímá:
dotazy.
Vrací:
odpovědi.
Doporučení.
AI Insight.
9.5 Princip služeb
Každá služba má jedinou odpovědnost.
Například:
Media Service nikdy neposílá Lead.
Lead Service nikdy nenačítá obrázky.
9.6 API KEY
Každý klient má vlastní API KEY.
Například:
SL-93AB71D2
API KEY určuje:
●
●
●
●
●
klienta
licenci
aktivní moduly
Theme
datové zdroje
9.7 Inicializace
Po načtení stránky:
Embed Script
↓
API KEY
↓
Config Service
↓
Catalog
↓
Content
↓
Media
↓
Render
9.8 Budoucí endpointy
Příklad.
/config
/catalog
/content
/media
/leads
/events
/analytics
/ai
/version
Nemusí být REST.
Architektura musí umožnit budoucí změny.
9.9 Výpadek služby
Pokud není dostupná:
Media
↓
zobrazí se Placeholder.
Pokud není dostupný:
Catalog
↓
zobrazí se informace.
Pokud není dostupné:
AI
↓
AI panel se skryje.
Engine nesmí přestat fungovat.
9.10 Verzování API
Každá služba má vlastní verzi.
Například:
Engine
1.0.0
API
1.0
Catalog
1.0
Media
1.0
9.11 Integrace Google Sheets
MVP.
Google Sheets představuje pouze datový provider.
Engine nepozná rozdíl mezi:
Google Sheets
↓
Supabase
↓
REST API
↓
CMS
9.12 Integrace Cloudinary
Media Service vrací pouze URL.
Cloudinary řeší:
●
●
●
●
velikost
formát
CDN
optimalizaci
Engine pouze vykresluje.
9.13 CRM
CRM Connector je samostatná služba.
Například.
Lead
↓
Lead Service
↓
CRM Connector
↓
Raynet
V budoucnu:
●
●
●
●
HubSpot
Pipedrive
Salesforce
vlastní CRM
9.14 AI
AI není součást Engine.
Je službou.
Například.
Question
↓
AI Service
↓
OpenAI
↓
Answer
Později lze poskytovatele změnit.
9.15 Autentizace
Každý požadavek obsahuje:
●
●
●
API KEY
CLIENT
_
VERSION
ID
Volitelně:
●
●
SESSION
USER
ID
ID
_
_
9.16 Bezpečnost
Klient nikdy nevidí:
interní strukturu.
interní API.
ostatní klienty.
administraci.
9.17 Caching
Každá služba může používat vlastní cache.
Například.
Config
dlouhá cache.
Catalog
střední.
Analytics
bez cache.
9.18 Monitoring
Každá služba sleduje:
●
dostupnost,
●
●
●
rychlost,
počet chyb,
odezvu.
Monitoring je centrální.
9.19 Budoucí integrace
Architektura musí umožnit připojení:
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
Google Sheets
Supabase
PostgreSQL
Raynet
OpenAI
Cloudinary
Meta
Google Analytics
Email služby
SMS služby
platební brány
Bez zásahu do Engine.
9.20 Integrace třetích stran
Každá externí služba bude implementována pomocí Connectoru.
Například:
Connector
↓
Transformace
↓
Interní model
↓
Engine
To znamená, že Engine nikdy neřeší konkrétní API jednotlivých poskytovatelů.
9.21 API pravidla
●
●
●
●
●
Engine nikdy nevolá externí služby přímo.
Veškerá komunikace probíhá přes API Layer.
Každá služba má jedinou odpovědnost.
Každá služba je nahraditelná.
Externí poskytovatel nesmí ovlivnit architekturu Engine.
9.22 Definice správné integrační
architektury
Architektura je správná tehdy, pokud lze změnit:
●
●
●
●
●
CRM,
databázi,
AI,
média,
analytiku,
aniž by bylo nutné upravit komponenty Engine.
9.23 Motto integrační architektury
Engine nezná poskytovatele.
Engine zná pouze služby.
Ano. A tady bych udělal jednu důležitou změnu oproti původnímu plánu.
Prvních 9 kapitol tvoří technický základ. Od této chvíle už se dokument začne větvit do
"produkčních" oblastí.
Já bych pokračoval v tomto pořadí:
Část Název Priorita
✅
00
Executive Summary Hotovo
✅
01
Product Vision Hotovo
✅
02
Business Model Hotovo
✅
03
Product Architecture Hotovo
✅
04
UX & Design System Hotovo
✅
05
Functional Modules Hotovo
✅
06
Component Library Hotovo
✅
07
Data Architecture Hotovo
✅
08
Event Architecture Hotovo
✅
09
API & Integration Hotovo
10 Administration (Back Office) ⭐⭐⭐⭐
⭐
11 Dashboard obchodníka (Internal Terminal) ⭐⭐⭐⭐
⭐
12 AI Layer ⭐⭐⭐⭐
☆
13 Analytics & Activity Timeline ⭐⭐⭐⭐
⭐
14 CRM & Automation ⭐⭐⭐⭐
15 Deployment & Hosting ⭐⭐⭐⭐
16 Security & Permissions ⭐⭐⭐⭐
17 Versioning & Release Management ⭐⭐⭐⭐
18 Roadmap produktu ⭐⭐⭐⭐
19 CTO Rules ⭐⭐⭐⭐
20 Appendix ⭐⭐⭐☆
☆
⭐
☆
⭐
⭐
⭐
☆
Ale udělal bych ještě jednu zásadní změnu.
Po dnešní diskusi si myslím, že produkt už vlastně není jeden.
Jsou dva.
Terminál 1
EXTERNÍ
To, co vidí návštěvník.
To jsme právě popsali.
Terminál 2
INTERNÍ
To bude používat:
●
●
●
●
obchodník,
marketing,
majitel firmy,
administrátor.
A myslím, že právě tady vznikne největší konkurenční výhoda.
Ve skutečnosti totiž nebudeš prodávat widget.
Budeš prodávat
Externí obchodník
+
Interní obchodník
Externí část
↓
prodává.
Interní část
↓
řídí obchod.
A myslím, že právě tam bude AI opravdu silná.
Například.
Nový lead
↓
Timeline
↓
AI
↓
"Doporučuji zavolat do 20 minut.
Klient třikrát otevřel financování.
Porovnával pouze dva domy.
Pravděpodobnost uzavření 81 %.
"
To podle mě bude wow efekt.
Proto bych změnil pořadí.
Místo AI bych teď napsal:
ČÁST 10
Internal Terminal
To znamená kompletní návrh interní administrace.
Myslím, že to bude jedna z nejzajímavějších částí celé Bible, protože tam už se nebude
prodávat dům, ale budou se řídit obchodní procesy, klienti, implementace, licence, AI
doporučení i budoucí vývoj produktu.
A podle mě právě tam začne být opravdu vidět, že Embed obchodník není widget, ale
platforma.
