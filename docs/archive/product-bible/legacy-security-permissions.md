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
