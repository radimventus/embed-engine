/**
 * Closed Czech customer-language forms for controlled CONIS semantics.
 * This is deliberately not a general localization or inflection engine.
 */

export type PersonCountClass = "ONE" | "FEW" | "MANY";

export type PersonAgreementClass =
  | "SINGULAR"
  | "PLURAL"
  | "NUMERIC_PLURAL";

export type CustomerFacingPersonCount = {
  readonly value: number;
  readonly countClass: PersonCountClass;
  readonly noun: "člověk" | "lidé" | "lidí";
  readonly agreement: PersonAgreementClass;
};

export type CustomerFacingPersonPredicateForms = {
  readonly singular: string;
  readonly plural: string;
  readonly numericPlural: string;
};

const PERSON_FORMS: Readonly<
  Record<
    PersonCountClass,
    Pick<CustomerFacingPersonCount, "noun" | "agreement">
  >
> = Object.freeze({
  ONE: Object.freeze({ noun: "člověk", agreement: "SINGULAR" }),
  FEW: Object.freeze({ noun: "lidé", agreement: "PLURAL" }),
  MANY: Object.freeze({ noun: "lidí", agreement: "NUMERIC_PLURAL" }),
});

function isValidCount(value: number): boolean {
  return Number.isSafeInteger(value) && value > 0;
}

/**
 * Returns no form for invalid numbers so a caller can suppress a message.
 * The controlled rule intentionally has no modulo behavior.
 */
export function customerFacingPersonCount(
  value: number,
): CustomerFacingPersonCount | null {
  if (!isValidCount(value)) {
    return null;
  }

  const countClass: PersonCountClass =
    value === 1 ? "ONE" : value >= 2 && value <= 4 ? "FEW" : "MANY";
  const forms = PERSON_FORMS[countClass];

  return Object.freeze({
    value,
    countClass,
    noun: forms.noun,
    agreement: forms.agreement,
  });
}

/** Chooses a predicate form from a controlled person-count agreement class. */
export function selectPersonPredicate(
  person: CustomerFacingPersonCount,
  forms: CustomerFacingPersonPredicateForms,
): string {
  switch (person.agreement) {
    case "SINGULAR":
      return forms.singular;
    case "PLURAL":
      return forms.plural;
    case "NUMERIC_PLURAL":
      return forms.numericPlural;
  }
}

export type CustomerFacingPercentage = {
  readonly value: number;
  readonly text: string;
  readonly personNoun: "lidí";
  readonly agreement: "NUMERIC_PLURAL";
};

/** Formats a whole, non-negative percentage for controlled customer copy. */
export function customerFacingPercentage(
  value: number,
): CustomerFacingPercentage | null {
  if (!Number.isSafeInteger(value) || value < 0) {
    return null;
  }

  return Object.freeze({
    value,
    text: `${value} %`,
    personNoun: "lidí",
    agreement: "NUMERIC_PLURAL",
  });
}

export const CUSTOMER_FACING_PRIORITY_IDS = Object.freeze([
  "plot",
  "layout",
  "privacy",
  "design",
  "energy",
  "operating-costs",
  "quality",
  "maintenance",
] as const);

export type CustomerFacingPriorityId =
  (typeof CUSTOMER_FACING_PRIORITY_IDS)[number];

export type CustomerFacingPriorityForm = {
  readonly id: CustomerFacingPriorityId;
  readonly display: string;
  readonly accusative: string;
};

const PRIORITY_FORMS: Readonly<
  Record<CustomerFacingPriorityId, CustomerFacingPriorityForm>
> = Object.freeze({
  plot: Object.freeze({
    id: "plot",
    display: "Pozemek",
    accusative: "pozemek",
  }),
  layout: Object.freeze({
    id: "layout",
    display: "Dispozice",
    accusative: "dispozici",
  }),
  privacy: Object.freeze({
    id: "privacy",
    display: "Soukromí",
    accusative: "soukromí",
  }),
  design: Object.freeze({
    id: "design",
    display: "Design",
    accusative: "design",
  }),
  energy: Object.freeze({
    id: "energy",
    display: "Energie",
    accusative: "energii",
  }),
  "operating-costs": Object.freeze({
    id: "operating-costs",
    display: "Provozní náklady",
    accusative: "provozní náklady",
  }),
  quality: Object.freeze({
    id: "quality",
    display: "Kvalita",
    accusative: "kvalitu",
  }),
  maintenance: Object.freeze({
    id: "maintenance",
    display: "Údržba",
    accusative: "údržbu",
  }),
});

/**
 * Resolves only approved customer-facing Priority identities.
 * Unknown runtime/internal IDs intentionally have no visible fallback.
 */
export function customerFacingPriorityForm(
  priorityId: string,
): CustomerFacingPriorityForm | null {
  return PRIORITY_FORMS[priorityId as CustomerFacingPriorityId] ?? null;
}

export const CURRENT_HOUSE = "CURRENT_HOUSE" as const;
export const EXPLICIT_PRODUCT = "EXPLICIT_PRODUCT" as const;
export const CUSTOMER_FACING_EXPLICIT_PRODUCT_NAME = "Bungalov 4KK" as const;

export type CustomerFacingHouseReference = typeof CURRENT_HOUSE;
export type CustomerFacingHouseCase = "ACCUSATIVE" | "DATIVE";
export type CustomerFacingHouseIdentity =
  | CustomerFacingHouseReference
  | typeof EXPLICIT_PRODUCT;
export type CustomerFacingHouseIdentityForm =
  | CustomerFacingHouseCase
  | "DISPLAY";

const CURRENT_HOUSE_FORMS: Readonly<
  Record<CustomerFacingHouseCase, string>
> = Object.freeze({
  ACCUSATIVE: "tento dům",
  DATIVE: "tomuto domu",
});

/**
 * Resolves controlled customer-facing house identity without exposing a raw
 * implementation identity, slug, or database key.
 */
export function customerFacingHouseIdentityForm(
  identity: string,
  form: string,
): string | null {
  if (identity === EXPLICIT_PRODUCT) {
    return form === "DISPLAY" ? CUSTOMER_FACING_EXPLICIT_PRODUCT_NAME : null;
  }

  if (identity !== CURRENT_HOUSE) {
    return null;
  }

  return CURRENT_HOUSE_FORMS[form as CustomerFacingHouseCase] ?? null;
}

/** Resolves controlled contextual house wording without inspecting house IDs. */
export function customerFacingHouseForm(
  reference: string,
  grammaticalCase: string,
): string | null {
  return customerFacingHouseIdentityForm(reference, grammaticalCase);
}

export const CUSTOMER_FACING_TIME_WINDOWS = Object.freeze([
  "LIVE",
  "ROLLING_7_DAYS",
  "ROLLING_WEEK",
  "ROLLING_MONTH",
  "NO_EXPLICIT_WINDOW",
] as const);

export type CustomerFacingTimeWindow =
  (typeof CUSTOMER_FACING_TIME_WINDOWS)[number];

const TIME_WINDOW_FORMS: Readonly<
  Record<CustomerFacingTimeWindow, string | null>
> = Object.freeze({
  LIVE: "právě",
  ROLLING_7_DAYS: "za posledních 7 dní",
  ROLLING_WEEK: "za poslední týden",
  ROLLING_MONTH: "za poslední měsíc",
  NO_EXPLICIT_WINDOW: null,
});

/**
 * Returns null for an absent phrase and for unknown time concepts.
 * Callers must not render unknown analytics values.
 */
export function customerFacingTimeWindowForm(value: string): string | null {
  return TIME_WINDOW_FORMS[value as CustomerFacingTimeWindow] ?? null;
}

const SAFE_LOCALITY_FORM: unique symbol = Symbol("safe-locality-form");

export type SafeLocalityForm = {
  readonly text: string;
  readonly [SAFE_LOCALITY_FORM]: true;
};

export type ApprovedLocalityInput = {
  readonly approvedPrepositionalForm: string;
};

/**
 * Brands an already approved, prepositional customer-facing locality form.
 * It neither accepts locality IDs nor inflects a place name.
 */
export function approvedLocalityForm(
  input: ApprovedLocalityInput,
): SafeLocalityForm | null {
  const text = input.approvedPrepositionalForm.trim();
  if (!/^z\s+\S/u.test(text)) {
    return null;
  }

  return Object.freeze({
    text,
    [SAFE_LOCALITY_FORM]: true as const,
  });
}
