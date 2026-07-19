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
