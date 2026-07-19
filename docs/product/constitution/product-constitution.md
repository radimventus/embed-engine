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
