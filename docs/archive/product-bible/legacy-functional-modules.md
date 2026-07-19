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
