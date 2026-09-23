export type PriorityFitResultType =
  'rating' | 'verify' | 'information' | 'knowledge-gap';

export type PriorityFitContractEntry = {
  readonly priorityId: string;
  readonly answerId: string;
  readonly answer: string;
  readonly resultType: PriorityFitResultType;
  readonly rating?: 1 | 2 | 3 | 4 | 5;
  readonly why: string;
  readonly evidenceFactIds: readonly string[];
  readonly missingEvidence?: string;
  readonly roomId: string;
};

export type PriorityLevelFitContractEntry = Pick<
  PriorityFitContractEntry,
  'priorityId' | 'resultType' | 'rating' | 'why' | 'evidenceFactIds'
>;

const entry = (value: PriorityFitContractEntry): PriorityFitContractEntry =>
  Object.freeze(value);

/** Product-owner approved BUNGALOV 4KK fit contract. Facts remain canonical authority. */
export const BUNGALOV_4KK_FIT_CONTRACT: readonly PriorityFitContractEntry[] =
  Object.freeze([
    entry({
      priorityId: 'plot',
      answerId: 'orientation',
      answer: 'Orientace světových stran',
      resultType: 'verify',
      why: 'Shodu lze posoudit až nad orientací a osazením konkrétní parcely.',
      evidenceFactIds: ['kb04-row-43', 'kb04-row-50'],
      missingEvidence: 'Orientace konkrétní parcely a možné osazení domu.',
      roomId: 'exterior',
    }),
    entry({
      priorityId: 'plot',
      answerId: 'access-parking',
      answer: 'Příjezd a garážové stání',
      resultType: 'verify',
      why: 'Řešení příjezdu a parkování závisí na konkrétní parcele.',
      evidenceFactIds: [
        'kb04-row-43',
        'kb04-row-47',
        'kb04-row-62',
        'kb04-row-120',
      ],
      missingEvidence:
        'Směr příjezdu, rozměry parcely a požadované řešení parkování.',
      roomId: 'exterior',
    }),
    entry({
      priorityId: 'plot',
      answerId: 'garden-terrace',
      answer: 'Krásná zahrada s terasou',
      resultType: 'verify',
      why: 'Dům se zahradou komunikuje, výslednou podobu ale určí konkrétní parcela.',
      evidenceFactIds: ['kb04-row-537', 'kb04-row-604'],
      missingEvidence: 'Konkrétní parcela, okolní zástavba a návrh zahrady.',
      roomId: 'exterior',
    }),
    entry({
      priorityId: 'layout',
      answerId: 'family-space',
      answer: 'Společný prostor pro rodinu',
      resultType: 'rating',
      rating: 5,
      why: 'Kuchyně, jídelna a obývací pokoj tvoří jedno společné centrum s návazností na terasu a zahradu.',
      evidenceFactIds: ['kb04-row-88', 'kb04-row-105', 'kb04-row-537'],
      roomId: 'living-room',
    }),
    entry({
      priorityId: 'layout',
      answerId: 'privacy',
      answer: 'Dostatek soukromí',
      resultType: 'rating',
      rating: 5,
      why: 'Společná a klidová část jsou oddělené a jednotlivé pokoje nejsou průchozí.',
      evidenceFactIds: ['kb04-row-90', 'kb04-row-560'],
      roomId: 'bedroom',
    }),
    entry({
      priorityId: 'layout',
      answerId: 'flexibility',
      answer: 'Možnost místnosti časem měnit',
      resultType: 'rating',
      rating: 4,
      why: 'Velikost a využití části pokojů lze měnit posunem příček, dispozice ale není libovolně variabilní.',
      evidenceFactIds: ['kb04-row-102', 'kb04-row-130'],
      roomId: 'office',
    }),
    entry({
      priorityId: 'comfort',
      answerId: 'heating-cooling',
      answer: 'Pohodlné vytápění + klimatizace',
      resultType: 'rating',
      rating: 5,
      why: 'Dům kombinuje vytápění a chlazení pro komfort v průběhu roku.',
      evidenceFactIds: [
        'kb04-row-332',
        'kb04-row-383',
        'kb04-row-388',
        'kb04-row-389',
      ],
      roomId: 'living-room',
    }),
    entry({
      priorityId: 'comfort',
      answerId: 'fresh-air',
      answer: 'Zdravý a čerstvý vzduch',
      resultType: 'rating',
      rating: 5,
      why: 'Řízené větrání zajišťuje průběžnou výměnu vzduchu.',
      evidenceFactIds: [
        'kb04-row-386',
        'kb04-row-387',
        'kb04-row-392',
        'kb04-row-482',
      ],
      roomId: 'bedroom',
    }),
    entry({
      priorityId: 'comfort',
      answerId: 'light-view',
      answer: 'Světlo a výhled přes velká okna',
      resultType: 'rating',
      rating: 5,
      why: 'Velké prosklení přivádí světlo do hlavního obytného prostoru a otevírá jej směrem ven.',
      evidenceFactIds: ['kb04-row-14', 'kb04-row-50', 'kb04-row-586'],
      roomId: 'living-room',
    }),
    entry({
      priorityId: 'design',
      answerId: 'timeless',
      answer: 'Nadčasový vzhled',
      resultType: 'rating',
      rating: 4,
      why: 'Jednoduchá hmota a střídmý výraz nejsou založené na množství dekorativních prvků.',
      evidenceFactIds: ['kb04-row-116', 'kb04-row-296'],
      roomId: 'exterior',
    }),
    entry({
      priorityId: 'design',
      answerId: 'character',
      answer: 'Výrazný charakter domu',
      resultType: 'rating',
      rating: 5,
      why: 'Podlouhlá hmota, sedlová střecha, velké prosklení, terasa a kontrast materiálů dávají domu jasnou identitu.',
      evidenceFactIds: ['kb04-row-121', 'kb04-row-125', 'kb04-row-126'],
      roomId: 'exterior',
    }),
    entry({
      priorityId: 'design',
      answerId: 'materials',
      answer: 'Umírněnost a přírodní materiály',
      resultType: 'rating',
      rating: 5,
      why: 'Jednoduchou architekturu doplňuje dřevo a materiálově střídmé řešení domu.',
      evidenceFactIds: [
        'kb04-row-112',
        'kb04-row-116',
        'kb04-row-235',
        'kb04-row-296',
      ],
      roomId: 'exterior',
    }),
    entry({
      priorityId: 'energy',
      answerId: 'low-cost',
      answer: 'Nízké provozní náklady',
      resultType: 'information',
      why: 'Energetické parametry jsou doložené, skutečné náklady ale závisejí na způsobu užívání.',
      evidenceFactIds: [
        'kb04-row-319',
        'kb04-row-638',
        'kb04-row-650',
        'kb04-row-651',
      ],
      missingEvidence:
        'Skutečné provozní náklady pro definovaný způsob užívání.',
      roomId: 'technical-room',
    }),
    entry({
      priorityId: 'energy',
      answerId: 'independence',
      answer: 'Maximální energetickou nezávislost',
      resultType: 'knowledge-gap',
      why: 'Míru energetické soběstačnosti je potřeba ověřit s prodejcem.',
      evidenceFactIds: ['kb04-row-647'],
      missingEvidence:
        'Zapojení sítě, akumulace, kapacita systému a doložená míra soběstačnosti.',
      roomId: 'technical-room',
    }),
    entry({
      priorityId: 'energy',
      answerId: 'smart-control',
      answer: 'Chytré řízení provozu',
      resultType: 'rating',
      rating: 5,
      why: 'Řízení technologií podporuje komfortní a jednoduchý provoz domu.',
      evidenceFactIds: ['kb04-row-369', 'kb04-row-482'],
      roomId: 'technical-room',
    }),
    entry({
      priorityId: 'realization',
      answerId: 'price-scope',
      answer: 'Garantovaná cena a rozsah',
      resultType: 'knowledge-gap',
      why: 'Pravidla garance ceny a závazný rozsah je potřeba ověřit s prodejcem.',
      evidenceFactIds: ['kb04-row-173', 'kb04-row-195'],
      missingEvidence:
        'Pravidla garance ceny, výluky a závazný rozsah nabídky.',
      roomId: 'exterior',
    }),
    entry({
      priorityId: 'realization',
      answerId: 'build-speed',
      answer: 'Rychlost výstavby',
      resultType: 'knowledge-gap',
      why: 'Konkrétní harmonogram výstavby je potřeba ověřit s prodejcem.',
      evidenceFactIds: [],
      missingEvidence:
        'Standardní doba výstavby, výchozí okamžik a podmínky termínu.',
      roomId: 'exterior',
    }),
    entry({
      priorityId: 'realization',
      answerId: 'customization',
      answer: 'Možnost individuálních úprav',
      resultType: 'rating',
      rating: 4,
      why: 'Některé dispoziční a konstrukční úpravy jsou možné, vždy ale v mezích konkrétního řešení domu.',
      evidenceFactIds: ['kb04-row-109', 'kb04-row-115', 'kb04-row-130'],
      roomId: 'office',
    }),
    entry({
      priorityId: 'quality',
      answerId: 'durability-warranty',
      answer: 'Dlouhá životnost a záruka',
      resultType: 'rating',
      rating: 4,
      why: 'Konstrukce má doloženou návrhovou životnost a dům má stanovenou záruční dobu.',
      evidenceFactIds: ['kb04-row-238', 'kb04-row-359', 'kb04-row-663'],
      roomId: 'exterior',
    }),
    entry({
      priorityId: 'quality',
      answerId: 'materials-technology',
      answer: 'Použité materiály a technologie',
      resultType: 'rating',
      rating: 5,
      why: 'Konstrukce, izolace, obálka i technologie tvoří konkrétně popsaný technický systém.',
      evidenceFactIds: [
        'kb04-row-235',
        'kb04-row-319',
        'kb04-row-344',
        'kb04-row-383',
      ],
      roomId: 'technical-room',
    }),
    entry({
      priorityId: 'quality',
      answerId: 'execution-detail',
      answer: 'Kontrola provedení a technické detaily',
      resultType: 'rating',
      rating: 5,
      why: 'Provedení konstrukcí a instalací se kontroluje a odchylky od projektu mají stanovený postup.',
      evidenceFactIds: [
        'kb04-row-169',
        'kb04-row-269',
        'kb04-row-272',
        'kb04-row-334',
      ],
      roomId: 'exterior',
    }),
    entry({
      priorityId: 'maintenance',
      answerId: 'low-effort',
      answer: 'Minimální údržba s nízkými náklady',
      resultType: 'information',
      why: 'Materiály omezují pravidelnou péči, přesné dlouhodobé náklady ale nejsou doložené.',
      evidenceFactIds: ['kb04-row-283', 'kb04-row-284', 'kb04-row-296'],
      missingEvidence:
        'Konkrétní servisní intervaly a dlouhodobé náklady údržby.',
      roomId: 'exterior',
    }),
    entry({
      priorityId: 'maintenance',
      answerId: 'full-service',
      answer: 'Pravidelný servis s plným komfortem',
      resultType: 'knowledge-gap',
      why: 'Rozsah pravidelného servisu je potřeba ověřit s prodejcem.',
      evidenceFactIds: ['kb04-row-379', 'kb04-row-398'],
      missingEvidence:
        'Servisní plán, rozsah služeb, intervaly a odpovědnost dodavatele.',
      roomId: 'technical-room',
    }),
    entry({
      priorityId: 'maintenance',
      answerId: 'self-service',
      answer: 'Možnost částečné údržby svépomocí',
      resultType: 'knowledge-gap',
      why: 'Možnosti údržby svépomocí je potřeba ověřit s prodejcem.',
      evidenceFactIds: ['kb04-row-283', 'kb04-row-398'],
      missingEvidence:
        'Seznam úkonů vhodných pro vlastníka a úkonů vyžadujících odborný servis.',
      roomId: 'technical-room',
    }),
  ]);

/** Product-owner approved house-level assessment; client intensity never changes it. */
export const BUNGALOV_4KK_PRIORITY_LEVEL_FIT_CONTRACT: readonly PriorityLevelFitContractEntry[] =
  Object.freeze([
    { priorityId: 'plot', resultType: 'verify', why: 'Dům má jasné nároky na orientaci, příjezd i vztah k zahradě; skutečnou shodu určí konkrétní parcela.', evidenceFactIds: ['kb04-row-43', 'kb04-row-50', 'kb04-row-537'] },
    { priorityId: 'layout', resultType: 'rating', rating: 5, why: 'Otevřený společný prostor, oddělená klidová část a částečně upravitelné pokoje dávají dispozici velmi dobrou funkční rovnováhu.', evidenceFactIds: ['kb04-row-88', 'kb04-row-90', 'kb04-row-102'] },
    { priorityId: 'comfort', resultType: 'rating', rating: 5, why: 'Vytápění a chlazení, řízené větrání i velké prosklení společně vytvářejí velmi dobré podmínky pro každodenní komfort.', evidenceFactIds: ['kb04-row-383', 'kb04-row-386', 'kb04-row-586'] },
    { priorityId: 'design', resultType: 'rating', rating: 5, why: 'Jednoduchá hmota, výrazné prosklení a střídmá kombinace materiálů dávají domu osobitý, ale umírněný charakter.', evidenceFactIds: ['kb04-row-116', 'kb04-row-121', 'kb04-row-296'] },
    { priorityId: 'energy', resultType: 'rating', rating: 5, why: 'Dům kombinuje velmi nízkou spotřebu s vlastní výrobou energie a chytrým řízením jejího využití, nákupu a prodeje.', evidenceFactIds: ['kb04-row-637', 'kb04-row-638', 'kb04-row-639', 'task120-vr4-energy-battery'] },
    { priorityId: 'realization', resultType: 'knowledge-gap', why: 'Možnosti individuálních úprav známe; cenu, garantovaný rozsah a dobu realizace je potřeba upřesnit s dodavatelem.', evidenceFactIds: ['kb04-row-109', 'kb04-row-115', 'kb04-row-130'] },
    { priorityId: 'quality', resultType: 'rating', rating: 5, why: 'Konstrukce, materiály, technologie i kontrola provedení jsou podrobně doložené; známá je také návrhová životnost a záruka.', evidenceFactIds: ['kb04-row-238', 'kb04-row-269', 'kb04-row-359', 'kb04-row-663'] },
    { priorityId: 'maintenance', resultType: 'rating', rating: 4, why: 'Technické řešení je záměrně jednoduché a většina technologií vyžaduje jen standardní nebo minimální servis; pravidelnou péči vyžadují především dřevěné prvky.', evidenceFactIds: ['kb04-row-283', 'kb04-row-295', 'kb04-row-398', 'task120-vr4-maintenance-system'] },
  ]);

export function priorityFitEntry(
  priorityId: string,
  answerId: string,
): PriorityFitContractEntry | null {
  return (
    BUNGALOV_4KK_FIT_CONTRACT.find(
      (item) => item.priorityId === priorityId && item.answerId === answerId,
    ) ?? null
  );
}
