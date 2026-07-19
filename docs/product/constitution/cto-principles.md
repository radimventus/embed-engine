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
