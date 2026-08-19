import {
  customerFacingHouseForm,
  customerFacingPercentage,
  customerFacingPersonCount,
  customerFacingPriorityForm,
  customerFacingTimeWindowForm,
  selectPersonPredicate,
} from "../customer-language/czechRealization";
import type { SocialProofSignal } from "./socialProofSignal";

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
