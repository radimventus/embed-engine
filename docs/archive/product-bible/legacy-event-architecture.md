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
