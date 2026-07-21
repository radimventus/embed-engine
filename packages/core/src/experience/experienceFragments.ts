import type {
  Experience,
  ExperienceAction,
  ExperienceConcern,
  ExperienceConfidence,
  ExperienceEvidence,
} from "./Experience";
import type { ExperienceFragment } from "./ExperienceFragment";
import type { PriorityId } from "./PrioritySelection";

function evidence(
  id: string,
  title: string,
  description: string,
): ExperienceEvidence {
  return Object.freeze({ id, title, description });
}

function concern(
  id: string,
  title: string,
  description: string,
  severity: ExperienceConcern["severity"],
): ExperienceConcern {
  return Object.freeze({ id, title, description, severity });
}

function confidence(
  level: ExperienceConfidence["level"],
  score: number,
  explanation: string,
): ExperienceConfidence {
  return Object.freeze({ level, score, explanation });
}

function action(
  id: string,
  label: string,
  type: ExperienceAction["type"],
  intent: ExperienceAction["intent"],
): ExperienceAction {
  return Object.freeze({ id, label, type, intent });
}

function fragment(
  id: string,
  appliesTo: readonly PriorityId[],
  build: () => Partial<Experience>,
): ExperienceFragment {
  return Object.freeze({ id, appliesTo, build });
}

/** Deterministic precedence when multiple mapped priorities are selected. */
export const FRAGMENT_LENS_ORDER: readonly PriorityId[] = Object.freeze([
  "layout",
  "investment",
  "design",
  "energy",
]);

export const LENS_KEY_BY_PRIORITY: Readonly<
  Partial<Record<PriorityId, string>>
> = Object.freeze({
  layout: "family",
  investment: "investment",
  design: "design",
  energy: "sustainability",
});

/**
 * Baseline fragments use empty appliesTo — selected when no mapped priority is active.
 * User-facing copy is Czech (MVP localization).
 */
export const EXPERIENCE_FRAGMENTS: readonly ExperienceFragment[] = Object.freeze([
  fragment("family.narrative", ["layout"], () =>
    Object.freeze({
      title: "Interpretace pro rodinné bydlení",
      summary:
        "Objekt se čte přes každodenní život: zóny, soukromí mezi místnostmi a to, jak dispozice podporuje domácnost v čase.",
      focus: Object.freeze(["Dispozice", "Soukromí", "Flexibilita"]),
      recommendations: Object.freeze([
        "Projděte denní a noční zónu v tomto pořadí",
        "Před závazkem k dispozici potvrďte tvar domácnosti",
      ]),
    }),
  ),
  fragment("family.evidence", ["layout"], () =>
    Object.freeze({
      evidence: Object.freeze([
        evidence(
          "family.bedrooms",
          "Čtyři ložnice",
          "Dostatek soukromých pokojů pro rostoucí domácnost bez nuceného sdílení.",
        ),
        evidence(
          "family.garden",
          "Bezpečná soukromá zahrada",
          "Uzavřený venkovní prostor podporuje děti i klidné večerní využití.",
        ),
        evidence(
          "family.bathrooms",
          "Dvě koupelny",
          "Ranní rutiny mohou běžet paralelně místo soupeření o jednu koupelnu.",
        ),
      ]),
    }),
  ),
  fragment("family.concerns", ["layout"], () =>
    Object.freeze({
      concerns: Object.freeze([
        concern(
          "family.upper-floor",
          "Dětský pokoj v patře",
          "Noční zóna nahoře znamená schody při každém usínání i noční rutině.",
          "medium",
        ),
        concern(
          "family.storage",
          "Menší úložný prostor",
          "Vestavěné úložné prostory jsou omezené vůči plnému inventáři rodiny.",
          "low",
        ),
      ]),
    }),
  ),
  fragment("family.confidence", ["layout"], () =>
    Object.freeze({
      confidence: confidence(
        "high",
        92,
        "Objekt silně odpovídá vybraným prioritám.",
      ),
    }),
  ),
  fragment("family.actions", ["layout"], () =>
    Object.freeze({
      actions: Object.freeze([
        action("family.viewing", "Naplánovat prohlídku", "primary", "explore"),
        action(
          "family.schools",
          "Prozkoumat okolní školy",
          "secondary",
          "explore",
        ),
        action(
          "family.compare",
          "Porovnat s podobnými domy",
          "secondary",
          "compare",
        ),
      ]),
    }),
  ),

  fragment("investment.narrative", ["investment"], () =>
    Object.freeze({
      title: "Investiční interpretace",
      summary:
        "Objekt se čte přes držení hodnoty: náklady vlastnictví, dlouhodobou flexibilitu a to, co zachovává srozumitelnost při dalším prodeji.",
      focus: Object.freeze(["Investice", "Provozní náklady", "Kvalita"]),
      recommendations: Object.freeze([
        "Porovnejte provozní náklady s investiční tezí",
        "Ověřte, které volby dispozice hodnotu uzamykají nebo zachovávají",
      ]),
    }),
  ),
  fragment("investment.evidence", ["investment"], () =>
    Object.freeze({
      evidence: Object.freeze([
        evidence(
          "investment.opex",
          "Nízké provozní náklady",
          "Efektivní systémy chrání výnos před tlakem rostoucích energií.",
        ),
        evidence(
          "investment.rental",
          "Silný nájemní potenciál",
          "Dispozice a lokalita podporují poptávku dlouhodobých nájemců.",
        ),
        evidence(
          "investment.location",
          "Atraktivní lokalita",
          "Kontext místa podporuje likviditu, pokud se doba držení zkrátí.",
        ),
      ]),
    }),
  ),
  fragment("investment.concerns", ["investment"], () =>
    Object.freeze({
      concerns: Object.freeze([
        concern(
          "investment.price",
          "Vyšší kupní cena",
          "Vstupní cena je nad místním mediánem a napíná počáteční kapitál.",
          "high",
        ),
        concern(
          "investment.roi",
          "Delší návratnost",
          "Návratnost předpokládá delší dobu držení, než se výnos stabilizuje.",
          "medium",
        ),
      ]),
    }),
  ),
  fragment("investment.confidence", ["investment"], () =>
    Object.freeze({
      confidence: confidence(
        "medium",
        76,
        "Většina investičních indikátorů je pozitivní.",
      ),
    }),
  ),
  fragment("investment.actions", ["investment"], () =>
    Object.freeze({
      actions: Object.freeze([
        action("investment.roi", "Spočítat návratnost", "primary", "calculate"),
        action(
          "investment.opex",
          "Porovnat provozní náklady",
          "secondary",
          "compare",
        ),
        action(
          "investment.advisor",
          "Kontaktovat poradce",
          "secondary",
          "contact",
        ),
      ]),
    }),
  ),

  fragment("design.narrative", ["design"], () =>
    Object.freeze({
      title: "Designová interpretace",
      summary:
        "Objekt se čte přes materiál a prostorový výraz: soudržnost designového jazyka, kvalitu povrchů a to, jak pozemek rámuje formu.",
      focus: Object.freeze(["Design", "Kvalita", "Pozemek"]),
      recommendations: Object.freeze([
        "Prověřte soudržnost designu místnost po místnosti",
        "Oddělte estetickou preferenci od vhodnosti dispozice",
      ]),
    }),
  ),
  fragment("design.evidence", ["design"], () =>
    Object.freeze({
      evidence: Object.freeze([
        evidence(
          "design.materials",
          "Prémiové materiály",
          "Kvalita povrchů nese architektonický záměr i v každodenním užívání.",
        ),
        evidence(
          "design.open-living",
          "Otevřený obytný prostor",
          "Hlavní obytný objem působí jako jeden komponovaný prostorový gestus.",
        ),
        evidence(
          "design.details",
          "Architektonické detaily",
          "Hrany, otvory a přechody posilují záměrný designový jazyk.",
        ),
      ]),
    }),
  ),
  fragment("design.concerns", ["design"], () =>
    Object.freeze({
      concerns: Object.freeze([
        concern(
          "design.storage",
          "Minimální úložné prostory",
          "Vizuální čistota znamená méně skrytých úložných ploch.",
          "medium",
        ),
        concern(
          "design.glazing",
          "Velké prosklené plochy vyžadují údržbu",
          "Rozsáhlé sklo potřebuje pravidelné čištění a sezónní kontroly výkonu.",
          "low",
        ),
      ]),
    }),
  ),
  fragment("design.confidence", ["design"], () =>
    Object.freeze({
      confidence: confidence(
        "high",
        88,
        "Architektonická kvalita konzistentně podporuje tuto interpretaci.",
      ),
    }),
  ),
  fragment("design.actions", ["design"], () =>
    Object.freeze({
      actions: Object.freeze([
        action(
          "design.gallery",
          "Prohlédnout architektonickou galerii",
          "primary",
          "explore",
        ),
        action("design.materials", "Prozkoumat materiály", "secondary", "explore"),
      ]),
    }),
  ),

  fragment("sustainability.narrative", ["energy"], () =>
    Object.freeze({
      title: "Udržitelnostní interpretace",
      summary:
        "Objekt se čte přes energii a údržbu: efektivitu, provozní zátěž a to, jak údržba formuje dlouhodobé náklady bydlení.",
      focus: Object.freeze(["Energie", "Provozní náklady", "Údržba"]),
      recommendations: Object.freeze([
        "Prověřte energetické systémy dříve než emocionální fit",
        "Zvažte zátěž údržby vůči úsporám provozních nákladů",
      ]),
    }),
  ),
  fragment("sustainability.evidence", ["energy"], () =>
    Object.freeze({
      evidence: Object.freeze([
        evidence(
          "sustainability.envelope",
          "Energeticky účinná obálka",
          "Výkon konstrukce snižuje tepelné ztráty dříve, než aktivní systémy pracují více.",
        ),
        evidence(
          "sustainability.heat-pump",
          "Tepelné čerpadlo",
          "Primární vytápění je dimenzované na efektivní nízkoteplotní provoz.",
        ),
        evidence(
          "sustainability.solar",
          "Střecha připravená na solár",
          "Geometrie střechy ponechává jasnou cestu pro budoucí výrobu bez přestaveb.",
        ),
      ]),
    }),
  ),
  fragment("sustainability.concerns", ["energy"], () =>
    Object.freeze({
      concerns: Object.freeze([
        concern(
          "sustainability.solar-not-included",
          "Solární instalace není součástí",
          "Kapacita výroby je připravená, ale panely nejsou v základní dodávce.",
          "medium",
        ),
        concern(
          "sustainability.rainwater",
          "Dešťová voda je volitelná",
          "Opětovné využití vody závisí na volitelném balíčku, ne na výchozí instalaci.",
          "low",
        ),
      ]),
    }),
  ),
  fragment("sustainability.confidence", ["energy"], () =>
    Object.freeze({
      confidence: confidence(
        "medium",
        71,
        "Energetické prvky jsou přítomné, ale ne kompletní.",
      ),
    }),
  ),
  fragment("sustainability.actions", ["energy"], () =>
    Object.freeze({
      actions: Object.freeze([
        action(
          "sustainability.energy",
          "Projít energetické detaily",
          "primary",
          "explore",
        ),
        action(
          "sustainability.opex",
          "Spočítat provozní náklady",
          "secondary",
          "calculate",
        ),
      ]),
    }),
  ),

  fragment("baseline.narrative", [], () =>
    Object.freeze({
      title: "Základní interpretace objektu",
      summary:
        "Vyberte priority a otevřete rozhodovací perspektivu. Objekt zůstává stejný; mění se jen interpretace.",
      focus: Object.freeze(["Dispozice", "Interpretace"]),
      recommendations: Object.freeze([
        "Vyberte alespoň jednu prioritu a otevřete interpretaci",
      ]),
    }),
  ),
  fragment("baseline.evidence", [], () =>
    Object.freeze({
      evidence: Object.freeze([
        evidence(
          "baseline.select",
          "Perspektiva ještě není vybraná",
          "Důkazy se objeví, jakmile priorita otevře interpretaci tohoto objektu.",
        ),
        evidence(
          "baseline.object-stable",
          "Objekt zůstává pevný",
          "Změna priorit mění jen interpretaci — nikdy samotný objekt.",
        ),
      ]),
    }),
  ),
  fragment("baseline.concerns", [], () =>
    Object.freeze({
      concerns: Object.freeze([
        concern(
          "baseline.open-lens",
          "Interpretace není otevřená",
          "Upozornění se objeví poté, co priorita vybere rozhodovací perspektivu.",
          "low",
        ),
      ]),
    }),
  ),
  fragment("baseline.confidence", [], () =>
    Object.freeze({
      confidence: confidence(
        "low",
        40,
        "Žádná prioritní perspektiva ještě není aktivní; jistota vzroste po otevření interpretace.",
      ),
    }),
  ),
  fragment("baseline.actions", [], () =>
    Object.freeze({
      actions: Object.freeze([
        action(
          "baseline.select-priority",
          "Vybrat prioritní perspektivu",
          "primary",
          "explore",
        ),
        action(
          "baseline.compare-later",
          "Porovnat po otevření interpretace",
          "secondary",
          "compare",
        ),
      ]),
    }),
  ),
]);

export function resolveActiveLens(
  selected: readonly PriorityId[],
): PriorityId | null {
  const selectedSet = new Set(selected);

  for (const priorityId of FRAGMENT_LENS_ORDER) {
    if (selectedSet.has(priorityId)) {
      return priorityId;
    }
  }

  return null;
}

export function selectExperienceFragments(
  activeLens: PriorityId | null,
): readonly ExperienceFragment[] {
  if (activeLens === null) {
    return EXPERIENCE_FRAGMENTS.filter(
      (entry) => entry.appliesTo.length === 0,
    );
  }

  return EXPERIENCE_FRAGMENTS.filter((entry) =>
    entry.appliesTo.includes(activeLens),
  );
}

export function mergeExperiencePartials(
  parts: readonly Partial<Experience>[],
): Omit<Experience, "id"> {
  let title: string | undefined;
  let summary: string | undefined;
  let focus: readonly string[] | undefined;
  let recommendations: readonly string[] | undefined;
  let evidence: Experience["evidence"] | undefined;
  let concerns: Experience["concerns"] | undefined;
  let confidence: Experience["confidence"] | undefined;
  let actions: Experience["actions"] | undefined;

  for (const part of parts) {
    if (part.title !== undefined) title = part.title;
    if (part.summary !== undefined) summary = part.summary;
    if (part.focus !== undefined) focus = part.focus;
    if (part.recommendations !== undefined) {
      recommendations = part.recommendations;
    }
    if (part.evidence !== undefined) evidence = part.evidence;
    if (part.concerns !== undefined) concerns = part.concerns;
    if (part.confidence !== undefined) confidence = part.confidence;
    if (part.actions !== undefined) actions = part.actions;
  }

  if (
    title === undefined ||
    summary === undefined ||
    focus === undefined ||
    recommendations === undefined ||
    evidence === undefined ||
    concerns === undefined ||
    confidence === undefined ||
    actions === undefined
  ) {
    throw new Error("Experience fragments did not assemble a complete Experience");
  }

  return Object.freeze({
    title,
    summary,
    focus,
    recommendations,
    evidence,
    concerns,
    confidence,
    actions,
  });
}
