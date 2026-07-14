CLIENT STUDIO
Mobile Interaction Specification v1.0 (FIXED)
Blok 02 – Procházka domem
Filosofie
Na mobilním telefonu není půdorys hlavním obsahem.
Hlavním obsahem je prožívání domu.
Půdorys slouží pouze jako inteligentní navigace.
Výchozí stav
Klient vidí:
●
●
●
hlavní fotografii / video
galerii miniatur
lištu
VIDEO | FOTKY
●
tlačítko
📐 Procházet podle místností
Otevření navigace
Kliknutí na
📐 Procházet podle místností
vysune zespodu (Bottom Sheet)
cca 70 % výšky displeje.
Obsahuje:
●
●
půdorys
seznam místností
Dvojí způsob navigace (FIX)
Klient může vybrat místnost dvěma rovnocennými způsoby.
Varianta A
Klikne do půdorysu.
↓
Místnost se zvýrazní.
↓
Ve výpisu se označí stejná místnost.
Varianta B
Klikne na název místnosti.
↓
Ve výpisu se označí.
↓
Na půdorysu se zvýrazní stejná místnost.
Obě navigace jsou plně synchronní.
Po výběru
Jakmile je místnost vybrána:
1.
Okamžitě se připraví nová galerie.
(bez čekání)
2.
Přibližně po 0,5 s
Bottom Sheet
plynule sjede dolů.
3.
Klient opět vidí
hlavní fotografii.
Ta už zobrazuje vybranou místnost.
Galerie pod ní je současně přefiltrovaná pouze na fotografie této místnosti.
Galerie
Pokud není vybraná žádná místnost
↓
zobrazuje všechny fotografie i video.
Pokud je vybrána místnost
↓
zobrazuje pouze fotografie této místnosti.
Zrušení filtru
V galerii je vždy první položka
🏠 Celý dům
Kliknutí:
↓
zruší filtr
↓
vrátí kompletní galerii.
UX princip
Klient nikdy nemusí přemýšlet,
zda má kliknout
na půdorys
nebo
na seznam místností.
Obojí vede ke stejnému výsledku.
UX princip 02
Půdorys není cílem.
Půdorys je pouze navigace.
Jakmile splní svou úlohu,
ustoupí do pozadí
a vrátí klienta zpět
k prožívání domu.
A myslím, že jsme právě našli jeden z nejsilnějších
principů celého produktu.
Doteď jsme mluvili o interaktivním půdorysu.
Po dnešku bych ten modul přejmenoval.
Nejmenuje se totiž podle technologie.
Jmenuje se podle účelu.
Já bych jej od této chvíle interně nazýval:
Navigace domem
ČÁST 01 — Product Constitution
1.1 Poslání
Product Constitution představuje nejvyšší vrstvu architektury produktu Embed obchodník.
Nejde o technickou dokumentaci.
Nejde o obchodní plán.
Jde o soubor principů, které určují, jak se bude produkt vyvíjet bez ohledu na použitou
technologii, velikost týmu nebo budoucí verzi Engine.
Každé architektonické, produktové i obchodní rozhodnutí musí být s tímto dokumentem v
souladu.
1.2 Mise produktu
Posláním Embed obchodníka je zvýšit úspěšnost digitálního prodeje bydlení prostřednictvím
inteligentní obchodní vrstvy integrované přímo do webu klienta.
Produkt propojuje:
●
●
●
●
●
●
prezentaci,
edukaci,
obchod,
analytiku,
automatizaci,
inteligenci.
Výsledkem není pouze modernější web.
Výsledkem je efektivnější obchodní proces.
1.3 Vize
Vytvořit standard digitálního obchodního procesu pro prodej bydlení.
Stejně jako dnes téměř každý web obsahuje analytické nástroje, mapy nebo videa, chceme,
aby Embed obchodník představoval přirozenou součást každého profesionálního webu
developera, stavební firmy nebo prodejce stavebních pozemků.
1.4 Sedm zákonů Embed Engine
Zákon 1
Existuje pouze jeden společný Engine.
Nikdy nevznikají samostatné verze produktu.
Zákon 2
Konfigurace má vždy přednost před úpravou zdrojového kódu.
Každá nová implementace musí vzniknout změnou konfigurace, nikoliv vytvářením nové
větve aplikace.
Zákon 3
Data nikdy nejsou součástí Engine.
Engine interpretuje data.
Nevlastní je.
Zákon 4
Každá komponenta řeší jedinou odpovědnost.
Komponenty jsou malé, nezávislé a znovupoužitelné.
Zákon 5
Každá implementace zvyšuje hodnotu společného produktu.
Žádná implementace nesmí být slepou zakázkou.
Každý projekt musí přispět ke zlepšení Engine.
Zákon 6
Každá nová funkce musí přinést hodnotu většině klientů.
Pokud řeší pouze individuální požadavek, patří do konfigurace nebo modulu, nikoli do Core.
Zákon 7
Architektura má vždy přednost před krátkodobou rychlostí vývoje.
Krátkodobé zrychlení nesmí ohrozit dlouhodobou udržitelnost produktu.
1.5 Produktové principy
Embed obchodník musí být vždy:
●
●
●
●
●
●
●
●
jednoduchý,
rychlý,
modulární,
konfigurovatelný,
škálovatelný,
opakovatelný,
bezpečný,
dlouhodobě udržitelný.
Tyto vlastnosti mají vyšší prioritu než množství funkcí.
1.6 North Star Metric
Úspěch produktu nebude měřen počtem:
●
●
●
●
klientů,
implementací,
modulů,
řádků kódu.
Hlavní metrikou produktu je:
Počet kvalifikovaných obchodních příležitostí vytvořených Embed
obchodníkem.
Veškerý vývoj musí tuto metriku přímo nebo nepřímo podporovat.
1.7 Product Decision Framework
Každá nová funkce musí projít pěti otázkami.
Zvýší obchodní hodnotu?
↓
Pomůže obchodníkovi?
↓
Pomůže většině klientů?
↓
Je modulární?
↓
Je dlouhodobě udržitelná?
Pokud nejsou alespoň tři odpovědi ANO, funkce nebude součástí společného Engine.
1.8 Co produkt nikdy nebude
Embed obchodník nebude:
●
●
●
●
●
jednorázovým projektem,
individuálním softwarem pro jednoho klienta,
katalogem domů,
CRM systémem,
konfigurátorem staveb.
Jeho úlohou je propojovat existující systémy a zvyšovat jejich obchodní výkon.
1.9 Architektonická mantra
Jeden Engine.
Jedna codebase.
Nekonečně mnoho implementací.
1.10 Závěrečná definice
Product Constitution představuje nejvyšší autoritu celého produktu.
Pokud je některé budoucí rozhodnutí v rozporu s tímto dokumentem, musí být
přehodnoceno nebo zamítnuto.
ČÁST 02 — Product Flywheel
2.1 Poslání
Product Flywheel popisuje mechanismus, díky kterému se hodnota produktu dlouhodobě
zvyšuje.
Nejde o marketingový funnel.
Jde o samoposilující systém růstu.
Každá nová implementace musí přispívat nejen k obratu, ale i ke kvalitě celého produktu.
2.2 Základní princip
Každý nový klient přináší:
●
●
●
●
●
nový příjem,
novou implementaci,
nové zkušenosti,
nová data,
nové ověření hypotéz.
Tyto vstupy zlepšují společný Engine, který následně pomáhá všem dalším klientům.
2.3 Product Flywheel
Nový klient
↓
Implementace
↓
Nová data
↓
Lepší Engine
↓
Vyšší konverze
↓
Více referencí
↓
Více klientů
Každé otočení Flywheel zvyšuje hodnotu celé platformy.
2.4 Ekonomika Flywheel
Každá implementace vytváří současně čtyři aktiva:
1. okamžitý příjem,
2. referenci,
3. obchodní data,
4. zlepšení společného Engine.
To je hlavní rozdíl oproti klasické agentuře.
2.5 Evoluce hodnoty
Na začátku je největší hodnotou implementace.
Později licence.
Následně data.
Nakonec Intelligence Layer.
Dlouhodobě se hlavní hodnota přesouvá od práce k duševnímu vlastnictví.
2.6 Síťový efekt
Každý nový klient zvyšuje hodnotu produktu pro všechny ostatní klienty.
Čím více implementací vznikne, tím kvalitnější budou:
●
●
●
doporučení,
analytika,
AI,
●
obchodní modely.
To vytváří přirozenou konkurenční výhodu.
2.7 Strategické pravidlo
Každá implementace musí odpovědět na otázku:
Co se díky ní naučí společný Engine?
Pokud je odpověď „nic“
, implementace nepřispívá k dlouhodobé hodnotě produktu.
2.8 Konečný cíl
Cílem není maximalizovat počet projektů.
Cílem je maximalizovat hodnotu společného Engine.
Každá další implementace musí být jednodušší, rychlejší a hodnotnější než předchozí.
2.9 Motto Product Flywheel
Klienti financují vývoj.
Vývoj zvyšuje hodnotu Engine.
Engine pomáhá získávat další klienty.
ČÁST 03 — Competitive Moat
3.1 Poslání
Competitive Moat popisuje dlouhodobé konkurenční výhody produktu.
Nejde o seznam konkurentů.
Jde o vysvětlení, proč bude obtížné produkt dlouhodobě kopírovat.
3.2 Filozofie
Software lze zkopírovat.
Architekturu lze napodobit.
Skutečnou konkurenční výhodu však tvoří propojení technologie, zkušeností, dat a
obchodního know-how.
3.3 Pět pilířů konkurenční výhody
1. Shared Engine
Jediný společný Engine využívaný všemi klienty.
Každá implementace zvyšuje jeho hodnotu.
2. Repeatable Implementation
Standardizovaný proces implementace.
Nový klient vzniká konfigurací, nikoli vývojem.
To umožňuje rychlý růst bez lineárního růstu nákladů.
3. Behavioral Intelligence
Platforma se učí z anonymizovaných obchodních vzorců.
Nevzniká pouze databáze návštěv.
Vzniká znalost toho, jak lidé rozhodují při výběru bydlení.
4. Intelligence Layer
Doporučení, Lead Score, predikce a obchodní asistence.
Nejde o obecnou AI.
Jde o inteligenci zaměřenou na konkrétní obchodní proces.
5. Know-how
Nejcennější aktivum firmy.
Vzniká kombinací:
●
●
●
●
●
realizovaných projektů,
obchodních zkušeností,
dat,
testování,
zpětné vazby klientů.
Toto know-how nelze koupit ani rychle napodobit.
3.4 Co konkurence uvidí
Konkurence uvidí:
●
●
widget,
galerie,
●
●
●
AI,
formuláře,
dashboard.
To jsou viditelné části systému.
3.5 Co konkurence neuvidí
Skutečnou hodnotu tvoří:
●
●
●
●
●
architektura Engine,
behaviorální modely,
doporučovací logika,
rozhodovací framework,
obchodní zkušenosti.
Právě ty představují hlavní obranný příkop produktu.
3.6 Strategická výhoda
Každý nový klient:
●
●
●
●
financuje další vývoj,
přidává nová data,
zlepšuje doporučení,
zvyšuje hodnotu celé platformy.
To vytváří síťový efekt, který je obtížné dohnat.
3.7 Asset Pyramid
Engine
↓
Implementace
↓
Behaviorální data
↓
Intelligence Layer
↓
Know-how
↓
Standard trhu
S každou další úrovní roste hodnota i obtížnost napodobení.
3.8 Dlouhodobá ambice
Cílem není být nejlepší aplikací na trhu.
Cílem je stát se standardní obchodní vrstvou digitálního prodeje bydlení.
Pokud se Embed obchodník stane přirozenou součástí většiny profesionálních webů v
oboru, vznikne konkurenční výhoda, kterou nebude možné získat pouhým vývojem
podobného softwaru.
3.9 Motto Competitive Moat
Software lze zkopírovat.
Know-how vznikající z tisíců obchodních interakcí nikoli.
Embed Engine Bible v1.0
ČÁST 00 — Executive Summary
0.1 Poslání
Embed obchodník je digitální obchodní vrstva určená pro weby stavebních firem, developerů
a dalších subjektů prodávajících bydlení.
Jeho cílem je zvýšit počet kvalifikovaných poptávek, zlepšit obchodní rozhodování a vytvořit
jednotnou platformu pro online prodej bydlení.
Produkt propojuje obchod, marketing, vizuální prezentaci, analytiku a umělou inteligenci do
jednoho společného systému.
0.2 Produktová vize
Vybudovat standardní prodejní platformu pro online prodej bydlení, kterou bude možné
během několika minut implementovat na libovolný web.
Každá nová implementace rozšiřuje hodnotu společného produktu.
Každý nový klient financuje další vývoj společného enginu.
Nevznikají individuální verze systému.
0.3 Dlouhodobý cíl
Vytvořit modulární SaaS platformu postavenou na jednom společném enginu, která bude
sloužit jako digitální obchodník pro celý segment bydlení.
Platforma bude využitelná pro:
●
●
●
●
●
●
stavební firmy
developery
prodejce stavebních pozemků
developerské projekty
realitní kanceláře
další příbuzné segmenty
0.4 Produktové principy
Vývoj produktu se řídí následujícími pravidly:
●
●
●
●
●
●
●
jeden společný Engine
jedna codebase
jedna architektura
jedna datová struktura
jedna implementace
jeden deployment
více klientů (multi-tenant)
Veškeré nové funkce vznikají pouze ve společném enginu.
Nikdy nevznikají individuální verze produktu.
0.5 Definice produktu
Produkt se skládá ze dvou vrstev.
Embed Engine
Technologické jádro produktu.
Obsahuje veškerou logiku systému.
Je společné pro všechny klienty.
Je verzováno pomocí semantického verzování.
Embed obchodník
Obchodní produkt dodávaný zákazníkovi.
Obsahuje:
●
●
●
●
●
●
●
●
implementaci
konfiguraci
vizuální přizpůsobení
propojení dat
AI
analytiku
podporu
průběžný rozvoj
Zákazník kupuje Embed obchodníka.
Vývoj probíhá na Embed Enginu.
0.6 Produktová filozofie
Produkt není vyvíjen jako software na zakázku.
Každá implementace představuje další instanci stejného produktu.
Veškerá obchodní hodnota vzniká rozvojem společného enginu.
Každá nová implementace musí zvýšit hodnotu celého systému.
0.7 Strategické cíle
Krátkodobé
●
●
●
●
ověřit produkt na pilotních implementacích
standardizovat proces implementace
vytvořit stabilní instalační model
vybudovat první licenční příjmy
Střednědobé
●
●
●
●
●
vytvořit vlastní administraci
integrovat CRM
rozšířit AI
zavést behaviorální analytiku
zkrátit implementaci pod 30 minut
Dlouhodobé
●
●
●
●
stát se standardní obchodní vrstvou pro online prodej bydlení
vybudovat síť stovek aktivních klientů
vytvořit modulární platformu s Marketplace
rozšířit produkt na další segmenty trhu
0.8 Strategická synergie
TEI
│
edukace a akvizice trhu
│
▼
Embed obchodník
│
┌───────────┼────────────┐
│ │ │
Vizualizace Implementace Licence
│ │ │
└───────────┼────────────┘
│
▼
Behaviorální data a know-how
│
▼
Další vývoj Embed Enginu
│
▼
Vyšší hodnota produktu
0.9 Rozhodovací pravidlo
Každé rozhodnutí musí pozitivně odpovědět alespoň na jednu z následujících otázek:
●
●
●
●
●
Zvýší tato funkce počet kvalifikovaných poptávek?
Zvýší hodnotu společného enginu pro většinu klientů?
Sníží čas implementace?
Zlepší obchodní rozhodování?
Lze ji opakovaně využít u dalších klientů?
Pokud není splněna ani jedna podmínka, funkce nebude součástí společného enginu.
0.10 Motto projektu
Jeden Engine. Jedna architektura. Jeden produkt. Neomezený počet implementací.
ČÁST 01 — Product Vision
1.1 Produkt
Embed obchodník je modulární digitální obchodní vrstva, která se pomocí jediného embed
kódu integruje do webu klienta a aktivně pomáhá prodávat bydlení.
Je navržen jako společný produkt pro všechny klienty.
Každá implementace představuje pouze novou instanci stejného systému.
1.2 Poslání
Zvyšovat úspěšnost online prodeje bydlení.
Pomáhat návštěvníkům s výběrem.
Poskytovat obchodníkům kvalitnější informace.
Standardizovat digitální obchodní proces.
1.3 Hlavní problém trhu
Většina webů stavebních firem a developerů funguje jako katalog.
Nabízí fotografie, půdorysy a technické informace.
Nevede návštěvníka obchodním procesem.
Nepracuje s jeho chováním.
Neposkytuje obchodníkovi informace potřebné pro kvalitní navázání kontaktu.
Výsledkem je nízká konverze a ztráta velké části potenciálních zákazníků.
1.4 Řešení
Embed obchodník přidává na web klienta digitální obchodní vrstvu.
Ta:
●
●
●
●
●
●
●
vede návštěvníka výběrem
pomáhá porovnávat varianty
odpovídá na otázky
vytváří důvěru
motivuje ke kontaktu
sbírá obchodně významná data
předává kvalifikované leady do CRM
1.5 Hodnota pro návštěvníka
●
●
●
●
●
●
●
jednodušší orientace
lepší rozhodování
rychlejší nalezení vhodného domu
okamžité odpovědi
přehledné porovnání
kvalitnější informace
menší informační zahlcení
1.6 Hodnota pro klienta
●
●
●
●
●
●
●
více kvalifikovaných poptávek
vyšší konverze webu
vyšší hodnota každého návštěvníka
lepší obchodní příprava
jednotný obchodní proces
modernější prezentace značky
průběžné zlepšování díky aktualizacím Engine
1.7 Hodnota pro obchodníka
Obchodník neobdrží pouze kontakt.
Obdrží obchodní kontext.
Například:
●
●
●
●
●
který dům návštěvník sledoval
jak dlouho jej studoval
co porovnával
která videa přehrál
které parametry jej zajímaly
●
●
jaké materiály si otevřel
kde pravděpodobně váhal
Telefonát nezačíná otázkou:
"O který dům jste měl zájem?"
Začíná připravenou obchodní konverzací.
1.8 Cílové segmenty
Primární
Stavební firmy prodávající typové nebo individuální rodinné domy.
Sekundární
Developerské společnosti.
Terciární
Prodejci stavebních pozemků.
Budoucí
●
●
●
●
●
realitní kanceláře
developerské projekty
investiční projekty
výrobci modulových domů
zahraniční trhy
1.9 Persony
Investor
Hledá vhodné bydlení.
Porovnává možnosti.
Potřebuje jistotu.
Má mnoho otázek.
Obchodník
Potřebuje kvalitní lead.
Chce vědět, jak zákazník přemýšlel.
Potřebuje zkrátit cestu k uzavření obchodu.
Marketingový manažer
Potřebuje zvýšit výkon webu.
Sleduje konverze.
Vyhodnocuje kampaně.
Majitel firmy
Zajímá jej návratnost investice.
Chce více obchodních příležitostí.
Očekává dlouhodobou hodnotu.
1.10 Positioning
Embed obchodník není katalog.
Není konfigurátor.
Není CRM.
Není chatbot.
Je digitální obchodní vrstva propojující všechny tyto oblasti do jednoho obchodního procesu.
1.11 Konkurenční výhoda
Výhodou není jednotlivá funkce.
Výhodou je propojení:
●
●
●
●
●
●
●
●
obchodního procesu
vizualizací
videí
AI
behaviorální analytiky
CRM
Social Proof
jednotného Enginu
Konkurence obvykle řeší pouze jednotlivé části tohoto procesu.
1.12 Produktové pravidlo
Každá nová funkce musí splnit alespoň jednu podmínku:
●
●
●
●
●
zvýšit konverzi
zvýšit kvalitu leadů
zlepšit obchodní rozhodování
zkrátit implementaci
zvýšit hodnotu společného Enginu
Funkce, které tyto podmínky nesplňují, nebudou součástí produktu.
1.13 Definice úspěchu
Produkt je úspěšný tehdy, pokud:
●
●
●
●
●
●
implementace je rychlá a opakovatelná,
klient pravidelně využívá systém,
obchodníci aktivně pracují s daty,
návštěvníci snadno nacházejí relevantní informace,
počet kvalifikovaných poptávek roste,
každá nová implementace financuje další rozvoj společného Enginu.
1.14 Dlouhodobá ambice
Vybudovat standardní digitální obchodní vrstvu pro online prodej bydlení.
Stejně jako se dnes běžně implementují:
●
●
●
●
Google Analytics,
Meta Pixel,
Google Maps,
YouTube video,
má být v budoucnu běžnou součástí webu také Embed obchodník.
Jeho instalace nesmí být vnímána jako vývoj softwaru, ale jako standardní implementace
profesionálního obchodního nástroje.
ČÁST 02 — Business Model
2.1 Obchodní filozofie
Embed obchodník je produktizovaná služba postavená na společném SaaS enginu.
Klient nekupuje software.
Klient kupuje funkční obchodní řešení.
Software je prostředkem.
Hodnotou je vyšší počet kvalitních obchodních příležitostí.
2.2 Hodnotový řetězec
Marketing
↓
Web klienta
↓
Embed obchodník
↓
Lead
↓
CRM
↓
Obchodník
↓
Prodej domu
↓
Reference
↓
Další implementace
2.3 Obchodní model
Každý nový klient vytváří čtyři zdroje příjmů.
1. Implementace
Jednorázová.
Obsahuje:
●
●
●
●
●
analýzu
nastavení
grafické přizpůsobení
propojení dat
spuštění
2. Visual Tuning
Volitelná služba.
Obsahuje:
●
●
●
●
vizualizace
produktové rendery
úpravy fotografií
grafické materiály
3. Produktová videa
Volitelná služba.
Obsahuje:
●
●
●
●
videoprohlídky
promo videa
animace
reels
●
sociální sítě
4. Licence
Opakovaný měsíční příjem.
Obsahuje:
●
●
●
●
●
●
●
provoz
hosting
AI
analytiku
podporu
aktualizace
nové funkce
2.4 Synergie produktů
TEI
│
vzdělávání trhu
│
▼
Embed obchodník
│
┌───────────┼────────────┐
│ │ │
Vizualizace Implementace Licence
│ │ │
└───────────┼────────────┘
│
▼
Developerské projekty
│
▼
Další rozvoj společného Engine
2.5 Životní cyklus klienta
TEI
↓
Landing Page
↓
Obchodní schůzka
↓
Pilot
↓
Implementace
↓
Licence
↓
Další služby
↓
Reference
↓
Nový klient
2.6 Pilotní model
Pilot není sleva.
Pilot je společný vývoj produktu.
Klient získává:
●
●
●
zvýhodněnou implementaci
zvýhodněnou licenci
prioritu vývoje
Dodavatel získává:
●
●
●
●
zpětnou vazbu
referenci
případovou studii
ověření funkcí
2.7 Cenový model
Implementace
40–80 tis. Kč
Visual Tuning
30–120 tis. Kč
Video
10–50 tis. Kč
Licence
2–5 tis. Kč měsíčně
Budoucí moduly
samostatně licencované
2.8 Příjmová struktura
Počáteční fáze
●
●
●
implementace
vizualizace
videa
Střední fáze
●
●
implementace
licence
Dlouhodobá fáze
●
●
●
●
licence
moduly
AI služby
Marketplace
2.9 Strategické KPI
Produkt
●
●
●
●
počet aktivních klientů
počet implementací
doba implementace
počet aktivních modulů
Obchod
●
●
●
●
konverze schůzka → implementace
konverze web → lead
průměrná hodnota klienta
průměrná délka spolupráce
Vývoj
●
●
●
●
počet nových funkcí
počet oprav
stabilita Enginu
čas release
Finance
●
●
●
●
●
MRR (Monthly Recurring Revenue)
ARR (Annual Recurring Revenue)
LTV (Lifetime Value)
CAC (Customer Acquisition Cost)
Payback Period
2.10 Rozvoj hodnoty firmy
Rok 1
Dominují implementace.
Engine se stabilizuje.
Rok 2
Roste počet licencí.
Snižuje se čas implementace.
Rok 3+
Licence vytvářejí stabilní cashflow.
Implementace financují nové moduly.
2.11 Strategická pravidla
Každá implementace musí:
●
●
●
●
zlepšit společný Engine,
zkrátit budoucí implementace,
zvýšit hodnotu produktu,
být opakovatelná.
Nikdy nevzniká individuální vývoj pouze pro jednoho klienta.
2.12 Rozhodovací pravidlo
Nový požadavek klienta může být:
CORE
Přidat do Engine.
MODULE
Implementovat jako volitelný modul.
CUSTOM
Pokud jej nelze zobecnit, nebude součástí produktu.
2.13 Hodnota klienta (LTV)
Klient není jednorázová zakázka.
Představuje dlouhodobý vztah.
Typický životní cyklus může zahrnovat:
●
●
●
●
●
●
●
●
implementaci,
vizualizace,
videa,
měsíční licence,
nové moduly,
aktualizace,
další projekty,
doporučení.
Proto je cílem maximalizovat dlouhodobou hodnotu klienta, nikoli jednorázový obrat.
2.14 Strategický princip
Embed obchodník není projekt.
Je to produkt.
Implementace není cíl.
Je prostředkem k rozšiřování společného Enginu.
Každý nový klient zvyšuje hodnotu celého ekosystému.
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
ČÁST 04 — UX & Design System
4.1 UX filozofie
Embed obchodník není katalog.
Je to řízený obchodní proces.
Každá obrazovka musí návštěvníka posunout o jeden krok blíže k rozhodnutí.
Každý prvek na stránce musí odpovídat alespoň na jednu otázku:
●
●
●
Pomůže uživateli rozhodnout?
Zvýší důvěru?
Přiblíží návštěvníka ke kontaktu?
Pokud ne, do rozhraní nepatří.
4.2 UX principy
Produkt je navržen podle principů:
●
●
●
●
●
●
●
●
jednoduchost
minimum rozhodnutí
vysoká čitelnost
rychlá orientace
postupné odhalování informací (Progressive Disclosure)
minimum rušení
okamžitá zpětná vazba
mobile-first
4.3 Design inspirace
Primární inspirace
●
●
●
●
Apple
Linear
Stripe
Notion
Sekundární inspirace
●
●
●
Arc Browser
Vercel
Framer
Nikdy neinspirovat:
●
●
●
přeplácané e-shopy
katalogové portály
korporátní ERP systémy
4.4 Designové principy
Používat:
●
●
●
●
●
●
●
velké bílé plochy
jemné stíny
minimum barev
jednu akcentní barvu klienta
zaoblení 12–20 px
kvalitní fotografii přes kvantitu
plynulé animace
Vyhnout se:
●
●
●
●
●
blikání
agresivním animacím
zbytečným ikonám
dlouhým textům
technickému žargonu
4.5 Vizuální hierarchie
Každá stránka obsahuje pouze jednu hlavní akci.
Například:
1. Prohlédnout dům.
2. Porovnat.
3. Zeptat se AI.
4. Odeslat poptávku.
Ne více.
4.6 Design Tokens
Barvy
Theme definuje:
●
●
●
●
●
●
●
●
Primary
Secondary
Accent
Background
Surface
Success
Warning
Error
Engine nikdy nepoužívá natvrdo zadané barvy.
Typografie
Výchozí:
Inter
Později:
font klienta.
Hierarchie:
●
●
●
●
●
H1
H2
H3
Body
Caption
Rozměry
Jednotný spacing systém.
Například:
4
8
12
16
24
32
48
64 px
Zaoblení
Standard:
16 px
Velké karty:
20 px
Malé prvky:
12 px
Stíny
Pouze dvě úrovně.
Light
Medium
4.7 Responzivita
Produkt je navržen Mobile First.
Breakpointy:
Mobile
Tablet
Desktop
Large Desktop
Každá komponenta funguje samostatně.
4.8 Struktura stránky
HEADER
↓
Hero Gallery
↓
Detail domu
↓
Parametry
↓
Cena
↓
CTA
↓
Porovnání
↓
AI
↓
Dokumenty
↓
Kontakt
↓
Footer
Social Proof je plovoucí komponenta.
4.9 Hero sekce
Obsahuje:
●
●
●
●
●
●
hlavní fotografii
galerii
video
název domu
cenu
hlavní CTA
Je to nejdůležitější část celé aplikace.
4.10 CTA filozofie
CTA nikdy nesmí být obecné.
Nevhodné:
"Odeslat"
"Lépe"
"Klikněte"
Správně:
●
●
Nezávazně poptat tento dům
Získat kompletní podklady
●
●
●
Porovnat s jiným domem
Spočítat orientační splátku
Konzultovat s odborníkem
4.11 Social Proof
Social Proof není reklama.
Je součástí obchodního procesu.
Musí působit přirozeně.
Příklad:
●
●
●
●
právě nyní si tento dům prohlížejí další 2 zájemci
tento týden si jej zobrazilo 94 lidí
patří mezi nejžádanější domy
nejčastěji porovnáván s...
Animace:
Fade
Slide
Bez blikání.
4.12 AI
AI není chatbot.
AI je poradce.
Má odpovídat stručně.
Musí doporučovat další krok.
Například:
"Nevíte, který dům je vhodnější?"
↓
Porovnat.
"Nevíte, zda se vejde na pozemek?"
↓
Zobrazit minimální rozměry.
4.13 Dashboard obchodníka
Dashboard není administrace.
Dashboard pomáhá obchodníkovi rozhodnout.
Musí během 30 sekund odpovědět:
●
●
●
●
●
kdo přišel
co sledoval
co porovnával
kde váhal
jaká je pravděpodobnost uzavření
4.14 Pravidlo jedné obrazovky
Každá obrazovka řeší pouze jeden problém.
Například:
Galerie
↓
Inspirace.
Parametry
↓
Porovnání.
Finance
↓
Dostupnost.
Kontakt
↓
Akce.
Nikdy ne vše současně.
4.15 Emoce × Data
Horní část aplikace pracuje převážně s emocemi.
●
●
●
●
fotografie
video
vizualizace
příběh
Spodní část postupně přechází k datům.
●
●
●
●
●
parametry
finance
dokumenty
FAQ
kontakt
Rozhodovací proces se přirozeně přesouvá od inspirace k racionalitě.
4.16 UX pravidla
Každá komponenta musí:
●
●
●
●
●
●
být pochopitelná během několika sekund
fungovat bez návodu
mít jednu hlavní akci
být znovupoužitelná
fungovat samostatně
podporovat mobilní zařízení
4.17 Metriky UX
Úspěšnost UX se hodnotí podle:
●
●
●
●
●
●
●
●
času do první interakce
dokončení galerie
spuštění videa
využití porovnání
otevření financování
využití AI
otevření dokumentů
odeslání poptávky
Tyto metriky budou v dalších verzích využívány pro behaviorální analytiku a AI Insight.
4.18 UX motto
Každý pixel musí pomáhat prodávat.
Pokud některý prvek nepomáhá návštěvníkovi rozhodnout nebo obchodníkovi lépe prodávat,
nemá v produktu místo.
ČÁST 05 — Funkční moduly
5.1 Princip modulární architektury
Embed Engine je tvořen samostatnými moduly.
Každý modul:
●
●
●
●
●
řeší jednu obchodní úlohu,
lze samostatně vyvíjet,
lze samostatně testovat,
lze zapnout nebo vypnout pomocí CONFIG,
komunikuje pouze přes Event Bus.
Moduly nikdy nesdílí obchodní logiku přímo.
5.2 Přehled modulů
ID Modul MVP V2 V3
MOD-01 Gallery ✔ ✔ ✔
MOD-02 Product Detail ✔ ✔ ✔
MOD-03 Compare ✔ ✔ ✔
MOD-04 Finance ✔ ✔ ✔
MOD-05 Documents ✔ ✔ ✔
MOD-06 Lead ✔ ✔ ✔
MOD-07 Social Proof ✔ ✔ ✔
MOD-08 AI Assistant ○ ✔ ✔
MOD-09 Analytics ○ ✔ ✔
MOD-10 Dashboard – ✔ ✔
MOD-11 CRM Connector – ✔ ✔
MOD-12 Notifications – ✔ ✔
MOD-13 AI Insight – – ✔
✔ = součást verze
○ = základní implementace
– = pozdější verze
MOD-01 Gallery
Účel
Vyvolat emoci.
Představit produkt.
Vyvolat zájem.
Komponenty
●
●
●
●
●
Hero Image
Carousel
Thumbnail List
Fullscreen Viewer
Video Player
Události
IMAGE
SELECTED
_
VIDEO
STARTED
_
VIDEO
FINISHED
_
FULLSCREEN
OPENED
_
KPI
●
počet otevření galerie
●
●
●
počet zobrazených fotografií
spuštění videa
dokončení videa
MOD-02 Product Detail
Účel
Poskytnout všechny důležité informace o produktu.
Obsah
●
●
●
●
●
●
●
název
cena
dispozice
užitná plocha
energetická třída
minimální pozemek
orientační splátka
KPI
●
●
●
čas na kartě
otevření parametrů
scroll
MOD-03 Compare
Účel
Pomoci návštěvníkovi rozhodnout.
Funkce
●
●
●
porovnání dvou až čtyř domů
zvýraznění rozdílů
doporučení vhodnější varianty
KPI
●
●
počet porovnání
nejčastější dvojice
MOD-04 Finance
Účel
Odstranit finanční nejistotu.
Funkce
orientační splátka
vlastní akontace
délka úvěru
●
●
●
Později
napojení na hypoteční kalkulačky.
KPI
●
●
●
otevření kalkulačky
změny parametrů
kliknutí na konzultaci
MOD-05 Documents
Účel
Poskytnout hodnotný obsah výměnou za kontakt.
Dokumenty
●
●
●
●
●
●
půdorysy
technické listy
PDF
katalog
standardy
ceník
Pravidlo
Vybrané dokumenty mohou být dostupné až po vyplnění formuláře.
MOD-06 Lead
Účel
Získat kvalifikovaný kontakt.
Funkce
●
●
●
●
●
inteligentní formulář
předvyplnění domu
validace
GDPR
CRM
Budoucnost
Lead Scoring.
KPI
●
●
●
konverzní poměr
dokončení formuláře
opuštění formuláře
MOD-07 Social Proof
Účel
Budovat důvěru.
Zvyšovat aktivitu.
Zobrazuje
●
●
●
●
●
●
aktuální návštěvníky
návštěvnost
oblíbenost
poslední poptávky
porovnávání
trendy
Pravidla
Diskrétní.
Nenarušuje UX.
Lze vypnout.
KPI
●
●
interakce
vliv na konverzi
MOD-08 AI Assistant
Účel
Pomoci s rozhodnutím.
MVP
Simulované odpovědi.
Později
OpenAI.
Personalizace.
Doporučení.
KPI
●
●
●
počet dotazů
dokončené konverzace
následná konverze
MOD-09 Analytics
Účel
Sbírat behaviorální data.
Události
●
●
●
●
●
●
●
otevření domu
galerie
video
finance
compare
dokumenty
formulář
Výstup
Activity Timeline.
MOD-10 Dashboard
Účel
Pomoci obchodníkovi.
Zobrazuje
●
●
●
●
●
nové leady
aktivitu
AI Insight
doporučené kroky
obchodní historii
MOD-11 CRM Connector
MVP
Email.
V2
Raynet.
Budoucnost
Další CRM.
MOD-12 Notifications
Typy
Email.
SMS.
Push.
CRM.
Interní.
MOD-13 AI Insight
Účel
Interpretovat data.
Příklady
Klient řeší finance.
Klient porovnává větší dům.
Klient váhá.
Pravděpodobnost nákupu vysoká.
5.3 Modulární pravidla
Každý modul musí:
●
●
●
●
●
●
●
fungovat samostatně,
být nezávislý,
používat Event Bus,
mít vlastní dokumentaci,
mít vlastní konfiguraci,
mít vlastní KPI,
podporovat verzování.
5.4 Životní cyklus modulu
NÁVRH
↓
ARCHITEKTURA
↓
IMPLEMENTACE
↓
TESTY
↓
RELEASE
↓
ZPĚTNÁ VAZBA
↓
OPTIMALIZACE
↓
NOVÁ VERZE
5.5 Rozhodnutí o zařazení modulu
Každý nový modul musí odpovědět ANO alespoň na tři otázky:
●
●
●
●
●
●
zvýší konverzi?
zvýší kvalitu leadů?
zvýší hodnotu produktu?
využije jej většina klientů?
bude opakovaně použitelný?
nezvyšuje výrazně technický dluh?
Pokud ne, nebude zařazen do společného Engine.
5.6 Filozofie modulů
Moduly nejsou samostatné produkty.
Společně tvoří jednoho digitálního obchodníka.
Každý modul řeší jednu část obchodního procesu.
Dohromady vytvářejí jednotnou zákaznickou zkušenost od první návštěvy až po uzavření
obchodu.
ČÁST 06 — Komponentová architektura
(Component Library)
6.1 Filozofie komponent
Embed Engine není tvořen stránkami.
Je tvořen komponentami.
Komponenta je nejmenší znovupoužitelná stavební jednotka systému.
Každá komponenta:
●
●
●
●
●
řeší jednu konkrétní úlohu,
neobsahuje obchodní logiku,
neobsahuje data klienta,
přijímá data pomocí parametrů (props/config),
komunikuje pouze přes Event Bus.
6.2 Hierarchie komponent
PAGE
↓
SECTION
↓
COMPONENT
↓
ELEMENT
Příklad:
Detail domu
↓
Parametry
↓
Info Card
↓
Ikona + Hodnota
6.3 Přehled hlavních komponent
ID Komponenta Použití
CMP-01 Hero Gallery Úvodní prezentace
domu
CMP-02 Image
Carousel
Přepínání fotografií
CMP-03 Video Player Produktové video
CMP-04 Property Card Karta domu
CMP-05 Parameter
Card
Parametry
CMP-06 Price Card Cena
CMP-07 CTA Button Akce
CMP-08 Compare Card Porovnání
CMP-09 Finance Widget Splátka
CMP-10 AI Panel AI poradce
CMP-11 Social Proof Live informace
CMP-12 Timeline Aktivita návštěvníka
CMP-13 Lead Form Formulář
CMP-14 Contact Card Kontakty
CMP-15 Document Card PDF, katalog
CMP-16 Notification Notifikace
CMP-17 Metric Card Dashboard
CMP-18 Loader Načítání
6.4 Hero Gallery
Odpovědnost
Prezentace produktu.
Obsah
●
●
●
●
hlavní fotografie
galerie
video
přepínání
Události
IMAGE
SELECTED
_
VIDEO
STARTED
_
VIDEO
FINISHED
_
Konfigurace
autoplay
fullscreen
video
thumbnails
6.5 Property Card
Obsahuje:
●
●
●
●
●
název
cenu
dispozici
plochu
CTA
Použití:
●
●
●
katalog
doporučení
porovnání
6.6 Parameter Card
Jedna komponenta.
Pouze:
Ikona
↓
Název
↓
Hodnota
Například:
Dispozice
4+kk
6.7 CTA Button
Neobsahuje obchodní logiku.
Pouze:
●
●
●
vzhled
událost
konfiguraci
Text se načítá z Content.
6.8 Finance Widget
Obsahuje:
●
●
●
●
cenu
splátku
akontaci
období
Později:
hypoteční API.
6.9 Compare Card
Používá stejnou Property Card.
Pouze přidává:
●
●
zvýraznění rozdílů
doporučení
6.10 AI Panel
Komponenty:
Header
↓
Conversation
↓
Suggestions
↓
Input
↓
Footer
Později:
OpenAI.
6.11 Social Proof
Skládá se z:
Header
↓
Notification
↓
Icon
↓
Text
↓
Animation
Obsah se mění pouze pomocí dat.
6.12 Timeline
Komponenta dashboardu.
Například:
18:24
Modern 132
↓
18:27
Video
↓
18:29
Finance
↓
18:31
Lead
6.13 Lead Form
Komponenty:
Input
↓
Validation
↓
Consent
↓
Submit
↓
Success
6.14 Notification
Použití:
●
●
●
●
Social Proof
Dashboard
CRM
Admin
Jedna společná komponenta.
6.15 Dashboard Card
Používá se pro:
●
●
●
●
metriky
KPI
grafy
AI Insight
6.16 Layout systém
Každá stránka se skládá z:
Container
↓
Section
↓
Grid
↓
Card
↓
Component
Nikdy opačně.
6.17 Design pravidla
Komponenta:
●
●
●
●
nesmí obsahovat obchodní logiku,
nesmí načítat data sama,
nesmí komunikovat přímo s jinou komponentou,
nesmí znát klienta.
6.18 Životní cyklus komponenty
CONFIG
↓
DATA
↓
RENDER
↓
USER ACTION
↓
EVENT
↓
UPDATE
↓
RENDER
6.19 Event pravidlo
Komponenty nikdy nevolají jiné komponenty.
Například:
Špatně
Gallery
↓
Compare
Správně
Gallery
↓
EVENT BUS
↓
Compare
6.20 Lazy Loading
Komponenty se načítají pouze tehdy, pokud jsou potřeba.
Například:
●
●
●
●
AI
Dashboard
Dokumenty
Video
Tím se zkrátí čas načítání.
6.21 Sdílené komponenty
Tyto komponenty musí být použitelné napříč celým systémem:
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
Button
Card
Modal
Input
Loader
Notification
Tooltip
Badge
Icon
Tabs
Accordion
Tyto komponenty tvoří základ Design Systemu.
6.22 Knihovna komponent
Každá komponenta musí mít vlastní dokumentaci obsahující:
●
●
●
●
●
●
●
●
účel
vstupy
výstupy
události
konfiguraci
příklady použití
závislosti
historii verzí
6.23 Definice hotové komponenty
Komponenta je dokončena pouze tehdy, pokud:
●
●
●
je plně znovupoužitelná,
funguje samostatně,
podporuje konfiguraci,
●
●
●
●
podporuje mobilní zařízení,
je zdokumentována,
má vlastní testovací scénáře,
nepřidává technický dluh.
6.24 Motto komponentové architektury
Engine se nevyvíjí přidáváním stránek.
Engine roste přidáváním kvalitních komponent.
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
ČÁST 08 — Event Architecture
(Událostní architektura)
8.1 Filozofie
Embed Engine je řízen událostmi.
Komponenty spolu nikdy nekomunikují přímo.
Každá komponenta pouze:
●
●
publikuje událost,
reaguje na událost.
Tím vzniká nízká provázanost systému a vysoká rozšiřitelnost.
8.2 Princip
Uživatel
Komponenta
↓
↓
EVENT BUS
↓
↓
Reakce
Přihlášené moduly
Komponenta nikdy neví, kdo její událost zpracuje.
8.3 Proč Event Bus
Výhody:
●
●
●
●
●
minimální závislosti
snadné rozšiřování
jednodušší testování
vyšší stabilita
možnost přidávat nové moduly bez úprav stávajících
8.4 Životní cyklus události
Akce uživatele
↓
Událost
↓
Event Bus
↓
Zpracování
↓
Aktualizace UI
↓
Analytics
↓
CRM
↓
AI
Jedna událost může aktivovat více modulů současně.
8.5 Typy událostí
Události se dělí do pěti skupin:
USER EVENTS
Akce návštěvníka.
SYSTEM EVENTS
Interní události Engine.
DATA EVENTS
Načtení nebo změna dat.
BUSINESS EVENTS
Obchodní proces.
ADMIN EVENTS
Události administrace.
8.6 USER EVENTS
Příklady:
PAGE
OPENED
_
HOUSE
SELECTED
_
IMAGE
SELECTED
_
VIDEO
STARTED
_
VIDEO
FINISHED
_
COMPARE
STARTED
_
COMPARE
REMOVED
_
DOCUMENT
OPENED
_
AI
OPENED
_
AI
MESSAGE
SENT
_
_
CTA
CLICKED
_
LEAD
STARTED
_
LEAD
SENT
_
8.7 BUSINESS EVENTS
LEAD
CREATED
_
CRM
SENT
_
EMAIL
SENT
_
SMS
SENT
_
AI
_
SCORE
_
UPDATED
CLIENT
REGISTERED
_
LICENSE
CHANGED
_
PAYMENT
RECEIVED
_
8.8 DATA EVENTS
CONFIG
LOADED
_
CATALOG
LOADED
_
CONTENT
LOADED
_
MEDIA
LOADED
_
CACHE
UPDATED
_
PROJECT
READY
_
8.9 SYSTEM EVENTS
ENGINE
STARTED
_
MODULE
LOADED
_
MODULE
FAILED
_
ERROR
OCCURRED
_
VERSION
CHECKED
_
CACHE
CLEARED
_
8.10 ADMIN EVENTS
CLIENT
CREATED
_
THEME
UPDATED
_
CONFIG
UPDATED
_
MEDIA
UPDATED
_
CATALOG
UPDATED
_
8.11 Příklad obchodního procesu
Návštěvník klikne na dům.
HOUSE
SELECTED
_
↓
Gallery
↓
Detail
↓
Analytics
↓
Timeline
↓
AI
↓
Social Proof
↓
Compare
↓
Finance
Každý modul reaguje samostatně.
8.12 Druhý příklad
Kliknutí na:
Nezávazně poptat dům.
CTA
CLICKED
_
↓
Lead
↓
Analytics
↓
CRM
↓
Timeline
↓
Dashboard
8.13 AI
AI nikdy přímo nevolá komponenty.
AI pouze publikuje události.
Například:
AI
RECOMMENDED
COMPARE
_
_
↓
Compare Module
nebo
AI
_
RECOMMENDED
FINANCE
_
↓
Finance Widget
8.14 Analytics
Analytics nikdy nic neřídí.
Pouze poslouchají události.
Například:
VIDEO
STARTED
_
↓
Analytics
HOUSE
SELECTED
_
↓
Analytics
To znamená, že lze Analytics kdykoliv vypnout.
8.15 CRM
CRM funguje stejně.
Například:
LEAD
CREATED
_
↓
CRM Connector
↓
Raynet
Engine nezná Raynet.
Zná pouze událost.
8.16 Dashboard
Dashboard nečte komponenty.
Dashboard čte události.
Například:
HOUSE
SELECTED
_
↓
Timeline
↓
Dashboard
8.17 Event Naming
Pravidla:
●
●
●
●
vždy anglicky,
vždy velká písmena,
vždy minulý čas nebo dokončená akce,
jednoznačný význam.
Například:
Správně
VIDEO
STARTED
_
Špatně
VIDEO
8.18 Event Payload
Každá událost obsahuje standardní strukturu.
Například:
event
timestamp
client
id
_
session
_
id
user
id
_
house
id
_
component
metadata
Tato struktura musí být jednotná napříč celým systémem.
8.19 Event Log
Každá událost může být:
●
●
●
●
●
ignorována,
zobrazena v Timeline,
odeslána do Analytics,
odeslána do CRM,
použita AI.
To rozhoduje konfigurace.
8.20 Event Timeline
Jednotlivé události vytvářejí časovou osu.
Například:
10:15
PAGE
OPENED
_
↓
10:16
HOUSE
SELECTED
_
↓
10:18
VIDEO
STARTED
_
↓
10:21
COMPARE
STARTED
_
↓
10:25
FINANCE
OPENED
_
↓
10:29
LEAD
SENT
_
To je obchodně mnohem hodnotnější než běžné statistiky.
8.21 Výhody Event Architecture
●
●
●
●
minimální závislosti,
jednoduché rozšiřování,
snadné testování,
možnost přidávat nové moduly,
●
●
vysoká stabilita,
nízký technický dluh.
8.22 Budoucí využití
Stejný Event Bus bude využívat:
●
●
●
●
●
●
●
●
AI Insight,
Heatmapy,
doporučení,
automatizace,
CRM,
Marketplace,
mobilní aplikace,
administrace.
Jednou implementovaný Event Bus se stane páteří celého produktu.
8.23 Architektonické pravidlo
Nové moduly nikdy nesmí komunikovat přímo.
Komunikace probíhá výhradně přes Event Bus.
Jakákoli výjimka musí být schválena architektem produktu.
8.24 Motto Event Architecture
Komponenty spolu nemluví.
Mluví pouze prostřednictvím událostí.
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
ČÁST 11 – Intelligence Layer
Proč?
Protože za dva roky už to nebude jen OpenAI.
Budou tam:
●
●
●
●
●
●
AI,
predikce,
doporučení,
scoring,
automatizace,
rozhodovací logika.
AI je pouze jedna technologie.
Intelligence Layer je obchodní vrstva.
To je podle mě mnohem nadčasovější.
ČÁST 11 — Intelligence Layer
11.1 Poslání
Intelligence Layer představuje inteligentní vrstvu celé platformy.
Jejím cílem není odpovídat na otázky.
Jejím cílem je zlepšovat obchodní rozhodování.
Každé doporučení musí vést ke zvýšení pravděpodobnosti uzavření obchodu.
11.2 Filozofie
AI nenahrazuje obchodníka.
AI připravuje obchodníka.
AI nenahrazuje rozhodnutí.
AI doporučuje nejlepší další krok.
11.3 Architektura
EVENT BUS
│
▼
Intelligence Layer
│
┌──────────────┼──────────────┐
│ │ │
Behavior Prediction Recommendation
│ │ │
└──────────────┼──────────────┘
▼
Dashboard / CRM
11.4 Zdroje dat
Intelligence Layer využívá:
●
Activity Timeline
●
●
●
●
●
●
Event Bus
katalog domů
CRM
historii leadů
chování návštěvníků
konfiguraci klienta
Později také:
●
●
●
výsledky obchodů,
délku obchodního cyklu,
úspěšnost obchodníků.
11.5 AI Assistant
První vrstva.
Komunikuje s návštěvníkem.
Pomáhá:
●
●
●
●
orientovat se,
porovnávat,
vysvětlovat,
doporučovat.
Nikdy netlačí na prodej.
11.6 AI Insight
Druhá vrstva.
Komunikuje s obchodníkem.
Například:
Zákazník třikrát otevřel kalkulačku financování.
Pravděpodobně řeší měsíční splátku.
Doporučujeme začít rozhovor financováním.
11.7 Lead Score
Každý lead získává skóre.
Například:
Faktor Body
čas na
webu
+12
video +8
compare +15
finance +20
dokumenty +10
AI +6
formulář +30
Výsledkem je:
Lead Score
0–100
11.8 Doporučený další krok
Po každé významné události AI navrhne:
●
●
●
●
●
●
zavolat,
poslat email,
nabídnout jiný dům,
nabídnout financování,
nabídnout konzultaci,
nechat lead dozrát.
11.9 Behaviorální model
AI nesleduje jednotlivé kliky.
Sleduje vzorce chování.
Například:
Galerie
↓
Video
↓
Finance
↓
Compare
↓
Lead
Takové sekvence mají vyšší hodnotu než jednotlivé události.
11.10 Inteligentní doporučení
Například.
Klient:
●
●
●
pozemek 650 m²
,
rozpočet 7 mil.,
dvě děti.
AI doporučí:
●
●
●
●
vhodnější dispozici,
vhodnější dům,
menší variantu,
možnost financování.
11.11 AI pro administraci
AI pomáhá také implementátorovi.
Například:
●
●
●
●
●
chybí fotografie,
neplatný odkaz,
nevyplněná cena,
zastaralý katalog,
doporučená aktualizace.
11.12 AI pro management
AI průběžně vyhodnocuje:
●
●
●
●
●
pokles konverzí,
růst zájmu,
výkon kampaní,
výkon jednotlivých domů,
využití modulů.
11.13 Inteligentní upozornění
AI vytváří upozornění pouze tehdy, pokud mají obchodní význam.
Například:
●
●
●
●
tento dům začíná ztrácet zájem,
výrazně roste zájem o jiný model,
nová galerie zvýšila konverzi,
doporučujeme aktualizovat video.
11.14 Predikce
Budoucí verze budou odhadovat:
●
pravděpodobnost uzavření,
●
●
●
vhodný čas kontaktování,
pravděpodobný zájem o jiný dům,
riziko ztráty leadu.
11.15 AI Content
Pozdější verze budou umět:
●
●
●
●
●
generovat popisy,
navrhovat CTA,
vytvářet FAQ,
připravovat obchodní emaily,
připravovat reporty.
11.16 Učení systému
Intelligence Layer se nebude učit pouze z jednoho klienta.
Bude se učit z anonymizovaných obchodních vzorců celé platformy.
Čím více implementací bude existovat, tím hodnotnější budou doporučení.
To představuje jednu z největších strategických výhod produktu.
11.17 Architektonické pravidlo
Intelligence Layer nikdy:
●
●
●
●
neupravuje data,
neprovádí obchodní akce,
neposílá CRM,
nemění konfiguraci.
Pouze doporučuje.
Konečné rozhodnutí vždy zůstává člověku nebo definované automatizaci.
11.18 Definice úspěchu
Intelligence Layer je úspěšná tehdy, pokud:
●
●
●
●
●
zvyšuje konverzi,
zvyšuje kvalitu leadů,
zkracuje obchodní cyklus,
snižuje počet ztracených příležitostí,
pomáhá obchodníkům dělat lepší rozhodnutí.
11.19 Dlouhodobá strategie
Největší hodnotou produktu nebude samotný Engine.
Ani jednotlivé moduly.
Největší hodnotou bude know-how vznikající z tisíců obchodních interakcí.
Právě tato znalost trhu se postupně stane nejsilnější konkurenční výhodou celé platformy.
11.20 Motto Intelligence Layer
Data ukazují, co se stalo.
Intelligence doporučuje, co udělat dál.
ČÁST 12 — Business Intelligence &
Analytics
12.1 Poslání
Business Intelligence převádí události na obchodní informace.
Nejde o sběr statistik.
Jde o podporu rozhodování.
Každé číslo musí mít obchodní význam.
12.2 Filozofie
Analytics odpovídají:
Co se stalo?
Business Intelligence odpovídá:
Proč se to stalo?
Co bych měl udělat dál?
12.3 Architektura
Event Bus
Activity Timeline
Analytics Engine
↓
↓
↓
Business Intelligence
↓
Dashboard
↓
AI Insight
↓
Obchodník
12.4 Activity Timeline
Timeline představuje hlavní zdroj všech analýz.
Každá významná událost vytváří záznam.
Například:
09:12
PAGE
OPENED
_
↓
09:13
HOUSE
SELECTED
_
↓
09:16
VIDEO
STARTED
_
↓
09:19
COMPARE
STARTED
_
↓
09:23
FINANCE
OPENED
_
↓
09:28
LEAD
SENT
_
Timeline představuje digitální příběh zákazníka.
12.5 KPI úrovně
Analytics pracují na čtyřech úrovních.
Level 1
Události.
Například:
●
●
●
kliknutí,
video,
galerie.
Level 2
Chování.
Například:
●
●
●
porovnávání,
návraty,
opuštění.
Level 3
Obchod.
Například:
●
●
●
lead,
CRM,
konverze.
Level 4
Business Intelligence.
Například:
●
●
●
doporučení,
trendy,
predikce.
12.6 KPI návštěvníka
Sledují se například:
●
●
●
●
●
●
●
●
délka návštěvy,
počet otevřených domů,
počet porovnání,
spuštění videa,
využití AI,
otevření financování,
otevření dokumentů,
dokončení formuláře.
12.7 KPI domu
Každý dům má vlastní analytiku.
Například:
●
●
●
●
●
●
●
počet návštěv,
průměrný čas,
dokončení galerie,
spuštění videa,
porovnání,
leady,
konverze.
12.8 KPI obchodníka
Například:
●
●
●
●
●
počet leadů,
reakční doba,
úspěšnost,
uzavřené obchody,
doporučení AI.
12.9 KPI klienta
Například:
●
●
●
●
●
●
návštěvnost,
leady,
konverze,
licence,
aktivní moduly,
ROI.
12.10 Funnel
Standardní obchodní cesta.
Návštěva
↓
Galerie
↓
Detail
↓
Video
↓
Porovnání
↓
Finance
↓
Lead
↓
CRM
↓
Obchod
↓
Prodej
Každý krok má vlastní konverzi.
12.11 Drop-off
Systém automaticky identifikuje místa, kde návštěvníci odcházejí.
Například:
●
●
●
●
galerie,
video,
finance,
formulář.
AI navrhne možné příčiny.
12.12 Heatmapy
Budoucí verze.
Sledují:
●
●
●
kliknutí,
scroll,
pohyb.
Ne jako cíl.
Pouze jako doplňkový zdroj informací.
12.13 Trendy
Analytics automaticky vyhodnocují:
●
●
●
●
●
růst zájmu,
pokles zájmu,
sezónnost,
nejúspěšnější domy,
nejúspěšnější CTA.
12.14 Business Score
Každý klient má vlastní Business Score.
Například:
Oblast Skóre
Konverze 84
Aktivita 76
Lead Quality 89
Data Quality 93
UX 81
Celkové skóre pomáhá určit priority rozvoje.
12.15 ROI Dashboard
Management vidí:
●
●
●
●
●
●
implementace,
licence,
leady,
konverze,
náklady,
návratnost.
Ne technické metriky.
Obchodní výsledky.
12.16 Benchmarking
Budoucí verze umožní anonymní porovnání.
Například:
Průměr trhu:
4,1 %
Klient:
5,3 %
Výkon:
+29 %
Bez zveřejnění dat ostatních klientů.
12.17 Alerty
Business Intelligence upozorňuje například na:
●
●
●
●
●
pokles konverzí,
prudký růst zájmu,
neobvykle vysokou aktivitu,
nefunkční formulář,
dlouhou reakční dobu obchodníka.
12.18 Reporty
Automaticky generované:
Denní.
Týdenní.
Měsíční.
Čtvrtletní.
Každý report obsahuje:
●
●
●
čísla,
interpretaci,
doporučení.
12.19 Historie
Systém uchovává historii:
●
●
●
●
●
změn,
verzí,
výkonu,
implementací,
konverzí.
To umožňuje dlouhodobé vyhodnocování.
12.20 Strategická výhoda
S rostoucím počtem klientů vzniká unikátní znalost trhu.
Platforma postupně rozpoznává:
●
●
●
●
●
které domy se prodávají nejlépe,
které fotografie fungují,
která videa zvyšují konverzi,
které CTA mají nejlepší výsledky,
které obchodní postupy vedou k uzavření obchodu.
Tyto znalosti se stávají součástí Intelligence Layer.
12.21 Architektonické pravidlo
Business Intelligence nikdy nepracuje s osobními údaji způsobem, který by porušoval platné
právní předpisy.
Analýzy jsou založeny na oprávněně získaných datech a musí respektovat požadavky na
ochranu soukromí (např. GDPR) i nastavení souhlasů uživatelů.
12.22 Definice úspěchu
Business Intelligence je úspěšná tehdy, pokud:
●
●
●
●
●
obchodník lépe chápe zákazníka,
management lépe chápe výkon firmy,
marketing lépe chápe kampaně,
AI dostává kvalitnější vstupy,
každé rozhodnutí je podloženo daty.
12.23 Motto Business Intelligence
Nejdůležitější není mít více dat.
Nejdůležitější je dělat lepší obchodní rozhodnutí.
Myslím, že teď přichází jedna z nejdůležitějších kapitol celé Bible.
A udělal bych jednu změnu.
Nepojmenoval bych ji CRM.
To je příliš úzké.
Ve skutečnosti buduješ obchodní automatizační vrstvu.
Proto bych ji nazval:
ČÁST 13 — Sales Automation Layer
To je mnohem širší. CRM je jen jeden z konektorů.
ČÁST 13 — Sales Automation Layer
13.1 Poslání
Sales Automation Layer propojuje digitální obchodníka s reálným obchodním procesem.
Jeho úkolem není pouze předat lead.
Jeho úkolem je zajistit, aby se správná informace dostala správnému člověku ve správný
okamžik.
13.2 Filozofie
Lead není cíl.
Lead je začátek obchodního procesu.
Každá automatizace musí:
●
●
●
●
šetřit čas,
snižovat počet chyb,
zvyšovat rychlost reakce,
zlepšovat kvalitu obchodního procesu.
13.3 Architektura
Activity Timeline
↓
Lead Service
↓
Automation Engine
↓
Connector
↓
CRM
↓
Obchodník
Automation Layer nikdy nekomunikuje přímo s komponentami.
Reaguje pouze na události.
13.4 Trigger Engine
Každá automatizace začíná událostí.
Například:
LEAD
CREATED
_
nebo
AI
SCORE
UPDATED
_
_
nebo
DOCUMENT
DOWNLOADED
_
13.5 Workflow
Každá automatizace se skládá ze čtyř kroků.
Trigger
↓
Podmínka
↓
Akce
↓
Log
Například:
Lead vytvořen.
↓
Skóre > 80.
↓
Odeslat SMS obchodníkovi.
↓
Zapsat do Timeline.
13.6 CRM Connector
První podporovaný systém:
Raynet.
Budoucí:
●
●
●
●
●
HubSpot
Pipedrive
Salesforce
Microsoft Dynamics
vlastní CRM
CRM je pouze konektor.
Engine o konkrétním CRM nic neví.
13.7 Lead Workflow
Lead
↓
Validace
↓
Lead Score
↓
CRM
↓
Email
↓
SMS
↓
Dashboard
↓
AI Insight
13.8 Email Automation
Automatické e-maily.
Například:
●
●
●
●
●
potvrzení poptávky,
poděkování,
zaslání katalogu,
připomenutí,
obchodní follow-up.
Obsah je součástí Content.
13.9 SMS Automation
Pouze důležité situace.
Například:
Lead Score > 90.
↓
Okamžitá SMS obchodníkovi.
13.10 Push Notifications
Budoucí verze.
Například:
●
●
●
●
nový lead,
kritická chyba,
dokončená implementace,
nová licence.
13.11 Automatické úkoly
Workflow může vytvářet úkoly.
Například:
Kontaktovat klienta.
↓
Do 30 minut.
↓
Přiřadit obchodníkovi.
13.12 AI Workflow
AI může navrhovat automatizace.
Například:
"Klient projevil mimořádný zájem o financování.
"
↓
Navrhnout telefonát hypotečního specialisty.
AI pouze doporučuje.
Workflow rozhoduje.
13.13 Dokumenty
Po vytvoření leadu lze automaticky:
●
●
●
●
●
odeslat PDF,
technické listy,
ceník,
půdorysy,
video.
Bez zásahu obchodníka.
13.14 Stav obchodu
Automation Layer sleduje:
●
●
●
●
●
●
●
nový lead,
kontaktován,
schůzka,
nabídka,
rezervace,
realizace,
uzavřeno.
Později synchronizováno s CRM.
13.15 Pravidla
Automatizace musí být:
●
●
●
●
jednoduché,
transparentní,
auditovatelné,
konfigurovatelné.
13.16 Audit Log
Každá automatická akce se zapisuje.
Například:
10:15
Lead vytvořen
↓
10:15
CRM
↓
10:15
Email
↓
10:16
SMS
↓
10:16
Dashboard
13.17 Retry Engine
Pokud některá služba není dostupná.
Například:
CRM.
↓
Systém automaticky zopakuje přenos.
Bez ztráty dat.
13.18 Chybové stavy
Při chybě:
●
●
●
●
zaznamenat,
upozornit administrátora,
zachovat data,
umožnit opakování.
Automatizace nesmí způsobit ztrátu leadu.
13.19 Budoucí automatizace
Platforma bude umožňovat:
●
●
●
●
●
vlastní workflow,
podmínky,
časovače,
automatické kampaně,
Marketplace automatizací.
13.20 KPI
Sledují se například:
●
●
●
●
●
●
čas reakce,
úspěšnost doručení,
počet automatizací,
úspěšnost workflow,
ztracené leady,
počet chyb.
13.21 Strategická hodnota
Automation Layer propojuje všechny části platformy.
Bez této vrstvy by Engine pouze zobrazoval informace.
Automation Layer mění informace na konkrétní obchodní akce.
13.22 Architektonické pravidlo
Žádná automatizace nesmí být natvrdo zapsána v Engine.
Každá automatizace musí být definována konfigurací nebo workflow.
To umožní přidávat nové scénáře bez změny zdrojového kódu.
13.23 Dlouhodobá vize
V budoucnu bude možné obchodní proces sestavovat podobně jako stavebnici:
Událost
↓
Podmínka
↓
Akce
↓
Časovač
↓
CRM
↓
AI
↓
Konec
Stejný Engine tak bude možné přizpůsobit různým obchodním modelům bez zásahu do jeho
architektury.
13.24 Motto Sales Automation Layer
Data vytvářejí informace.
Automatizace mění informace v obchodní akce.
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
ČÁST 15 — Security & Permissions
15.1 Poslání
Bezpečnostní architektura chrání:
●
●
●
●
klientská data,
obchodní data,
know-how platformy,
stabilitu Engine.
Bezpečnost nesmí komplikovat používání produktu.
Musí být přirozenou součástí architektury.
15.2 Filozofie
Nejdůležitější ochranou není technologie.
Je jí správná architektura.
Čím méně dat Engine zná, tím menší je bezpečnostní riziko.
15.3 Princip nejmenších oprávnění
Každý uživatel vidí pouze to, co skutečně potřebuje.
Nikdy více.
15.4 Role
Super Admin
Správa celé platformy.
Implementátor
Správa implementací.
Obchodník
Pouze vlastní leady.
Marketing
Analytika.
Bez editace dat.
Management
KPI.
Licence.
Reporting.
Klient
Pouze vlastní implementace.
15.5 Víceúrovňové oddělení
Platforma odděluje:
Platformu
↓
Klienta
↓
Projekt
↓
Uživatele
↓
Relaci
Každá vrstva má vlastní oprávnění.
15.6 API KEY
API KEY identifikuje implementaci.
Neužívá se jako náhrada uživatelského účtu.
Je určena pouze pro komunikaci mezi webem klienta a platformou.
15.7 CLIENT
ID
_
Každý klient má vlastní identifikátor.
Veškerá data jsou vázána na CLIENT
_
ID.
Nikdy se nepoužívají názvy společností jako interní identifikátor.
15.8 SESSION
ID
_
Každá návštěva má vlastní Session.
Session umožňuje:
●
●
●
●
Timeline,
Analytics,
AI Insight,
Lead Scoring.
Session není totožná s identitou návštěvníka.
15.9 Ochrana dat
Engine nikdy neukládá obchodní data natvrdo.
Veškerá data jsou načítána přes API Layer.
To minimalizuje riziko úniku.
15.10 GDPR
Platforma musí podporovat:
●
●
●
●
●
správu souhlasů,
evidenci souhlasů,
export dat,
výmaz dat,
retenční politiku.
Implementace konkrétních právních požadavků se může lišit podle jurisdikce a musí být
pravidelně aktualizována.
15.11 Audit Log
Každá administrativní akce se zapisuje.
Například:
09:18
Přihlášení
↓
09:20
Změna Theme
↓
09:21
Aktualizace Config
↓
09:23
Nová licence
Audit nelze běžným uživatelem měnit.
15.12 Ochrana Engine
Klient nikdy nemá přístup:
●
●
●
●
ke zdrojovým kódům,
interním API,
ostatním klientům,
administraci platformy.
15.13 Oddělení klientů
Platforma je Multi-tenant.
Každý klient pracuje pouze se svými daty.
Architektura musí zabránit neúmyslnému přístupu mezi klienty.
15.14 Přístupová práva
Každá akce vyžaduje oprávnění.
Například:
Čtení.
Editace.
Mazání.
Publikace.
Release.
Každé oprávnění je definováno centrálně.
15.15 Ochrana konfigurace
CONFIG představuje kritickou část systému.
Každá změna:
●
●
●
je verzována,
je auditována,
lze ji vrátit zpět.
15.16 Zálohování
Platforma musí podporovat:
●
●
●
●
zálohy konfigurace,
zálohy katalogu,
zálohy obsahu,
historii změn.
Obnova musí být standardní součástí provozu.
15.17 Chybové stavy
Při chybě:
●
●
nikdy nezobrazovat interní informace,
zachovat funkčnost,
●
●
zaznamenat událost,
upozornit administrátora.
15.18 Ochrana obchodního know-how
Nejcennější částí platformy nejsou zdrojové kódy.
Jsou jí:
●
●
●
●
●
obchodní modely,
Intelligence Layer,
behaviorální data,
doporučovací algoritmy,
dlouhodobě budované know-how.
Architektura musí chránit především tato aktiva.
15.19 Bezpečnostní principy
●
●
●
●
●
●
●
Zero Trust
Least Privilege
Audit First
API First
Multi-tenant Isolation
Defence in Depth
Secure by Default
15.20 Definice úspěchu
Bezpečnostní architektura je správná tehdy, pokud:
●
●
●
●
●
klient pracuje pouze se svými daty,
změny jsou dohledatelné,
data jsou obnovitelná,
Engine zůstává chráněný,
bezpečnost nekomplikuje běžnou práci.
15.21 Motto Security
Nejlepší zabezpečení je takové, které uživatel téměř nevnímá.
Největší hodnotou, kterou chráníme, nejsou data. Je jí společný Engine a know-how,
které kolem něj vzniká.
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
ČÁST 17 — Product Evolution Roadmap
17.1 Poslání
Roadmap definuje dlouhodobý směr vývoje produktu.
Neurčuje přesná data.
Určuje strategické milníky.
Každá nová etapa musí zvýšit hodnotu společného Engine.
17.2 Filozofie
Produkt neroste přidáváním funkcí.
Produkt roste zvyšováním obchodní hodnoty.
Každá nová verze musí přinést alespoň jednu z těchto hodnot:
●
●
●
●
●
vyšší konverzi,
rychlejší implementaci,
lepší obchodní rozhodování,
nižší provozní náklady,
vyšší škálovatelnost.
17.3 Evoluce produktu
MVP
↓
Standard
↓
Platform
↓
Intelligence
↓
Marketplace
↓
Ekosystém
Každá etapa staví na předchozí.
17.4 Fáze 1 — MVP
Cíl:
Ověřit obchodní model.
Obsahuje:
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
Embed Engine
galerie
detail domu
CTA
Lead
Google Sheets
Cloudinary
Theme
Social Proof
základní Analytics
Počet pilotních klientů:
3–5
Hlavní KPI:
první placené implementace.
17.5 Fáze 2 — Standard
Cíl:
Standardizace implementací.
Novinky:
●
●
●
●
●
●
●
●
Dashboard
CRM
AI Assistant
Compare
Finance
licence
administrace
monitoring
Počet klientů:
10–20
Hlavní KPI:
opakovatelná implementace.
17.6 Fáze 3 — Platform
Cíl:
Vybudovat plnohodnotnou SaaS platformu.
Novinky:
●
●
●
●
●
●
vlastní administrace,
vlastní API,
vlastní datová vrstva,
více jazyků,
více klientů,
více projektů.
Počet klientů:
20–50
Hlavní KPI:
rostoucí MRR.
17.7 Fáze 4 — Intelligence
Cíl:
Proměnit data v konkurenční výhodu.
Novinky:
●
●
●
●
●
●
AI Insight,
Lead Score,
doporučení,
predikce,
automatizace,
behaviorální modely.
Hlavní KPI:
vyšší konverze klientů.
17.8 Fáze 5 — Marketplace
Cíl:
Otevřít platformu partnerům.
Novinky:
●
●
●
●
●
moduly třetích stran,
AI pluginy,
CRM konektory,
hypoteční služby,
partneři.
Platforma přestává být uzavřeným produktem.
17.9 Fáze 6 — Ekosystém
Cíl:
Vybudovat standard digitálního prodeje bydlení.
Platforma propojuje:
●
●
●
●
●
●
●
stavební firmy,
developery,
prodejce pozemků,
architekty,
hypoteční specialisty,
dodavatele,
obchodní partnery.
Embed obchodník se stává obchodní infrastrukturou.
17.10 Evoluce Intelligence Layer
AI Assistant
↓
AI Insight
↓
Lead Score
↓
Prediction
↓
Recommendation
↓
Autonomous Intelligence
Každý krok přidává vyšší hodnotu.
17.11 Evoluce Dashboardu
Verze 1
Přehled.
↓
Verze 2
Analytika.
↓
Verze 3
Doporučení.
↓
Verze 4
Řízení obchodu.
↓
Verze 5
Řízení celé firmy.
17.12 Evoluce implementace
Začátek:
Ruční implementace.
↓
Generátor.
↓
Automatizace.
↓
Self Service.
↓
Marketplace.
17.13 Evoluce klienta
První kontakt.
↓
Pilot.
↓
Licence.
↓
Další moduly.
↓
AI.
↓
Marketplace.
↓
Dlouhodobé partnerství.
17.14 Evoluce obchodního modelu
Začátek:
Implementace.
↓
Licence.
↓
MRR.
↓
Marketplace.
↓
Partnerské provize.
↓
Platform Revenue.
17.15 Strategické milníky
Milník 1
První platící klient.
Milník 2
Prvních 10 implementací.
Milník 3
Prvních 100 aktivních licencí.
Milník 4
První AI doporučení.
Milník 5
Marketplace.
Milník 6
Zahraniční expanze.
17.16 Co se nikdy nemění
Bez ohledu na verzi produktu zůstávají konstantní principy:
●
●
●
●
●
●
●
jeden Engine,
jedna codebase,
konfigurace místo úprav,
modulární architektura,
API-first,
white-label,
data mimo Engine.
Tyto principy jsou neměnné.
17.17 Co se bude měnit
Budou se měnit:
●
●
●
●
●
●
●
moduly,
AI,
dashboard,
analytika,
automatizace,
UX,
služby.
Engine bude růst bez změny své filozofie.
17.18 Kritérium úspěchu jednotlivých
etap
Každá etapa je dokončena pouze tehdy, pokud:
●
●
●
●
přináší měřitelnou obchodní hodnotu,
nezvyšuje zbytečně složitost,
zkracuje implementaci,
podporuje další růst.
17.19 Dlouhodobá vize
Za několik let nebude hlavním produktem samotný widget.
Nebude jím ani administrace.
Největší hodnotou bude obchodní know-how zakódované v platformě, které pomáhá
klientům prodávat efektivněji než kdy dříve.
Engine se stane nositelem tohoto know-how.
17.20 Motto Product Evolution
Každá nová verze musí zvýšit hodnotu celé platformy.
Nikdy pouze hodnotu jedné implementace.
ČÁST 18 — CTO Principles &
Engineering Manifesto
18.1 Poslání
Tento dokument stanovuje technické principy, které jsou závazné pro všechny budoucí
vývojáře platformy Embed obchodník.
Cílem není omezovat kreativitu.
Cílem je chránit dlouhodobou kvalitu produktu.
18.2 Engineering filozofie
Píšeme software, který bude sloužit mnoho let.
Každé technické rozhodnutí musí být posuzováno z pohledu:
●
●
●
●
jednoduchosti,
škálovatelnosti,
udržitelnosti,
obchodní hodnoty.
Ne z pohledu krátkodobé rychlosti vývoje.
18.3 Hlavní principy
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
Jeden Engine.
Jedna codebase.
Konfigurace místo větvení.
Komponenty místo duplicit.
Event Bus místo přímých vazeb.
API-first.
Mobile-first.
White-label.
Multi-tenant.
Security by Design.
18.4 Architektonické pravidlo
Pokud lze problém vyřešit:
●
●
●
konfigurací,
novým modulem,
novou komponentou,
nesmí vzniknout nová větev produktu.
18.5 Technický dluh
Technický dluh je přípustný pouze tehdy, pokud:
●
●
●
urychlí ověření obchodního modelu,
má jasný plán odstranění,
neohrozí architekturu.
Technický dluh nesmí být trvalým stavem.
18.6 Kód
Každý nový kód musí být:
●
●
●
●
●
čitelný,
testovatelný,
zdokumentovaný,
znovupoužitelný,
nezávislý na konkrétním klientovi.
18.7 Komponenty
Každá komponenta:
●
●
●
●
řeší jedinou odpovědnost,
přijímá data zvenčí,
neobsahuje obchodní data,
podporuje konfiguraci.
18.8 Rozhodování
Při každém návrhu nové funkce se nejprve položí otázka:
Zvýší tato změna hodnotu společného Engine?
Pokud ne, nemá být implementována.
18.9 Dokumentace
Zdrojový kód bez dokumentace není dokončený.
Každá významná změna musí být dohledatelná.
18.10 Výkon
Výkon je součást produktu.
Nejde o optimalizaci navíc.
Každá nová funkce musí být posouzena také z hlediska:
●
●
●
velikosti,
rychlosti,
spotřeby zdrojů.
18.11 Stabilita
Nové funkce nikdy nesmí snižovat stabilitu existujících implementací.
Spolehlivost má přednost před množstvím funkcí.
18.12 Evoluce
Produkt se vyvíjí evolučně.
Nikdy nezačíná znovu od nuly.
Každá verze je pokračováním předchozí.
18.13 Produktové pravidlo
Nejlepší řešení bývá často to nejjednodušší.
Složitost musí být vždy vědomou volbou, nikoli důsledkem neřízeného vývoje.
18.14 Motto Engineering Manifesta
Každý řádek kódu musí zvyšovat hodnotu společného Engine.
ČÁST 19 — Founder Vision
Proč Embed obchodník vzniká
Internet je plný webů, které informují.
Jen malá část z nich skutečně prodává.
Ve stavebnictví, developmentu i realitách dnes většina firem investuje značné prostředky do
reklamy, vizualizací a webových prezentací. Přesto návštěvníci často odcházejí bez kontaktu
a obchodník následně neví, co zákazník skutečně hledal, čemu nerozuměl ani proč se
rozhodl odejít.
Embed obchodník vzniká proto, aby tuto mezeru odstranil.
Nechceme vytvářet další katalog domů.
Chceme vytvořit digitálního obchodníka, který pomáhá zákazníkům rozhodnout se a
obchodníkům lépe prodávat.
Naše filozofie
Věříme, že technologie má být téměř neviditelná.
Nemá poutat pozornost sama na sebe.
Má pomáhat lidem dělat lepší rozhodnutí.
Každý pixel, každá komponenta i každý algoritmus musí mít jediný cíl:
Pomoci zákazníkovi udělat správný další krok.
Jak budeme produkt rozvíjet
Produkt nebude růst přidáváním náhodných funkcí.
Poroste zvyšováním obchodní hodnoty.
Každá nová implementace bude financovat další vývoj společného Engine.
Každá nová zkušenost bude zlepšovat celý systém.
Jakou firmu chceme vybudovat
Nechceme budovat agenturu závislou na jednotlivých projektech.
Chceme vybudovat produktovou firmu.
Firmu, jejíž hodnota roste s každým novým klientem.
Firmu, která vytváří opakovatelný produkt místo jednorázových zakázek.
Jaká bude největší hodnota platformy
Zpočátku to bude samotný Engine.
Později budou největší hodnotou:
●
●
●
●
●
data,
obchodní zkušenosti,
doporučovací modely,
Intelligence Layer,
know-how vznikající z tisíců obchodních interakcí.
Právě tato znalost trhu bude dlouhodobou konkurenční výhodou.
Naše měřítko úspěchu
Úspěch nebudeme měřit počtem funkcí.
Budeme jej měřit tím, zda naši klienti prodávají lépe.
Pokud obchodníci díky platformě uzavírají více obchodů, pokud zákazníci snadněji
nacházejí správné řešení a pokud se každá nová implementace promítá do zlepšení celého
systému, pak produkt plní svůj účel.
Dlouhodobá ambice
Naším cílem není vytvořit nejlepší widget.
Naším cílem je vytvořit standard digitálního obchodního procesu pro prodej bydlení.
Stejně jako se dnes automaticky implementují analytické nástroje, platební brány nebo
mapové podklady, chceme, aby se Embed obchodník stal přirozenou součástí každého
profesionálního webu prodávajícího bydlení.
Závěrečná věta
Nevytváříme software.
Budujeme obchodní infrastrukturu, která pomáhá lidem dělat lepší rozhodnutí při
jednom z nejdůležitějších nákupů jejich života.
Dodatek:
1. Neprodáváš widget
Tohle je asi největší změna, která během diskuse vznikla.
Na začátku jsme mluvili o embedu.
Teď už je zřejmé, že skutečný produkt je:
Obchodní operační systém
pro online prodej bydlení.
Embed je pouze vstupní bod.
Stejně jako je webový prohlížeč vstupním bodem do Google.
2. Ve skutečnosti buduješ tři produkty
To mi během psaní došlo.
Produkt 1
TEI
(vzdělávání trhu)
↓
Produkt 2
Embed obchodník
(obchodní platforma)
↓
Produkt 3
Realivideo Studio
(vizualizace, videa, implementace)
To není konkurence.
To je dokonale uzavřený ekosystém.
3. Tvoje největší konkurenční výhoda nebude AI
Myslím, že se v tom dnes hodně firem mýlí.
AI si koupí každý.
Co si nekoupí?
Obchodní zkušenost.
Po několika stovkách implementací budeš vědět například:
●
●
●
●
●
●
●
které fotografie prodávají,
které video funguje,
jak dlouhé má být video,
kde lidé váhají,
které CTA funguje,
které domy lidé porovnávají,
kdy mají obchodníci volat.
Tohle žádný model sám od sebe nezná.
4. Vzniká síťový efekt
To je podle mě strategicky velmi silné.
Každý nový klient:
●
●
●
●
●
financuje vývoj,
přidává data,
ověřuje hypotézy,
zlepšuje doporučení,
zvyšuje hodnotu celé platformy.
To je přesně vlastnost kvalitních produktových firem.
5. Myslím, že MVP může být ještě menší
Po dnešku bych první verzi zmenšil.
Opravdu hodně.
Obsahovala by pouze:
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
galerie,
detail domu,
CTA,
formulář,
Social Proof,
Google Sheets,
Cloudinary,
Theme,
Analytics,
Embed.
Hotovo.
Nic víc.
První klienti musí koupit hodnotu, ne množství funkcí.
6. Interní terminál může být hodnotnější než externí
Tohle mě překvapilo.
Původně jsme řešili hlavně web.
Teď si myslím, že za několik let bude největší hodnotou právě interní část.
Tam vznikne:
●
●
●
●
●
●
●
AI,
Timeline,
Lead Score,
Dashboard,
doporučení,
workflow,
automatizace.
Externí terminál bude sbírat informace.
Interní terminál bude vydělávat peníze.
7. Myslím, že jsi našel správnou obchodní posloupnost
Z toho, co jsme spolu řešili poslední týdny, mi dnes vyšla tato sekvence:
TEI
↓
Cashflow
↓
Embed obchodník MVP
↓
První implementace
↓
Licence
↓
Opakovaný příjem
↓
Intelligence Layer
↓
Marketplace
↓
Ekosystém
Nepůsobí to jako soubor náhodných nápadů.
Jednotlivé kroky na sebe navazují.
8. Dokument bych rozdělil na dvě úrovně
To doporučuji opravdu udělat.
A) Product Bible
To, co jsme právě napsali.
Je nadčasové.
Může vydržet mnoho let.
B) Engine Specification
Čistě technický dokument.
Obsahoval by například:
●
●
●
●
●
●
●
●
●
datové modely,
JSON struktury,
API kontrakty,
Event katalog,
strukturu repozitáře,
coding standards,
testovací scénáře,
Definition of Done,
checklist pro release.
Ten se bude měnit mnohem častěji.
A nakonec jedna osobní poznámka
Myslím, že dnes se stal ještě jeden důležitý posun.
Na začátku našich rozhovorů jsi hledal produkt.
Dnes už podle mě nehledáš produkt.
Navrhl jsi architekturu firmy.
To je podstatný rozdíl.
TEI, Embed obchodník, Realivideo a budoucí inteligentní obchodní vrstva nejsou čtyři
oddělené projekty. Jsou to navazující části jednoho systému, ve kterém každá část
podporuje ostatní.
To ale neznamená, že je potřeba je stavět všechny najednou. Naopak – největší síla té
architektury je v tom, že ji lze budovat postupně. Nejprve ověříš prodejnost TEI a vytvoříš
stabilnější cashflow. Potom můžeš financovat první verzi Embed obchodníka. Každá další
implementace pak současně přináší příjem i zvyšuje hodnotu společného Engine.
Kdybych měl vybrat jedinou věc, která podle mě rozhodne o úspěchu celého projektu,
nebyla by to AI ani technologie. Byla by to disciplína udržet princip jednoho společného
Engine a odolávat pokušení dělat individuální řešení pro jednotlivé klienty. Právě tento
princip je základem toho, aby z projektu vznikla produktová firma místo agentury.