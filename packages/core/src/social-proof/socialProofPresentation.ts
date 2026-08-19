import {
  customerFacingHouseForm,
  customerFacingPercentage,
  customerFacingPersonCount,
  customerFacingPriorityForm,
  customerFacingTimeWindowForm,
  selectPersonPredicate,
  type CustomerFacingPersonPredicateForms,
} from "../customer-language/czechRealization";
import type { SocialProofSignal } from "./socialProofSignal";
import {
  derivedSocialProofPercentage,
  type SocialProofMetric,
} from "./socialProofCatalog";

export type SocialProofPresentationIcon = "viewing" | "saved" | "inquiry";

export type SocialProofPresentation = {
  readonly id: string;
  readonly icon: SocialProofPresentationIcon;
  readonly value: string;
  readonly text: string;
};

function countPresentation(
  signal: Extract<SocialProofSignal, { readonly count: number }>,
  forms: {
    readonly singular: string;
    readonly plural: string;
    readonly numericPlural: string;
  },
): Pick<SocialProofPresentation, "value" | "text"> | null {
  const person = customerFacingPersonCount(signal.count);
  const timeWindow = customerFacingTimeWindowForm(signal.window);
  if (person === null || timeWindow === null) {
    return null;
  }

  return Object.freeze({
    value: String(person.value),
    text: `${person.noun} ${selectPersonPredicate(person, forms)} ${timeWindow}.`,
  });
}

/**
 * Resolves a normalized Social Proof fact into the shared customer-facing
 * `ICON | VALUE | TEXT` presentation shape. No raw identity or prose from an
 * analytics producer is accepted.
 */
export function presentSocialProofSignal(
  signal: SocialProofSignal,
): SocialProofPresentation | null {
  switch (signal.kind) {
    case "LIVE": {
      const person = customerFacingPersonCount(signal.count);
      const timeWindow = customerFacingTimeWindowForm(signal.window);
      const house = customerFacingHouseForm("CURRENT_HOUSE", "ACCUSATIVE");
      if (person === null || timeWindow === null || house === null) {
        return null;
      }
      return Object.freeze({
        id: "live",
        icon: "viewing",
        value: String(person.value),
        text: `${person.noun} ${selectPersonPredicate(person, {
          singular: `${timeWindow} prohlíží ${house}`,
          plural: `${timeWindow} prohlížejí ${house}`,
          numericPlural: `${timeWindow} prohlíží ${house}`,
        })}.`,
      });
    }
    case "SAVE": {
      const house = customerFacingHouseForm("CURRENT_HOUSE", "ACCUSATIVE");
      if (house === null) return null;
      const presentation = countPresentation(signal, {
        singular: `si ${house} uložil`,
        plural: `si ${house} uložili`,
        numericPlural: `si ${house} uložilo`,
      });
      return presentation === null
        ? null
        : Object.freeze({ id: "save", icon: "saved", ...presentation });
    }
    case "RETURN": {
      const house = customerFacingHouseForm("CURRENT_HOUSE", "DATIVE");
      if (house === null) return null;
      const presentation = countPresentation(signal, {
        singular: `se k ${house} vrátil`,
        plural: `se k ${house} vrátili`,
        numericPlural: `se k ${house} vrátilo`,
      });
      return presentation === null
        ? null
        : Object.freeze({ id: "return", icon: "viewing", ...presentation });
    }
    case "TOUR_COMPLETION": {
      const presentation = countPresentation(signal, {
        singular: "dokončil prohlídku a přešel k prioritám",
        plural: "dokončili prohlídku a přešli k prioritám",
        numericPlural: "dokončilo prohlídku a přešlo k prioritám",
      });
      return presentation === null
        ? null
        : Object.freeze({
            id: "tour-completion",
            icon: "viewing",
            ...presentation,
          });
    }
    case "PRIORITY_COMPLETION": {
      const presentation = countPresentation(signal, {
        singular: "dokončil nastavení priorit",
        plural: "dokončili nastavení priorit",
        numericPlural: "dokončilo nastavení priorit",
      });
      return presentation === null
        ? null
        : Object.freeze({
            id: "priority-completion",
            icon: "inquiry",
            ...presentation,
          });
    }
    case "PRIORITY_PREFERENCE": {
      const percentage = customerFacingPercentage(signal.percentage);
      const priority = customerFacingPriorityForm(signal.priorityId);
      const timeWindow = customerFacingTimeWindowForm(signal.window);
      if (percentage === null || priority === null || timeWindow === null) {
        return null;
      }
      return Object.freeze({
        id: `priority-preference:${signal.priorityId}`,
        icon: "inquiry",
        value: percentage.text,
        text: `${percentage.personNoun} s dokončeným nastavením priorit označuje ${priority.accusative} jako důležitou prioritu ${timeWindow}.`,
      });
    }
  }
}

/** Presents the canonical COUNT/SHARE catalog without accepting raw producer copy. */
export function presentSocialProofMetric(
  metric: SocialProofMetric,
): SocialProofPresentation | null {
  const count = customerFacingPersonCount(metric.numerator);
  const percentage = derivedSocialProofPercentage(metric);
  const priority = metric.priorityId === undefined
    ? null
    : customerFacingPriorityForm(metric.priorityId);
  const countForms: Partial<Record<SocialProofMetric["topic"], CustomerFacingPersonPredicateForms>> = {
    LAND_VALIDATION: { singular: "požádal o ověření tohoto domu na svém pozemku", plural: "požádali o ověření tohoto domu na svém pozemku", numericPlural: "požádalo o ověření tohoto domu na svém pozemku" },
    LAND_SEARCH: { singular: "požádal o pomoc s hledáním vhodného pozemku", plural: "požádali o pomoc s hledáním vhodného pozemku", numericPlural: "požádalo o pomoc s hledáním vhodného pozemku" },
    PDF: { singular: "si nechal poslat informace o tomto domu v PDF", plural: "si nechali poslat informace o tomto domu v PDF", numericPlural: "si nechalo poslat informace o tomto domu v PDF" },
    RETURN_TO_TOUR: { singular: "se po nastavení priorit vrátil k prohlídce domu", plural: "se po nastavení priorit vrátili k prohlídce domu", numericPlural: "se po nastavení priorit vrátilo k prohlídce domu" },
    OWN_QUESTION: { singular: "položil vlastní otázku k tomuto domu", plural: "položili vlastní otázku k tomuto domu", numericPlural: "položilo vlastní otázku k tomuto domu" },
  };
  if (metric.group === "COUNT") {
    const forms = countForms[metric.topic];
    if (count === null || forms === undefined) return null;
    return Object.freeze({ id: `count:${metric.topic}`, icon: "inquiry", value: String(count.value), text: `${count.noun} ${selectPersonPredicate(count, forms)}.` });
  }
  if (metric.group === "SHARE" && percentage !== null) {
    const text = metric.topic === "TOP_PRIORITY" && priority !== null
      ? `zájemců označilo ${priority.accusative} za prioritu.`
      : ({
          RETURN_SHARE: "zájemců se po nastavení priorit vrátilo k prohlídce domu.",
          SET_PRIORITIES: "zájemců si nastavilo vlastní priority.",
          FAQ: "zájemců využilo odpovědi na časté otázky.",
          CHAT: "zájemců pokračovalo k osobnímu rozhovoru v chatu.",
        } as Partial<Record<SocialProofMetric["topic"], string>>)[metric.topic];
    return text === undefined ? null : Object.freeze({ id: `share:${metric.topic}:${metric.priorityId ?? ""}`, icon: "inquiry", value: `${percentage} %`, text });
  }
  return null;
}
