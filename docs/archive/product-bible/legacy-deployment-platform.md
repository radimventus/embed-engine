ČÁST 14 — Deployment & Platform
Architecture
14.1 Poslání
Deployment Architecture popisuje způsob nasazení Embed Engine ke klientům.
Cílem je umožnit implementaci během několika minut bez individuálního vývoje.
Každý klient používá stejný Engine.
Mění se pouze konfigurace a data.
14.2 Filozofie
Produkt se neinstaluje.
Produkt se připojuje.
Stejně jako dnes klient vloží:
●
●
●
●
Google Analytics,
Meta Pixel,
YouTube,
Google Maps,
vloží také Embed obchodníka.
14.3 Architektura nasazení
Embed Engine
CDN / Hosting
│
│
embed.min.js
│
────────────────────────────────────
WEB STAVEBNÍ FIRMY
WEB DEVELOPERA
WEB PROJEKTU
────────────────────────────────────
│
API KEY
│
CONFIG + DATA + MEDIA
│
Render stránky
14.4 Implementační proces
Každá implementace probíhá stejným způsobem.
Nový klient
↓
Založení účtu
↓
Vytvoření API KEY
↓
Nastavení Theme
↓
Připojení Google Sheets
↓
Připojení Cloudinary
↓
Generování Embed Scriptu
↓
Vložení na web
↓
Hotovo
Bez úprav společného Engine.
14.5 Hosting
Engine je hostován centrálně.
Klient neřeší:
●
●
●
●
servery,
aktualizace,
infrastrukturu,
deployment.
Klient využívá službu.
14.6 MVP infrastruktura
První verze využívá:
Frontend
●
Vercel
Data
●
Média
Google Sheets
●
Cloudinary
Doména
●
embedobchodnik.cz
Monitoring
●
základní logování
Cílem je minimální provozní režie.
14.7 Budoucí infrastruktura
Architektura musí umožnit přechod na:
●
●
●
●
●
●
Supabase,
PostgreSQL,
Cloudflare,
vlastní administraci,
vlastní API,
object storage.
Bez změny architektury Engine.
14.8 Embed Script
Klient implementuje pouze dva krátké skripty.
<script>
window.embedSales = {
key: "API
KEY"
_
}
</script>
<script src="https://cdn.embedobchodnik.cz/v1/embed.min.js"></script>
Žádný další zásah do webu není potřeba.
14.9 White Label
Embed Engine respektuje vizuální identitu klienta.
Na stránce se nezobrazuje:
●
●
●
logo Embed obchodníka,
branding platformy,
cizí odkazy.
Návštěvník vnímá řešení jako přirozenou součást webu klienta.
14.10 Aktualizace
Engine se aktualizuje centrálně.
Klient nemusí:
●
●
●
nahrávat nové soubory,
aktualizovat plugin,
instalovat novou verzi.
Po vydání nové verze ji může administrátor aktivovat podle pravidel release managementu.
14.11 Oddělení vrstev
Každá implementace se skládá pouze z:
ENGINE
↓
CONFIG
↓
THEME
↓
DATA
↓
MEDIA
Nikdy nevzniká samostatný projekt.
14.12 Více webů
Jeden klient může používat více implementací.
Například:
●
●
●
●
hlavní web,
developerský projekt,
microsite,
landing page.
Vše využívá stejný Engine.
14.13 Výkon
Cílové parametry MVP:
●
●
●
●
●
rychlé načtení skriptu,
asynchronní načítání,
neblokovat render stránky,
Lazy Loading komponent,
optimalizace médií.
Výkon je součástí produktu.
14.14 Monitoring
Platforma sleduje:
●
●
●
●
●
dostupnost,
rychlost načítání,
chybovost,
dostupnost datových zdrojů,
stav integrací.
Monitoring je centrální.
14.15 Recovery
Při výpadku některé služby:
●
●
●
●
zobrazit bezpečný fallback,
zachovat funkčnost webu,
zaznamenat chybu,
upozornit administrátora.
Engine nikdy nesmí způsobit nefunkčnost webu klienta.
14.16 Deployment Pipeline
Každá nová verze prochází:
Vývoj
↓
Interní test
↓
Pilotní klienti
↓
Release Candidate
↓
Produkce
Každý krok musí být ověřen.
14.17 Škálování
Architektura musí umožnit růst od:
1 klienta
↓
↓
↓
10 klientů
100 klientů
1000 klientů
Bez změny základního konceptu.
14.18 Architektonické pravidlo
Implementace nového klienta nikdy nesmí znamenat:
●
●
●
kopii projektu,
úpravu Engine,
nový deployment.
Nový klient vzniká pouze konfigurací.
14.19 Definice úspěchu
Deployment je správně navržen tehdy, pokud:
●
●
nový klient je nasazen během několika minut,
není potřeba měnit zdrojový kód,
●
●
●
aktualizace probíhají centrálně,
provoz je stabilní,
infrastruktura roste společně s produktem.
14.20 Motto Deployment Architecture
Engine se nasazuje jednou.
Klienti se pouze připojují.
