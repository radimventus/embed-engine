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
