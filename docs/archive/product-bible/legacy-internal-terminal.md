ČÁST 10 — Internal Terminal (Back
Office)
10.1 Poslání
Internal Terminal je řídicí centrum celé platformy.
Nejde o administraci webu.
Jde o pracovní prostředí obchodníka, implementátora a administrátora.
Jeho úkolem je řídit obchodní proces, správu klientů a provoz Embed Engine.
10.2 Filozofie
Externí terminál prodává.
Interní terminál řídí.
Obchodník nesmí hledat informace.
Systém mu je musí nabídnout.
Stejný princip platí pro implementaci i správu klientů.
10.3 Cíloví uživatelé
Super Admin
Správa celé platformy.
Implementátor
Zakládání nových klientů.
Konfigurace.
Nasazení.
Obchodník
Práce s leady.
Aktivity.
CRM.
Marketing
Analytika.
Konverze.
Chování návštěvníků.
Management
KPI.
Licence.
Obrat.
Výkon systému.
10.4 Hlavní moduly
Dashboard
↓
Klienti
↓
Leady
↓
Implementace
↓
Licence
↓
Analytics
↓
AI Insight
↓
CRM
↓
Nastavení
↓
Monitoring
10.5 Dashboard
Po přihlášení uživatel vidí:
●
●
●
●
●
●
nové leady
aktivní klienty
poslední implementace
stav systému
AI doporučení
upozornění
Dashboard musí být přehledný během 30 sekund.
10.6 Klienti
Každý klient má vlastní kartu.
Obsahuje:
●
●
●
●
●
●
●
●
název
licence
API KEY
Theme
aktivní moduly
datum implementace
poslední aktivitu
kontaktní osoby
10.7 Implementace
Každá implementace má vlastní workflow.
Nový klient
↓
Logo
↓
Theme
↓
Google Sheets
↓
Cloudinary
↓
CRM
↓
Embed
↓
Test
↓
Aktivace
Implementátor přesně ví, co zbývá dokončit.
10.8 Embed Generator
Jedna z klíčových funkcí.
Po dokončení implementace systém automaticky vytvoří:
●
●
●
API KEY
Embed Script
instalační návod
Například:
<script>
window.embedSales = {
key: "SL-XXXXXXX"
}
</script>
<script src="https://cdn.embedobchodnik.cz/v1/embed.min.js"></script>
10.9 Licence
Každý klient má:
●
●
●
●
●
tarif
počet modulů
datum aktivace
fakturační stav
historii změn
Licence řídí dostupné funkce.
10.10 Správa modulů
Každý modul lze:
●
●
●
●
zapnout
vypnout
testovat
označit jako beta
Bez zásahu do kódu.
10.11 Správa Theme
Administrátor může měnit:
●
●
●
●
●
logo
barvy
fonty
ikony
CTA styl
Vše bez zásahu do Engine.
10.12 Správa dat
Terminál zobrazuje stav:
●
●
●
●
Google Sheets
Cloudinary
CRM
API
V případě chyby zobrazí doporučené řešení.
10.13 Monitoring
Sledují se:
●
●
●
●
●
dostupnost Engine
rychlost načítání
počet chyb
poslední synchronizace
verze klienta
Monitoring je centrální.
10.14 Activity Timeline
Každý klient má časovou osu.
Například:
09:10
Synchronizace Google Sheets
↓
09:14
Nový lead
↓
09:15
CRM
↓
09:18
AI Insight vytvořen
↓
09:20
Email obchodníkovi
10.15 AI Panel
AI pomáhá administrátorovi.
Například:
●
●
●
●
upozorní na nefunkční data
doporučí aktualizaci
upozorní na pokles konverzí
navrhne aktivaci nového modulu
AI je asistent.
Ne administrátor.
10.16 Správa verzí
Terminál zobrazuje:
Engine
↓
Verze klienta
↓
Datum release
↓
Nové funkce
↓
Dostupné aktualizace
Administrátor může rozhodnout o nasazení nové verze.
10.17 Oprávnění
Role určují přístup.
Například:
Super Admin
↓
vše.
Implementátor
↓
implementace.
Obchodník
↓
leady.
Marketing
↓
analytika.
Klient
↓
pouze vlastní data.
10.18 Vyhledávání
Globální vyhledávání umožňuje najít:
●
●
●
●
●
●
klienta
lead
dům
API KEY
implementaci
dokument
Jedno vyhledávací pole pro celý systém.
10.19 Centrum oznámení
Systém upozorňuje na:
●
●
●
●
●
nové leady
nefunkční integrace
nové verze
expiraci licence
chyby synchronizace
Každé oznámení obsahuje doporučenou akci.
10.20 KPI Dashboard
Administrace zobrazuje:
●
●
●
●
●
●
●
●
●
počet klientů
počet aktivních licencí
počet leadů
konverze
MRR
ARR
průměrnou dobu implementace
aktivní moduly
výkon systému
10.21 Budoucí rozšíření
Internal Terminal bude postupně obsahovat:
●
●
●
●
●
●
správu fakturace
správu Marketplace
AI správce systému
release management
správu partnerů
správu agentur
●
●
auditní log
vzdálenou diagnostiku klientů
10.22 Definice úspěchu
Internal Terminal je úspěšný tehdy, pokud:
●
●
●
●
●
nový klient je připraven během několika minut,
implementátor nemusí upravovat kód,
obchodník okamžitě vidí potřebné informace,
administrátor má přehled o celé platformě,
AI aktivně pomáhá s provozem systému.
10.23 Filozofie
Externí terminál vytváří obchodní příležitosti.
Interní terminál je proměňuje v obchodní výsledky.
Oba terminály společně tvoří jeden produkt.
10.24 Motto Internal Terminal
Externí terminál prodává.
Interní terminál řídí obchod.
Společně tvoří digitálního obchodníka.
Perfektní. Myslím, že teď přichází kapitola, která bude jednou jednou z nejcennějších částí
celého produktu.
A tady bych udělal jednu změnu oproti původnímu návrhu.
Nepsal bych kapitolu AI Layer.
To je technický pohled.
Já bych ji nazval:
