/** CAP-REF-05 — Normalized source-backed MODERN 4KK Priority FAQ. */
import type { HouseKnowledgeAtom } from '../knowledge/houseKnowledgeTypes';
import type { HousePriority, HousePriorityFaqItem } from '../priority-faq/housePriorityFaqTypes';
import type { HouseSpecification } from '../specification/houseSpecificationTypes';

export const MODERN_4KK_PRIORITY_FAQ_SOURCE: readonly Omit<HousePriorityFaqItem, 'knowledgeAtomIds' | 'constraints'>[] = [
  {
    "id": "land-01",
    "houseId": "modern-4kk",
    "priority": "LAND",
    "question": "Pro jaký typ pozemku je 4KK vhodný?",
    "answer": "Dům byl navržen jako kompaktní typový celek a díky malému konstrukčnímu rozponu se může dobře uplatnit i na užších parcelách. Vhodnost ale vždy závisí na rozměrech, regulativech, odstupových vzdálenostech, terénu a možnostech napojení konkrétního pozemku."
  },
  {
    "id": "land-02",
    "houseId": "modern-4kk",
    "priority": "LAND",
    "question": "Z jaké strany je ideální příjezd?",
    "answer": "Dům je primárně koncipován pro příjezd ze severu, východu nebo západu. Vstup je na severní straně, takže jižní část pozemku může zůstat pobytová a otevřená zahradě."
  },
  {
    "id": "land-03",
    "houseId": "modern-4kk",
    "priority": "LAND",
    "question": "Proč je hlavní terasa na jih?",
    "answer": "Jižní krytá terasa je součástí konceptu „byt v zahradě“. Je přímo propojena s kuchyní, pracovnou a dětským pokojem a vytváří hlavní pobytové rozhraní mezi domem a zahradou."
  },
  {
    "id": "land-04",
    "houseId": "modern-4kk",
    "priority": "LAND",
    "question": "Může mít dům i západní terasu?",
    "answer": "Ano. Obytný pokoj může mít přímý výstup na západní terasu, která rozšiřuje kontakt se zahradou a dobře funguje pro odpolední a večerní pobyt."
  },
  {
    "id": "land-05",
    "houseId": "modern-4kk",
    "priority": "LAND",
    "question": "Lze dům zrcadlově převrátit?",
    "answer": "Ano, konstrukčně to možné je. Základní varianta je ale optimalizována vůči světovým stranám, takže zrcadlení může část této optimalizace zhoršit."
  },
  {
    "id": "land-06",
    "houseId": "modern-4kk",
    "priority": "LAND",
    "question": "Co když už pozemek mám?",
    "answer": "Nejprve má smysl ověřit, zda pozemek domu vyhovuje. Filozofií DSE není vyladěný dům za každou cenu deformovat podle parcely, ale zjistit, zda se dům a místo přirozeně potkávají."
  },
  {
    "id": "land-07",
    "houseId": "modern-4kk",
    "priority": "LAND",
    "question": "Proč byl dům navržen bez konkrétního pozemku?",
    "answer": "DSE záměrně dočasně vypustilo pozemek i klienta z rovnice, aby mohlo nejprve optimalizovat samotný dům bez kompromisů. Teprve potom se hledá vhodné místo a vhodný uživatel."
  },
  {
    "id": "land-08",
    "houseId": "modern-4kk",
    "priority": "LAND",
    "question": "Je nutný rovný pozemek?",
    "answer": "Knowledge Base nestanovuje obecný požadavek na dokonale rovný pozemek. Referenční realizace v Krásném Poli měla téměř rovnou zahradu, ale to je vlastnost konkrétní developerské akce, nikoli automatický požadavek typového domu."
  },
  {
    "id": "land-09",
    "houseId": "modern-4kk",
    "priority": "LAND",
    "question": "Jaké napojení na odpad dům potřebuje?",
    "answer": "Pokud je dostupná veřejná kanalizace, dům se napojuje na kanalizaci. Biologická ČOV je řešením pouze tam, kde kanalizace není."
  },
  {
    "id": "land-10",
    "houseId": "modern-4kk",
    "priority": "LAND",
    "question": "Jak CONIS posoudí vhodnost mého pozemku?",
    "answer": "Má oddělit pevné vlastnosti domu od parametrů konkrétní parcely a ověřovat zejména orientaci, přístup, rozměry, vztah k zahradě a technické možnosti. Nemá automaticky tvrdit, že každý pozemek je vhodný."
  },
  {
    "id": "layout-01",
    "houseId": "modern-4kk",
    "priority": "LAYOUT",
    "question": "Co je hlavní myšlenkou dispozice 4KK?",
    "answer": "Maximální užitná hodnota při kompaktní ploše. Dům omezuje chodby, slepá zákoutí a plochy s malou praktickou hodnotou a soustřeďuje prostor tam, kde jej obyvatelé skutečně používají."
  },
  {
    "id": "layout-02",
    "houseId": "modern-4kk",
    "priority": "LAYOUT",
    "question": "Proč uvnitř nejsou nosné stěny?",
    "answer": "Hlavní nosný systém je soustředěn do obvodových příčných rámů. To umožnilo navrhnout vnitřní dispozici bez diktátu nosných stěn a velmi efektivně pracovat s prostorem."
  },
  {
    "id": "layout-03",
    "houseId": "modern-4kk",
    "priority": "LAYOUT",
    "question": "Je hlavní obytný prostor otevřený?",
    "answer": "Ano. Kuchyň, jídelna a obývací část tvoří společné centrum a prostor je otevřený až do šikmé střechy. Princip stodoly přidává objem, vzdušnost a světlo."
  },
  {
    "id": "layout-04",
    "houseId": "modern-4kk",
    "priority": "LAYOUT",
    "question": "Jak vysoká je střední část domu?",
    "answer": "Střední část s chodbou, pokoji, koupelnou, šatnou a WC má výšku přibližně 2 500 mm. Nad ní vzniká technické podkroví."
  },
  {
    "id": "layout-05",
    "houseId": "modern-4kk",
    "priority": "LAYOUT",
    "question": "Kde je technické podkroví přístupné?",
    "answer": "Stahovacími schůdky z chodby před ložnicí. Vedle technické funkce poskytuje také rezervní úložný prostor."
  },
  {
    "id": "layout-06",
    "houseId": "modern-4kk",
    "priority": "LAYOUT",
    "question": "Mají pokoje přímý výstup ven?",
    "answer": "Prakticky všechny obytné místnosti mají francouzská okna. Na jižní terasu se vystupuje z kuchyně, pracovny a dětského pokoje, obývací pokoj může mít západní terasu a vlastní výstup má i ložnice."
  },
  {
    "id": "layout-07",
    "houseId": "modern-4kk",
    "priority": "LAYOUT",
    "question": "Je v domě hodně chodeb?",
    "answer": "Ne. Jedním z hlavních cílů návrhu je minimum komunikačních ploch a zákoutí s nízkou využitelnou hodnotou."
  },
  {
    "id": "layout-08",
    "houseId": "modern-4kk",
    "priority": "LAYOUT",
    "question": "Jak jsou řešeny úložné prostory?",
    "answer": "Každodenní ukládání přebírají integrované šatny a vestavěný nábytek, méně používané věci technické podkroví a venkovní vybavení zahradní domek."
  },
  {
    "id": "layout-09",
    "houseId": "modern-4kk",
    "priority": "LAYOUT",
    "question": "Dá se pracovna využít jinak?",
    "answer": "Nejsmysluplnější známou dispoziční variantou je spojení pracovny a dětského pokoje do jedné větší místnosti. Rozsáhlejší změny už zpravidla narušují původní optimalizaci."
  },
  {
    "id": "layout-10",
    "houseId": "modern-4kk",
    "priority": "LAYOUT",
    "question": "Proč dům působí větší, než odpovídá půdorysu?",
    "answer": "Kombinuje minimum nevyužité plochy, vysoký otevřený obytný prostor, velká prosklení, přímé vazby do zahrady a integrované ukládání. Velikost proto vytváří nejen plocha, ale i objem a způsob využití."
  },
  {
    "id": "privacy-01",
    "houseId": "modern-4kk",
    "priority": "PRIVACY",
    "question": "Není otevřený koncept na úkor soukromí?",
    "answer": "Ne. Otevřená je především společenská část domu. Ložnice, dětský pokoj a pracovna zůstávají samostatnými místnostmi."
  },
  {
    "id": "privacy-02",
    "houseId": "modern-4kk",
    "priority": "PRIVACY",
    "question": "Jak jsou akusticky řešeny příčky?",
    "answer": "Základ tvoří Ekopanel 40 mm, 60mm rastr nebo dutina a druhý Ekopanel 40 mm. Dutinu lze zafoukat izolací; právě akustika je hlavním důvodem této skladby."
  },
  {
    "id": "privacy-03",
    "houseId": "modern-4kk",
    "priority": "PRIVACY",
    "question": "Jak se řeší kročejový hluk?",
    "answer": "Podlahová skladba obsahuje kročejovou izolaci z pochozí minerální vaty. Akustický komfort je tedy řešen současně ve stěnách i podlaze."
  },
  {
    "id": "privacy-04",
    "houseId": "modern-4kk",
    "priority": "PRIVACY",
    "question": "Má ložnice vlastní kontakt se zahradou?",
    "answer": "Ano. Ložnice má vlastní výstup ven, takže kontakt se zahradou není podmíněn průchodem společným obývacím prostorem."
  },
  {
    "id": "privacy-05",
    "houseId": "modern-4kk",
    "priority": "PRIVACY",
    "question": "Jak je řešeno soukromí u vstupu?",
    "answer": "Vstupní dveře používají mléčné sklo. Přivádějí světlo, ale omezují přímé pohledy do interiéru."
  },
  {
    "id": "privacy-06",
    "houseId": "modern-4kk",
    "priority": "PRIVACY",
    "question": "Jsou koupelna a WC prosklené francouzskými okny?",
    "answer": "Ne. Francouzská okna charakterizují obytné místnosti; koupelna a WC jsou výjimkou."
  },
  {
    "id": "privacy-07",
    "houseId": "modern-4kk",
    "priority": "PRIVACY",
    "question": "Pomáhá dispozice soukromí jednotlivých členů rodiny?",
    "answer": "Ano. Kompaktnost nevzniká slučováním všech funkcí do jednoho prostoru, ale odstraněním zbytečných komunikací. Soukromé pokoje zůstávají samostatné."
  },
  {
    "id": "privacy-08",
    "houseId": "modern-4kk",
    "priority": "PRIVACY",
    "question": "Jakou roli hraje zahrada v soukromí?",
    "answer": "Jednotlivé obytné místnosti mají vlastní vztah k exteriéru. Člověk tak může být v kontaktu se zahradou i mimo hlavní společenskou část."
  },
  {
    "id": "privacy-09",
    "houseId": "modern-4kk",
    "priority": "PRIVACY",
    "question": "Jsou posuvné dveře akusticky problematické?",
    "answer": "Tam, kde se s nimi pracuje, konfigurace počítá se zvukovým těsněním. CONIS ale nemá bez konkrétního protokolu slibovat číselnou hodnotu neprůzvučnosti."
  },
  {
    "id": "privacy-10",
    "houseId": "modern-4kk",
    "priority": "PRIVACY",
    "question": "Je dům vhodný pro práci z domova?",
    "answer": "Má samostatnou pracovnu, takže funkčně práci z domova podporuje. Zda je její velikost a poloha ideální pro konkrétní způsob práce, je už individuální otázka."
  },
  {
    "id": "energy-01",
    "houseId": "modern-4kk",
    "priority": "ENERGY",
    "question": "Co je hlavním zdrojem tepla?",
    "answer": "Hlavním zdrojem je klimatizační jednotka integrovaná do rekuperační vzduchotechnické jednotky ZEHNDER. Systém spojuje větrání, vytápění a chlazení."
  },
  {
    "id": "energy-02",
    "houseId": "modern-4kk",
    "priority": "ENERGY",
    "question": "K čemu slouží topné fólie?",
    "answer": "Jsou záložním zdrojem tepla. Podle výpočtu se předpokládá jejich využití přibližně 25 dní v roce; skutečný provoz závisí na počasí a užívání."
  },
  {
    "id": "energy-03",
    "houseId": "modern-4kk",
    "priority": "ENERGY",
    "question": "Jaká je tepelná ztráta domu?",
    "answer": "Pro 4KK se v podkladech DSE pracuje s tepelnou ztrátou přibližně 3,7 kW."
  },
  {
    "id": "energy-04",
    "houseId": "modern-4kk",
    "priority": "ENERGY",
    "question": "Jak dům šetří teplo při větrání?",
    "answer": "Používá řízené mechanické větrání s rekuperací. Teplo z odváděného vzduchu se využívá pro přiváděný vzduch místo nekontrolovaného větrání okny."
  },
  {
    "id": "energy-05",
    "houseId": "modern-4kk",
    "priority": "ENERGY",
    "question": "Jak se šetří energie na teplé vodě?",
    "answer": "Kombinací bojleru s integrovaným tepelným čerpadlem a systému AKIRETHERM 80, který získává zpět teplo z vybrané teplé odpadní vody."
  },
  {
    "id": "energy-06",
    "houseId": "modern-4kk",
    "priority": "ENERGY",
    "question": "Co dělá fotovoltaika?",
    "answer": "Je základní součástí energetického konceptu a může pokrývat část spotřeby domu, technologií, přípravy TUV, chlazení i nabíjení elektromobilu."
  },
  {
    "id": "energy-07",
    "houseId": "modern-4kk",
    "priority": "ENERGY",
    "question": "Může dům vyrobit více energie, než spotřebuje?",
    "answer": "DSE s touto možností pracuje v roční energetické bilanci při odpovídající konfiguraci a podmínkách. Neznamená to, že je dům v každém okamžiku energeticky soběstačný."
  },
  {
    "id": "energy-08",
    "houseId": "modern-4kk",
    "priority": "ENERGY",
    "question": "Jak se brání letnímu přehřívání?",
    "answer": "Trojskly s pokovením, venkovními žaluziemi, krytými terasami a přesahy, automatickým řízením a následně aktivním chlazením. Prioritou je teplo do domu nejprve nepustit."
  },
  {
    "id": "energy-09",
    "houseId": "modern-4kk",
    "priority": "ENERGY",
    "question": "Jakou roli má AMPIO?",
    "answer": "Řídí společně teplo, chlad, intenzitu větrání, osvětlení a žaluzie. Automatiku může vlastník kdykoli korigovat a systém lze ovládat i z mobilu."
  },
  {
    "id": "energy-10",
    "houseId": "modern-4kk",
    "priority": "ENERGY",
    "question": "Co je kaskáda úspor DSE?",
    "answer": "Nejde o jednu technologii. Nejprve se snižuje potřeba energie, poté se rekuperuje teplo, využívají účinné zdroje, FVE a baterie a nakonec se optimalizuje čas nákupu, spotřeby a prodeje energie."
  },
  {
    "id": "operating_costs-01",
    "houseId": "modern-4kk",
    "priority": "OPERATING_COSTS",
    "question": "Proč mohou být provozní náklady nízké?",
    "answer": "Dům kombinuje velmi nízkou tepelnou ztrátu, rekuperaci vzduchu, efektivní přípravu TUV, rekuperaci tepla z odpadní vody, FVE, automatické řízení a možnost časové optimalizace elektřiny."
  },
  {
    "id": "operating_costs-02",
    "houseId": "modern-4kk",
    "priority": "OPERATING_COSTS",
    "question": "Lze říct přesnou roční částku za energie?",
    "answer": "Ne bez konkrétních vstupů. CONIS nemá garantovat roční účet, protože závisí na počtu obyvatel, teplotách, spotřebě TUV, chování, FVE, tarifu, cenách a dalších podmínkách."
  },
  {
    "id": "operating_costs-03",
    "houseId": "modern-4kk",
    "priority": "OPERATING_COSTS",
    "question": "Jak pomáhá režim noční teploty?",
    "answer": "Při odchodu může dům snížit teplotu. Lehká konstrukce má rychlou tepelnou odezvu, takže při návratu lze komfortní teplotu obnovit bez dlouhého předehřívání velké akumulační hmoty."
  },
  {
    "id": "operating_costs-04",
    "houseId": "modern-4kk",
    "priority": "OPERATING_COSTS",
    "question": "Jak Chytrý Spot snižuje náklady?",
    "answer": "Pracuje s denním cenovým cyklem: může výhodněji prodávat přebytky, levněji nakupovat chybějící energii, využívat rezervu baterie pro cenové rozdíly a čerpat energii při záporných spotových cenách."
  },
  {
    "id": "operating_costs-05",
    "houseId": "modern-4kk",
    "priority": "OPERATING_COSTS",
    "question": "Proč je důležitá baterie?",
    "answer": "Není jen úložištěm přebytků FVE. Může umožnit přesun nákupu a spotřeby mezi levnějšími a dražšími částmi dne."
  },
  {
    "id": "operating_costs-06",
    "houseId": "modern-4kk",
    "priority": "OPERATING_COSTS",
    "question": "Jak může elektromobil snížit celkové náklady domácnosti?",
    "answer": "Energie z vlastní FVE může nahradit část benzínu nebo nafty. Ekonomika domu se tím rozšiřuje z účtu za elektřinu na celkovou energetickou bilanci domácnosti včetně mobility."
  },
  {
    "id": "operating_costs-07",
    "houseId": "modern-4kk",
    "priority": "OPERATING_COSTS",
    "question": "Jak se šetří voda?",
    "answer": "Dešťová voda z retenční nádrže se využívá pro splachování, zalévání a případně bazén, takže na tyto funkce není nutné používat pouze pitnou vodu."
  },
  {
    "id": "operating_costs-08",
    "houseId": "modern-4kk",
    "priority": "OPERATING_COSTS",
    "question": "Kolik může ušetřit AKIRETHERM?",
    "answer": "V podkladech DSE se pracuje s potenciálem až kolem 70 % energie na ohřevu TUV a až přibližně 40 % z celkového energetického účtu. Jde o potenciál systému, ne garantovanou úsporu každé domácnosti."
  },
  {
    "id": "operating_costs-09",
    "houseId": "modern-4kk",
    "priority": "OPERATING_COSTS",
    "question": "Jsou technologie drahé na servis?",
    "answer": "Znalostní báze neobsahuje doložený servisní rozpočet, takže CONIS nemá tvrdit konkrétní částku. Výhodou je soustředění hlavních technologií do technické místnosti, což zjednodušuje přístup a kontrolu."
  },
  {
    "id": "operating_costs-10",
    "houseId": "modern-4kk",
    "priority": "OPERATING_COSTS",
    "question": "Je ekonomika domu jen o nízké spotřebě?",
    "answer": "Ne. DSE kombinuje nízkou spotřebu s rekuperací energie, vlastní výrobou, baterií, časovou optimalizací cen a případně elektromobilem. Ekonomika proto vzniká na více úrovních."
  },
  {
    "id": "design-01",
    "houseId": "modern-4kk",
    "priority": "DESIGN",
    "question": "Jaký je základní architektonický charakter domu?",
    "answer": "Jednoduchá současná interpretace stodoly: antracitový plechový plášť, přírodní dřevo ve vybraných částech a velké prosklené plochy směrem do zahrady."
  },
  {
    "id": "design-02",
    "houseId": "modern-4kk",
    "priority": "DESIGN",
    "question": "Proč je obytný prostor otevřený do střechy?",
    "answer": "Vysoký objem přidává vzdušnost, velikost a světlo. Je to důležitá část principu „malý zvenčí, velký uvnitř“."
  },
  {
    "id": "design-03",
    "houseId": "modern-4kk",
    "priority": "DESIGN",
    "question": "Jaké jsou hlavní materiály exteriéru?",
    "answer": "Antracitový plech, smrk v dezénu dub přírodní, Thermowood borovice na terasách, antracitová okna, mléčné sklo vstupních dveří, CETRIS na soklu a kačírkový obsyp."
  },
  {
    "id": "design-04",
    "houseId": "modern-4kk",
    "priority": "DESIGN",
    "question": "Jaký je charakter interiéru?",
    "answer": "Klidná omezená paleta dřeva, světlých neutrálních ploch, šedých tónů, skla a kovových detailů. Cílem je jeden souvislý interiér, ne série samostatně dekorovaných místností."
  },
  {
    "id": "design-05",
    "houseId": "modern-4kk",
    "priority": "DESIGN",
    "question": "Jaká je podlaha?",
    "answer": "Třívrstvá dubová dřevěná podlaha tloušťky 14 mm v palubkovém vzoru."
  },
  {
    "id": "design-06",
    "houseId": "modern-4kk",
    "priority": "DESIGN",
    "question": "Jak je řešen vestavěný nábytek?",
    "answer": "Aktuální specifikace používá laminovanou DTD v dekoru bělený dub s ABS hranou v dekoru Multiplex, doplněnou podle místa světle šedými plochami, matným sklem a hliníkovými detaily."
  },
  {
    "id": "design-07",
    "houseId": "modern-4kk",
    "priority": "DESIGN",
    "question": "Jak je řešeno večerní osvětlení obývacího prostoru?",
    "answer": "Nepřímou LED lištou svítící vzhůru a lokálními závěsnými lustry nad jídelním stolem a stolkem u sedací soupravy."
  },
  {
    "id": "design-08",
    "houseId": "modern-4kk",
    "priority": "DESIGN",
    "question": "Proč je dřevo na fasádě jen omezeně?",
    "answer": "Dřevo změkčuje antracitový plášť a vytváří charakter domu, ale je soustředěno do menších a dobře dostupných ploch. Design se tak kombinuje s jednoduchou údržbou."
  },
  {
    "id": "design-09",
    "houseId": "modern-4kk",
    "priority": "DESIGN",
    "question": "Jak design souvisí se zahradou?",
    "answer": "Velká francouzská okna a více přímých výstupů dělají zahradu součástí vnímání interiéru. Dům není uzavřený objekt vedle zahrady, ale „byt v zahradě“."
  },
  {
    "id": "design-10",
    "houseId": "modern-4kk",
    "priority": "DESIGN",
    "question": "Je design jen estetická vrstva?",
    "answer": "Ne. U DSE má detail současně dobře vypadat, fungovat a usnadňovat život. Design je propojen s prostorem, světlem, údržbou, ukládáním i technologiemi."
  },
  {
    "id": "quality-01",
    "houseId": "modern-4kk",
    "priority": "QUALITY",
    "question": "Z čeho je hlavní nosná konstrukce?",
    "answer": "Z KVH dřeva. Příčné rámy mají potvrzený průřez 240/60 mm, štíty 160/40 mm a podlahové fošny a kleštiny 160/40 mm."
  },
  {
    "id": "quality-02",
    "houseId": "modern-4kk",
    "priority": "QUALITY",
    "question": "Jak fungují spoje rámů?",
    "answer": "Pětikloubový rám je řešen jako spojitý systém s překližkovými příložkami 2 × 240/21 mm. Zatížení nenese izolovaně jeden kloub, ale posuzuje se celek."
  },
  {
    "id": "quality-03",
    "houseId": "modern-4kk",
    "priority": "QUALITY",
    "question": "Co zajišťuje stabilitu v podélném směru?",
    "answer": "Vnitřní statická krabice z Ekopanelů 60 mm společně s plechovými táhly."
  },
  {
    "id": "quality-04",
    "houseId": "modern-4kk",
    "priority": "QUALITY",
    "question": "Jaká je tepelná izolace obálky?",
    "answer": "Ve schválené skladbě se používá 240 mm Climatizer Plus mezi konstrukčními vrstvami, doplněný Ekopanelem a difuzně otevřeným odvětraným pláštěm."
  },
  {
    "id": "quality-05",
    "houseId": "modern-4kk",
    "priority": "QUALITY",
    "question": "Jak konstrukce pracuje s vlhkostí?",
    "answer": "Je difuzně otevřená. Climatizer podporuje transport vlhkosti směrem ven a odvětrávaná fasáda i střecha umožňují její odvod."
  },
  {
    "id": "quality-06",
    "houseId": "modern-4kk",
    "priority": "QUALITY",
    "question": "Jak je chráněno dřevo?",
    "answer": "KVH konstrukce je ošetřena přípravkem Bochemit a zároveň chráněna správnou skladbou, difuzním režimem a odvětráním."
  },
  {
    "id": "quality-07",
    "houseId": "modern-4kk",
    "priority": "QUALITY",
    "question": "Jak je řešena požární bezpečnost?",
    "answer": "Přes konkrétní PBŘ stavby a certifikované vlastnosti materiálů. Ekopanel 60 má být posuzován podle certifikace a Climatizer Plus má samozhášivé vlastnosti. Bez protokolu se nemají uvádět konkrétní minuty."
  },
  {
    "id": "quality-08",
    "houseId": "modern-4kk",
    "priority": "QUALITY",
    "question": "Jak je řešena akustika?",
    "answer": "Kombinací dvojitých Ekopanelových příček s dutinou, možnosti zafoukání příček, Climatizeru a kročejové izolace z pochozí minerální vaty."
  },
  {
    "id": "quality-09",
    "houseId": "modern-4kk",
    "priority": "QUALITY",
    "question": "Je kvalita jen o drahých materiálech?",
    "answer": "Ne. DSE chápe kvalitu jako souhru konstrukce, detailu, materiálů, prostorového návrhu, akustiky, technologií, údržby a dlouhodobého fungování."
  },
  {
    "id": "quality-10",
    "houseId": "modern-4kk",
    "priority": "QUALITY",
    "question": "Je koncept ověřený realizací?",
    "answer": "Ano. Bungalov 4KK byl součástí pilotního developerského projektu DSE v Ostravě – Krásném Poli realizovaného v roce 2024. Parametry konkrétní parcely se ale nemají zaměňovat s typovým domem."
  },
  {
    "id": "investment-01",
    "houseId": "modern-4kk",
    "priority": "INVESTMENT",
    "question": "V čem je investiční logika energeticky úsporného domu?",
    "answer": "Hodnota není pouze v nízké spotřebě. Dům kombinuje omezení potřeby energie, její rekuperaci, vlastní výrobu, chytré řízení a možnost snížit i náklady na mobilitu."
  },
  {
    "id": "investment-02",
    "houseId": "modern-4kk",
    "priority": "INVESTMENT",
    "question": "Je možné spočítat návratnost FVE bez údajů o domácnosti?",
    "answer": "Ne. Návratnost závisí na velikosti systému, spotřebě, cenách, způsobu využití přebytků, baterii a dalších podmínkách. CONIS má pracovat s konkrétními vstupy."
  },
  {
    "id": "investment-03",
    "houseId": "modern-4kk",
    "priority": "INVESTMENT",
    "question": "Jakou ekonomickou roli má elektromobil?",
    "answer": "Může využít vlastní fotovoltaickou energii a nahradit část výdajů za PHM. Proto může být ekonomický přínos FVE větší, než ukazuje samotný účet za elektřinu domu."
  },
  {
    "id": "investment-04",
    "houseId": "modern-4kk",
    "priority": "INVESTMENT",
    "question": "Jakou roli má Chytrý Spot?",
    "answer": "Rozšiřuje ekonomiku energetiky o čas. Neřeší jen kolik energie se vyrobí, ale kdy se energie koupí, uloží, spotřebuje nebo prodá."
  },
  {
    "id": "investment-05",
    "houseId": "modern-4kk",
    "priority": "INVESTMENT",
    "question": "Proč může být optimalizovaný typový dům investičně zajímavý?",
    "answer": "Část hodnoty vzniká tím, že klíčová prostorová, konstrukční a technologická rozhodnutí jsou předem promyšlena a prakticky odladěna. Knowledge Base ale neobsahuje podklady pro garantování budoucí tržní ceny."
  },
  {
    "id": "investment-06",
    "houseId": "modern-4kk",
    "priority": "INVESTMENT",
    "question": "Zvyšuje energetická třída hodnotu nemovitosti?",
    "answer": "Podklady potvrzují energetickou náročnost A+ pro koncept 4KK, ale neobsahují analýzu budoucího dopadu na tržní cenu. CONIS proto nemá slibovat konkrétní zhodnocení."
  },
  {
    "id": "investment-07",
    "houseId": "modern-4kk",
    "priority": "INVESTMENT",
    "question": "Je referenční realizace důležitá pro investiční důvěru?",
    "answer": "Ano. Ukazuje, že nejde jen o studii: DSE v roce 2024 realizovalo pilotní developerský projekt a na něm komplexní technologické řešení odladilo."
  },
  {
    "id": "investment-08",
    "houseId": "modern-4kk",
    "priority": "INVESTMENT",
    "question": "Je výhodnější prodávat přebytky FVE okamžitě?",
    "answer": "Ne nutně. Chytrý Spot pracuje s cenovým průběhem dne a může hledat ekonomicky vhodnější okamžik pro prodej nebo využití energie."
  },
  {
    "id": "investment-09",
    "houseId": "modern-4kk",
    "priority": "INVESTMENT",
    "question": "Může baterie vydělávat na cenových rozdílech?",
    "answer": "Podle popsané strategie může část rezervy baterie sloužit k nákupu v levnější části dne a využití nebo prodeji v dražší části. Konkrétní výsledek závisí na trhu a nastavení."
  },
  {
    "id": "investment-10",
    "houseId": "modern-4kk",
    "priority": "INVESTMENT",
    "question": "Co je nejdůležitější při posuzování investice do 4KK?",
    "answer": "Posuzovat celek: pořizovací řešení, provoz, energii, údržbu, vhodnost pro způsob života a případně mobilitu. Jedna izolovaná technologie nevystihuje ekonomiku domu."
  },
  {
    "id": "maintenance-01",
    "houseId": "modern-4kk",
    "priority": "MAINTENANCE",
    "question": "Je dům bezúdržbový?",
    "answer": "Ne. Správná formulace je, že je koncipován pro jednoduchou údržbu a nízkou provozní náročnost. Každý dům a každé zařízení vyžaduje předepsané kontroly a servis."
  },
  {
    "id": "maintenance-02",
    "houseId": "modern-4kk",
    "priority": "MAINTENANCE",
    "question": "Jak náročná je údržba plechového pláště?",
    "answer": "Střecha a boční fasády z plechu jsou navrženy jako plochy s prakticky nulovou běžnou povrchovou údržbou."
  },
  {
    "id": "maintenance-03",
    "houseId": "modern-4kk",
    "priority": "MAINTENANCE",
    "question": "Kde je na exteriéru dřevo?",
    "answer": "Především ve štítech, přístřešcích a zahradním domku; na terasách je Thermowood borovice. Dřevěných ploch je relativně málo a jsou převážně dostupné ze země."
  },
  {
    "id": "maintenance-04",
    "houseId": "modern-4kk",
    "priority": "MAINTENANCE",
    "question": "Proč je kolem soklu kačírek?",
    "answer": "Je součástí čistého a praktického kontaktu domu s terénem. Sokl je opláštěn CETRIS deskou s antracitovým nátěrem."
  },
  {
    "id": "maintenance-05",
    "houseId": "modern-4kk",
    "priority": "MAINTENANCE",
    "question": "Jak interiér usnadňuje úklid?",
    "answer": "Má minimum zákoutí, integrované šatny, hladké podlahy a zaoblené přechodové lišty. Skříňky v koupelně, WC a obytném prostoru jsou zavěšené na stěnách."
  },
  {
    "id": "maintenance-06",
    "houseId": "modern-4kk",
    "priority": "MAINTENANCE",
    "question": "Je dům vhodný pro robotický vysavač?",
    "answer": "Ano, právě souvislá podlaha, hladké přechody, minimum překážek a zavěšený nábytek vytvářejí vhodné podmínky pro robotický úklid."
  },
  {
    "id": "maintenance-07",
    "houseId": "modern-4kk",
    "priority": "MAINTENANCE",
    "question": "Kde se servisují hlavní technologie?",
    "answer": "Hlavní technologie jsou soustředěny v technické místnosti, což zjednodušuje přístup, kontrolu a servis."
  },
  {
    "id": "maintenance-08",
    "houseId": "modern-4kk",
    "priority": "MAINTENANCE",
    "question": "Kde je AKIRETHERM?",
    "answer": "Je mimo technickou místnost – venku u vstupu pod úrovní terénu."
  },
  {
    "id": "maintenance-09",
    "houseId": "modern-4kk",
    "priority": "MAINTENANCE",
    "question": "Jak se chrání konstrukce před vlhkostí?",
    "answer": "Difuzně otevřenou skladbou, Climatizerem, difuzní vrstvou a odvětrávanou fasádou i střechou. KVH je navíc ošetřeno Bochemitem."
  },
  {
    "id": "maintenance-10",
    "houseId": "modern-4kk",
    "priority": "MAINTENANCE",
    "question": "Proč jsou pračka a sušička v technické místnosti?",
    "answer": "Technická místnost funguje i jako provozní zázemí. Praní se tím soustředí mimo hlavní obytné prostory společně s technologiemi domu."
  },
  {
    "id": "flexibility-01",
    "houseId": "modern-4kk",
    "priority": "FLEXIBILITY",
    "question": "Je 4KK plně individualizovatelný?",
    "answer": "Ne – a není to jeho cíl. Dům je předem optimalizovaný celek. Velké dispoziční změny by zpravidla znamenaly ztrátu některých jeho výhod."
  },
  {
    "id": "flexibility-02",
    "houseId": "modern-4kk",
    "priority": "FLEXIBILITY",
    "question": "Co lze v dispozici smysluplně změnit?",
    "answer": "Jako známá smysluplná varianta se nabízí například spojení pracovny a dětského pokoje do jedné větší místnosti."
  },
  {
    "id": "flexibility-03",
    "houseId": "modern-4kk",
    "priority": "FLEXIBILITY",
    "question": "Proč konstrukce umožňuje změny, když se nedoporučují?",
    "answer": "Absence vnitřních nosných stěn dává konstrukční svobodu. DSE ji využilo hlavně při návrhu optimální dispozice, nikoli jako argument pro nekonečné přestavování hotového konceptu."
  },
  {
    "id": "flexibility-04",
    "houseId": "modern-4kk",
    "priority": "FLEXIBILITY",
    "question": "Lze dům zrcadlit?",
    "answer": "Ano, ale zrcadlení může mírně zhoršit původní optimalizaci světových stran."
  },
  {
    "id": "flexibility-05",
    "houseId": "modern-4kk",
    "priority": "FLEXIBILITY",
    "question": "Lze přizpůsobovat materiály?",
    "answer": "Ano, materiálová a vybavovací rovina nabízí větší prostor než samotná dispozice. Aktuální Knowledge Base ale rozlišuje referenční řešení od historických variant konfigurátoru."
  },
  {
    "id": "flexibility-06",
    "houseId": "modern-4kk",
    "priority": "FLEXIBILITY",
    "question": "Může vlastník měnit automatické řízení domu?",
    "answer": "Ano. AMPIO automatizuje provoz, ale vlastník zůstává nad systémem a může nastavení měnit podle svých preferencí, včetně ovládání z mobilu."
  },
  {
    "id": "flexibility-07",
    "houseId": "modern-4kk",
    "priority": "FLEXIBILITY",
    "question": "Lze měnit teplotní režimy podle způsobu života?",
    "answer": "Ano. Dům může pracovat například s noční teplotou při nepřítomnosti a před návratem se rychle přepnout na komfortní režim."
  },
  {
    "id": "flexibility-08",
    "houseId": "modern-4kk",
    "priority": "FLEXIBILITY",
    "question": "Je systém připraven na elektromobil?",
    "answer": "Ano. Koncept počítá s nabíječkou elektromobilu v zahradním domku a s využitím vlastní fotovoltaické energie pro mobilitu."
  },
  {
    "id": "flexibility-09",
    "houseId": "modern-4kk",
    "priority": "FLEXIBILITY",
    "question": "Co když na pozemku není kanalizace?",
    "answer": "Koncept je flexibilní v odpadním hospodářství: pokud kanalizace je, využije se; pokud není, lze použít biologickou ČOV."
  },
  {
    "id": "flexibility-10",
    "houseId": "modern-4kk",
    "priority": "FLEXIBILITY",
    "question": "V čem je největší flexibilita celého konceptu?",
    "answer": "Ne v libovolném překreslování domu, ale v tom, že pevné a odladěné architektonické jádro může spolupracovat s různým způsobem řízení, energetickým provozem, materiálovým vybavením a vhodnými pozemky."
  }
] as const;

export const MODERN_4KK_SPECIFICATION: HouseSpecification = {
  identity: {
    houseId: 'modern-4kk',
    name: 'MODERN 4KK',
    slug: 'modern-4kk',
    objectType: 'bungalow',
    canonicalProjectId: 'project-domy-s-energii',
    companyId: 'company-domy-s-energii',
    status: 'published',
    role: 'reference',
  },
  dimensions: { usableAreaM2: 119, storeys: 1 },
  disposition: { layoutCode: '4+KK', bathrooms: 1 },
  construction: {
    constructionSystem: 'Lehký dřevěný rámový systém z KVH',
    structure: 'Příčné dřevěné rámy se spojitým pětikloubovým statickým systémem',
    roofType: 'Šikmá střecha',
  },
  energy: {
    energyClass: 'A+',
    heatingDemand: 'Tepelná ztráta přibližně 3,7 kW',
    renewables: ['Fotovoltaika'],
    insulationSummary: 'Ekopanel, Climatizer Plus a difuzně otevřený odvětrávaný plášť',
  },
  technologies: {
    hvac: ['ZEHNDER: větrání, vytápění a chlazení', 'Záložní elektrické topné fólie'],
    ventilation: 'Řízené mechanické větrání s rekuperací',
    smartHome: ['AMPIO'],
    water: 'Bojler s integrovaným tepelným čerpadlem a AKIRETHERM 80',
  },
  materials: {
    primaryMaterials: ['KVH', 'Ekopanel', 'Climatizer Plus'],
    facade: 'Antracitový plech a vybrané části z přírodního dřeva',
    interiorFinishesStandard: 'Třívrstvá dubová dřevěná podlaha 14 mm; laminovaná DTD v dekoru bělený dub',
  },
  limitations: {
    limitations: [
      'Konkrétní roční energetické náklady, úspory a návratnosti vyžadují vstupy konkrétní domácnosti.',
      'Konkrétní požární odolnost vyžaduje PBŘ, certifikaci nebo klasifikační protokol.',
      'Parametry realizace v Ostravě–Krásném Poli nejsou automaticky vlastnostmi typového domu.',
    ],
  },
};

const CURRENT_SOURCE = {
  sourceId: 'conis-dse-4kk-knowledge-base-v1',
  kind: 'CURRENT_CONFIRMED' as const,
  label: 'Konsolidovaná Knowledge Base DSE 4KK v1',
};

export const MODERN_4KK_KNOWLEDGE: readonly HouseKnowledgeAtom[] = [
  {
    id: 'product-optimized-house',
    houseId: 'modern-4kk',
    subject: 'Vyladěný dům před pozemkem a klientem',
    category: 'product-philosophy',
    statement: 'MODERN 4KK je předem optimalizovaný celek; vhodnost se ověřuje vůči konkrétnímu pozemku a způsobu života.',
    scope: 'PRODUCT', confidence: 'CONFIRMED', source: CURRENT_SOURCE, validFrom: '2026-08-07', temporalStatus: 'CURRENT',
    constraints: ['Není určen pro neomezenou individualizaci.'],
    safeInterpretation: 'Při rozhodování má smysl porovnat pevné vlastnosti domu s konkrétním místem a způsobem života.',
    unsupportedConclusions: ['Výběr priority sám o sobě neznamená zájem o individuální konfiguraci domu.'],
    relatedTopics: ['pozemek', 'flexibilita'],
  },
  {
    id: 'product-space-efficiency',
    houseId: 'modern-4kk', subject: 'Malý zvenčí, velký uvnitř', category: 'space-efficiency',
    statement: 'Kompaktní dispozice omezuje chodby a nevyužité plochy; otevřený obytný prostor vytváří větší vnímaný objem.',
    scope: 'PRODUCT', confidence: 'CONFIRMED', source: CURRENT_SOURCE, validFrom: '2026-08-07', temporalStatus: 'CURRENT',
    constraints: [],
    safeInterpretation: 'V běžném používání se důraz přesouvá k plochám a objemu, které obyvatelé skutečně využívají.',
    factPoint: 'MÉNĚ PLOCHY PADNE NA CHODBY.',
    interpretationPoint: 'VÍCE PLOCHY ZŮSTÁVÁ PRO ŽIVOT.',
    relatedTopics: ['dispozice', 'design'],
  },
  {
    id: 'product-garden-living',
    houseId: 'modern-4kk', subject: 'Byt v zahradě', category: 'garden-relationship',
    statement: 'Obytné místnosti mají přímý vztah k exteriéru; jižní krytá terasa propojuje kuchyň, pracovnu a dětský pokoj se zahradou.',
    scope: 'PRODUCT', confidence: 'CONFIRMED', source: CURRENT_SOURCE, validFrom: '2026-08-07', temporalStatus: 'CURRENT',
    constraints: ['Vhodnost orientace vždy závisí na konkrétní parcele.'],
    safeInterpretation: 'Kontakt se zahradou lze posuzovat jako součást každodenního využití hlavních obytných místností.',
    relatedTopics: ['pozemek', 'dispozice', 'soukromí'],
  },
  {
    id: 'product-layout-structure',
    houseId: 'modern-4kk', subject: 'Dispoziční svoboda', category: 'layout',
    statement: 'Hlavní nosný systém je soustředěn do příčných rámů, takže vnitřní dispozice neobsahuje nosné stěny.',
    scope: 'PRODUCT', confidence: 'CONFIRMED', source: CURRENT_SOURCE, validFrom: '2026-08-07', temporalStatus: 'CURRENT',
    constraints: ['Rozsáhlé změny dispozice mohou narušit původní optimalizaci.'],
    safeInterpretation: 'Případné změny je vhodné hodnotit vůči původní optimalizaci domu, nikoli jako automaticky vhodné.',
    unsupportedConclusions: ['Priorita Dispozice ani Design neznamená automatický požadavek na konfigurátor nebo rozsáhlou změnu návrhu.'],
    relatedTopics: ['flexibilita', 'konstrukce'],
  },
  {
    id: 'product-technical-attic',
    houseId: 'modern-4kk', subject: 'Technické podkroví', category: 'storage',
    statement: 'Technické podkroví nad střední částí domu je přístupné stahovacími schůdky a poskytuje rezervní úložnou kapacitu.',
    scope: 'PRODUCT', confidence: 'CONFIRMED', source: CURRENT_SOURCE, validFrom: '2026-08-07', temporalStatus: 'CURRENT',
    constraints: ['Není obytným druhým podlažím.'],
    safeInterpretation: 'Méně často používané věci mohou mít vyhrazené zázemí mimo každodenní obytný provoz.',
    factPoint: 'TECHNICKÉ PODKROVÍ PŘIDÁVÁ ÚLOŽNÝ PROSTOR.',
    interpretationPoint: 'VĚCI NEJSOU V OBYTNÝCH MÍSTNOSTECH.',
    relatedTopics: ['dispozice', 'údržba'],
  },
  {
    id: 'product-construction-system',
    houseId: 'modern-4kk', subject: 'Konstrukční systém', category: 'construction',
    statement: 'Dům používá příčné dřevěné KVH rámy a vnitřní statickou krabici z Ekopanelů pro podélné zavětrování.',
    scope: 'PRODUCT', confidence: 'CONFIRMED', source: CURRENT_SOURCE, validFrom: '2026-08-07', temporalStatus: 'CURRENT',
    constraints: ['Detailní únosnosti a spojovací prostředky nejsou bez projektové dokumentace určeny pro poradenské tvrzení.'],
    safeInterpretation: 'Kvalita vychází ze souhry konstrukce a detailu.',
    factPoint: 'DŘEVĚNÉ RÁMY A EKOPANELY TVOŘÍ NOSNÝ SYSTÉM.',
    interpretationPoint: 'KONSTRUKCE A DETAIL TVOŘÍ JEDEN CELEK.',
    relatedTopics: ['kvalita', 'akustika'],
  },
  {
    id: 'product-diffusion-open-envelope',
    houseId: 'modern-4kk', subject: 'Difuzně otevřená obálka', category: 'envelope',
    statement: 'Ekopanel, Climatizer Plus a odvětrávaný plášť tvoří difuzně otevřenou skladbu stěn a šikmin střechy.',
    scope: 'PRODUCT', confidence: 'CONFIRMED', source: CURRENT_SOURCE, validFrom: '2026-08-07', temporalStatus: 'CURRENT',
    constraints: [],
    safeInterpretation: 'Skladba obálky spojuje konstrukční, provozní a dlouhodobé hledisko domu.',
    factPoint: 'STĚNY A STŘECHA MAJÍ DIFUZNĚ OTEVŘENOU SKLADBU.',
    interpretationPoint: 'OBÁLKA SPOJUJE KONSTRUKCI A PROVOZ.',
    relatedTopics: ['konstrukce', 'údržba', 'energie'],
  },
  {
    id: 'product-material-palette',
    houseId: 'modern-4kk', subject: 'Materiálová paleta', category: 'materials',
    statement: 'Exteriér kombinuje antracitový plech, přírodní dřevo ve vybraných částech, antracitová okna a Thermowood borovici na terasách.',
    scope: 'PRODUCT', confidence: 'CONFIRMED', source: CURRENT_SOURCE, validFrom: '2026-08-07', temporalStatus: 'CURRENT',
    constraints: [],
    safeInterpretation: 'Design lze posuzovat přes souhru materiálů, světla a údržby referenčního řešení.',
    factPoint: 'EXTERIÉR KOMBINUJE DŘEVO, PLECH A TERASU.',
    interpretationPoint: 'MATERIÁLY TVOŘÍ JEDNO REFERENČNÍ ŘEŠENÍ.',
    unsupportedConclusions: ['Priorita Design sama o sobě neurčuje estetický vkus návštěvníka ani požadavek na změnu materiálů.'],
    relatedTopics: ['design', 'údržba'],
  },
  {
    id: 'product-maintenance-design',
    houseId: 'modern-4kk', subject: 'Údržba jako součást návrhu', category: 'maintenance',
    statement: 'Snadná údržba vychází z omezeného počtu zákoutí, integrovaného ukládání, hladkých podlah a soustředění technologií.',
    scope: 'PRODUCT', confidence: 'CONFIRMED', source: CURRENT_SOURCE, validFrom: '2026-08-07', temporalStatus: 'CURRENT',
    constraints: ['Dům ani technologie nejsou bezúdržbové; vyžadují předepsané kontroly a servis.'],
    safeInterpretation: 'Každodenní péče může být přehlednější, aniž by se z toho vyvozovala bezúdržbovost domu.',
    factPoint: 'NÁVRH OMEZUJE ZÁKOUTÍ A SOUSTŘEDÍ TECHNOLOGIE.',
    interpretationPoint: 'KAŽDODENNÍ PÉČE JE PŘEHLEDNĚJŠÍ.',
    relatedTopics: ['údržba', 'provoz'],
  },
  {
    id: 'product-private-rooms',
    houseId: 'modern-4kk', subject: 'Soukromí v kompaktním domě', category: 'privacy',
    statement: 'Společenská část je otevřená, zatímco ložnice, dětský pokoj a pracovna zůstávají samostatnými místnostmi.',
    scope: 'PRODUCT', confidence: 'CONFIRMED', source: CURRENT_SOURCE, validFrom: '2026-08-07', temporalStatus: 'CURRENT',
    constraints: ['Číselné akustické parametry vyžadují měření nebo výpočet.'],
    safeInterpretation: 'Společný a soukromý režim domu lze vnímat jako oddělené funkční zóny.',
    factPoint: 'SPOLEČENSKÉ A SOUKROMÉ MÍSTNOSTI JSOU ODDĚLENÉ.',
    interpretationPoint: 'SPOLEČNÝ A SOUKROMÝ REŽIM MÁ SVÉ ZÓNY.',
    relatedTopics: ['soukromí', 'akustika'],
  },
  {
    id: 'dse-integrated-energy',
    houseId: 'modern-4kk', subject: 'Integrovaná energetická strategie', category: 'energy-concept',
    statement: 'DSE propojuje omezení potřeby energie, rekuperaci, účinné zdroje, fotovoltaiku, baterii a časovou optimalizaci.',
    scope: 'DSE_KNOW_HOW', confidence: 'CONFIRMED', source: CURRENT_SOURCE, validFrom: '2026-08-07', temporalStatus: 'CURRENT',
    constraints: ['Není to garance konkrétní energetické nebo finanční úspory.'],
    safeInterpretation: 'Energetiku je vhodné hodnotit jako spolupráci více systémů, nikoli jako výkon jediné technologie.',
    factPoint: 'ENERGETICKÝ KONCEPT SPOJUJE VÍCE SYSTÉMŮ.',
    interpretationPoint: 'ENERGETIKA SE POSUZUJE JAKO CELEK.',
    relatedTopics: ['energie', 'provozní-náklady', 'investice'],
  },
  {
    id: 'dse-energy-cost-guardrail',
    houseId: 'modern-4kk', subject: 'Individuální energetická ekonomika', category: 'guardrail',
    statement: 'Roční náklady, úspory a návratnost energetických technologií závisejí na konfiguraci, užívání, klimatu a cenách.',
    scope: 'DSE_KNOW_HOW', confidence: 'CONFIRMED', source: CURRENT_SOURCE, validFrom: '2026-08-07', temporalStatus: 'CURRENT',
    constraints: ['Bez konkrétních vstupů nelze garantovat účet za energie ani ROI FVE, baterie, AKIRETHERM, elektromobilu nebo Chytrého Spotu.'], relatedTopics: ['provozní-náklady', 'investice'],
  },
  {
    id: 'dse-grid-independence-guardrail',
    houseId: 'modern-4kk', subject: 'Roční bilance není trvalá soběstačnost', category: 'guardrail',
    statement: 'Kladná roční energetická bilance při odpovídající konfiguraci neznamená energetickou soběstačnost v každém okamžiku.',
    scope: 'DSE_KNOW_HOW', confidence: 'CONFIRMED', source: CURRENT_SOURCE, validFrom: '2026-08-07', temporalStatus: 'CURRENT',
    constraints: ['Neslibovat permanentní energetickou soběstačnost.'], relatedTopics: ['energie', 'fotovoltaika'],
  },
  {
    id: 'dse-fire-safety-guardrail',
    houseId: 'modern-4kk', subject: 'Požární bezpečnost', category: 'guardrail',
    statement: 'Požární bezpečnost se vysvětluje přes PBŘ stavby a certifikované vlastnosti materiálů.',
    scope: 'DSE_KNOW_HOW', confidence: 'CONFIRMED', source: CURRENT_SOURCE, validFrom: '2026-08-07', temporalStatus: 'CURRENT',
    constraints: ['Bez protokolu nebo klasifikace neuvádět konkrétní minutové hodnoty požární odolnosti.'], relatedTopics: ['kvalita', 'konstrukce'],
  },
  {
    id: 'dse-information-gaps',
    houseId: 'modern-4kk', subject: 'Hranice doložených informací', category: 'information-gap',
    statement: 'Zdroje nepodporují autonomní detailní odpovědi o aktuální ceně, přesné energetické bilanci, číselné požární a akustické klasifikaci, statických únosnostech ani aktuálních modelech technologií.',
    scope: 'DSE_KNOW_HOW', confidence: 'DOCUMENTED',
    source: { sourceId: 'conis-dse-bungalov-4kk-znalostni-databaze-v1', kind: 'TECHNICAL_DOCUMENTATION', label: 'Znalostní databáze DSE 4KK v1.0' },
    temporalStatus: 'CURRENT',
    constraints: ['Při těchto tématech přiznat hranici znalosti a vyžádat si aktuální podklad.'], relatedTopics: ['cena', 'požár', 'akustika', 'statika', 'technologie'],
  },
  {
    id: 'reference-krasne-pole-realization',
    houseId: 'modern-4kk', subject: 'Ostrava–Krásné Pole', category: 'reference-realization',
    statement: 'Bungalov 4KK byl v roce 2024 realizován v pilotním developerském projektu DSE v Ostravě–Krásném Poli.',
    scope: 'REFERENCE_PROJECT', confidence: 'DOCUMENTED',
    source: { sourceId: 'conis-dse-bungalov-4kk-znalostni-databaze-v1', kind: 'REFERENCE_EVIDENCE', label: 'Znalostní databáze DSE 4KK v1.0' },
    validFrom: '2024-01-01', temporalStatus: 'HISTORICAL',
    constraints: ['Dokládá realizaci konceptu, ne vlastnosti každé budoucí stavby MODERN 4KK.'], relatedTopics: ['reference', 'kvalita'],
  },
  {
    id: 'reference-krasne-pole-boundary',
    houseId: 'modern-4kk', subject: 'Hranice reference Krásné Pole', category: 'reference-guardrail',
    statement: 'Parcely, přípojky, ČOV, vsakování, retence, orientace a infrastruktura Krásného Pole jsou vlastnostmi konkrétní realizace.',
    scope: 'REFERENCE_PROJECT', confidence: 'DOCUMENTED',
    source: { sourceId: 'conis-dse-bungalov-4kk-znalostni-databaze-v1', kind: 'REFERENCE_EVIDENCE', label: 'Znalostní databáze DSE 4KK v1.0' },
    validFrom: '2024-01-01', temporalStatus: 'HISTORICAL',
    constraints: ['Tyto parametry se nesmějí přenášet do House Specification ani tvrdit jako standard typového domu.'], relatedTopics: ['pozemek', 'reference'],
  },
  {
    id: 'historical-atrea-concept',
    houseId: 'modern-4kk', subject: 'Historický koncept ATREA', category: 'technology-history',
    statement: 'Historický návrh pracoval se systémem ATREA, tepelným zásobníkem, zemním kolektorem, Loxone a krbovou vložkou.',
    scope: 'HISTORICAL', confidence: 'DOCUMENTED',
    source: { sourceId: 'conis-dse-bungalov-4kk-znalostni-databaze-v1', kind: 'HISTORICAL', label: 'Znalostní databáze DSE 4KK v1.0' },
    temporalStatus: 'HISTORICAL', constraints: ['Není automaticky současným standardem MODERN 4KK.'], relatedTopics: ['historie', 'energie'],
  },
  {
    id: 'historical-jablotron-concept',
    houseId: 'modern-4kk', subject: 'Historický koncept Jablotron LT', category: 'technology-history',
    statement: 'Historický návrh pracoval s aktivní rekuperací, aktivním bojlerem, Loxone a fotovoltaikou.',
    scope: 'HISTORICAL', confidence: 'DOCUMENTED',
    source: { sourceId: 'conis-dse-bungalov-4kk-znalostni-databaze-v1', kind: 'HISTORICAL', label: 'Znalostní databáze DSE 4KK v1.0' },
    temporalStatus: 'HISTORICAL', constraints: ['Není automaticky současným standardem MODERN 4KK.'], relatedTopics: ['historie', 'energie'],
  },
  {
    id: 'customer-evidence-information-needs',
    houseId: 'modern-4kk', subject: 'Historické rozhodovací evidence', category: 'customer-evidence',
    statement: 'Historická klientská data ukazují zájem o dlouhodobé náklady, retenci vody, technologie a srovnání stavebních řešení.',
    scope: 'CUSTOMER_EVIDENCE', confidence: 'DOCUMENTED',
    source: { sourceId: 'conis-dse-bungalov-4kk-znalostni-databaze-v1', kind: 'HISTORICAL', label: 'Znalostní databáze DSE 4KK v1.0' },
    temporalStatus: 'HISTORICAL', constraints: ['Jde o evidence rozhodovacích témat, nikoli o fyzické vlastnosti domu.'], relatedTopics: ['priorities', 'customer-evidence'],
  },
];

const PRIORITY_KNOWLEDGE_LINKS: Readonly<Record<HousePriority, readonly string[]>> = {
  LAND: ['product-optimized-house', 'product-garden-living', 'reference-krasne-pole-boundary'],
  LAYOUT: ['product-space-efficiency', 'product-layout-structure', 'product-technical-attic'],
  PRIVACY: ['product-private-rooms', 'product-garden-living'],
  ENERGY: ['dse-integrated-energy', 'dse-grid-independence-guardrail'],
  OPERATING_COSTS: ['dse-integrated-energy', 'dse-energy-cost-guardrail'],
  DESIGN: ['product-material-palette', 'product-garden-living'],
  QUALITY: ['product-construction-system', 'dse-fire-safety-guardrail', 'reference-krasne-pole-realization'],
  INVESTMENT: ['dse-energy-cost-guardrail', 'reference-krasne-pole-realization'],
  MAINTENANCE: ['product-maintenance-design', 'product-diffusion-open-envelope'],
  FLEXIBILITY: ['product-optimized-house', 'product-layout-structure'],
};

const FAQ_CONSTRAINTS: Readonly<Record<string, readonly string[]>> = {
  'land-01': ['Vhodnost vždy závisí na parametrech konkrétní parcely.'],
  'land-05': ['Zrcadlení může zhoršit optimalizaci světových stran.'],
  'land-08': ['Krásné Pole je reference, nikoli obecný požadavek typového domu.'],
  'land-09': ['ČOV se používá pouze tam, kde není dostupná kanalizace.'],
  'privacy-09': ['Bez konkrétního protokolu neslibovat číselnou neprůzvučnost.'],
  'energy-02': ['Skutečný provoz závisí na počasí a užívání.'],
  'energy-07': ['Roční bilance neznamená trvalou energetickou soběstačnost.'],
  'operating_costs-02': ['Bez konkrétních vstupů negarantovat roční účet za energie.'],
  'operating_costs-08': ['Jde o potenciál systému, ne garantovanou úsporu domácnosti.'],
  'operating_costs-09': ['Zdroj neobsahuje doložený servisní rozpočet.'],
  'quality-07': ['Bez PBŘ nebo protokolu neuvádět konkrétní minutové hodnoty požární odolnosti.'],
  'quality-10': ['Parametry konkrétní parcely se nesmějí zaměňovat s typovým domem.'],
  'investment-02': ['Návratnost vyžaduje konkrétní vstupy domácnosti a trhu.'],
  'investment-05': ['Zdroj nepodporuje garanci budoucí tržní ceny.'],
  'investment-06': ['Zdroj nepodporuje konkrétní slib zhodnocení nemovitosti.'],
  'investment-09': ['Konkrétní výsledek závisí na trhu a nastavení.'],
  'maintenance-01': ['Každý dům a zařízení vyžaduje předepsaný servis.'],
  'flexibility-01': ['Rozsáhlé změny mohou ztratit výhody optimalizovaného celku.'],
  'flexibility-05': ['Aktuální Knowledge Base rozlišuje referenční a historické konfigurace.'],
  'flexibility-09': ['ČOV není standardem tam, kde je dostupná kanalizace.'],
};

export const MODERN_4KK_PRIORITY_FAQ: readonly HousePriorityFaqItem[] =
  MODERN_4KK_PRIORITY_FAQ_SOURCE.map((item) => ({
    ...item,
    knowledgeAtomIds: PRIORITY_KNOWLEDGE_LINKS[item.priority],
    constraints: FAQ_CONSTRAINTS[item.id] ?? [],
  }));
