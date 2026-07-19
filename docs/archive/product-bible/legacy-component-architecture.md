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
