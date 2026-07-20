ČÁST 07 — Datová architektura
7.1 Filozofie dat
Data jsou nejcennější aktivum celého systému.
Engine není databáze.
Engine pouze interpretuje data.
Veškerý obsah, konfigurace i média existují mimo Engine.
Díky tomu lze:
●
●
●
●
aktualizovat obsah bez zásahu do kódu,
přidat nového klienta bez úprav Enginu,
připojit různé zdroje dat,
snadno škálovat produkt.
7.2 Datová architektura
DATA SOURCES
│
┌─────────────┼─────────────┐
│ │ │
CATALOG CONTENT SETTINGS
│ │ │
└─────────────┼─────────────┘
▼
MEDIA
▼
API Layer
▼
Embed Engine
7.3 Princip "Single Source of Truth"
Každá informace existuje pouze na jednom místě.
Například:
Cena domu
↓
CATALOG
Nikdy:
CATALOG
●
HTML
●
JavaScript
To eliminuje nekonzistence.
7.4 Datové domény
Data jsou rozdělena do logických domén.
CATALOG
Produktová data.
Například:
●
●
●
domy
varianty
dispozice
●
●
●
ceny
parametry
příplatky
CONTENT
Marketingový obsah.
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
texty
SETTINGS
Firemní nastavení.
Například:
●
●
●
●
●
●
●
kontakty
pobočky
měna
jazyk
CRM
licence
aktivní moduly
MEDIA
Multimédia.
Například:
●
●
●
●
●
fotografie
videa
vizualizace
PDF
půdorysy
ANALYTICS
Behaviorální data.
Například:
●
●
●
●
●
události
návštěvy
čas
porovnání
AI interakce
7.5 Identifikátory
Každý objekt má vlastní ID.
Například:
HOUSE
ID
_
PROPERTY
ID
_
MEDIA
ID
_
LEAD
ID
_
CLIENT
ID
_
API
KEY
_
Nikdy se nepoužívají názvy jako primární identifikátory.
7.6 Datové vazby
Například:
HOUSE
↓
MEDIA
↓
VIDEO
↓
DOCUMENTS
↓
PRICE
Vazby jsou založeny na ID.
Ne na názvech.
7.7 MVP Datový zdroj
První verze používá:
Google Sheets.
Každá tabulka představuje jednu datovou doménu.
Například:
Domy
Parametry
Ceník
CTA
Kontakty
FAQ
Výhody:
●
●
●
●
jednoduchá správa,
nízké náklady,
rychlé úpravy,
bez administrace.
7.8 Budoucí zdroje
Architektura musí umožnit přechod na:
●
●
●
●
●
Supabase
PostgreSQL
REST API
GraphQL
vlastní administraci
Bez změny Engine.
7.9 MEDIA
Veškerá média se načítají pomocí URL.
Nikdy nejsou součástí Engine.
Preferovaný provider:
Cloudinary.
Požadavky:
●
●
●
●
●
automatická optimalizace,
WebP,
AVIF,
responzivní velikosti,
CDN.
7.10 CONFIG
CONFIG není obsah.
CONFIG řídí chování systému.
Například:
AI
true
Compare
false
Finance
true
CRM
Raynet
Language
cs
CONFIG se načítá před vykreslením aplikace.
7.11 Datová validace
Každý zdroj dat musí projít validací.
Kontroluje se:
●
●
●
●
●
povinné položky,
datové typy,
duplicity,
chybějící média,
neplatné odkazy.
Pokud validace selže, Engine použije bezpečné výchozí hodnoty a zaznamená chybu do
logu.
7.12 Cache
Engine používá víceúrovňovou cache.
1.
Konfigurace.
2.
Data.
3.
Média.
Cílem je minimalizovat počet požadavků.
7.13 Lokalizace
Veškeré texty jsou součástí CONTENT.
Nikdy nejsou natvrdo v komponentách.
To umožňuje:
●
●
●
více jazyků,
více měn,
lokalizaci.
7.14 Import dat
Budoucí zdroje:
Google Sheets.
CSV.
Excel.
REST API.
CRM.
Každý import využívá stejný interní datový model.
7.15 Export dat
Systém bude umět exportovat:
●
●
●
●
●
leady,
analytiku,
katalog,
reporty,
AI Insight.
Formáty:
CSV.
Excel.
JSON.
PDF.
7.16 Datový životní cyklus
DATA
↓
VALIDACE
↓
MAPOVÁNÍ
↓
CACHE
↓
ENGINE
↓
EVENT BUS
↓
UI
7.17 Datové principy
●
●
●
●
●
●
žádná data v Engine,
žádné duplicity,
jedno ID = jeden objekt,
jedna pravda,
oddělení obsahu od logiky,
oddělení konfigurace od obsahu.
7.18 Datová bezpečnost
Každý klient má vlastní datový prostor.
Přístup je řízen pomocí:
●
●
●
API KEY,
CLIENT
ID,
_
oprávnění.
Klient nikdy nemá přístup k datům jiného klienta.
7.19 Budoucí administrace
Administrace nebude editovat Engine.
Bude editovat pouze:
●
●
●
CATALOG,
CONTENT,
SETTINGS,
●
●
MEDIA,
CONFIG.
Tím zůstává Engine stabilní.
7.20 Definice správné datové
architektury
Datová architektura je správná tehdy, pokud:
●
●
●
●
●
lze změnit obsah bez zásahu do kódu,
lze připojit nový zdroj dat bez změny komponent,
lze přidat nového klienta pouze konfigurací,
data zůstávají konzistentní,
Engine nikdy neobsahuje obchodní data klienta.
7.21 Motto datové architektury
Data se mění každý den.
Engine se mění pouze tehdy, když roste hodnota produktu.
