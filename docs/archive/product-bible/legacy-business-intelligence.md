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
