/**
 * Commercial Conversion configuration (CSCB-07).
 * Presentation / transport only — no scoring, routing, or Runtime mutation.
 */

export type CommercialCtaId =
  | 'request-consultation'
  | 'request-offer'
  | 'book-meeting'
  | 'contact-specialist';

export type CommercialCta = {
  readonly id: CommercialCtaId;
  readonly labelCs: string;
  readonly descriptionCs: string;
  readonly mailtoSubject: string;
  readonly successNextStepCs: string;
  readonly enabled: boolean;
};

export type ContactMethodId = 'email' | 'phone' | 'either';

export type ContactMethodOption = {
  readonly id: ContactMethodId;
  readonly labelCs: string;
};

/** Configurable CTA catalogue — toggle `enabled` without code changes elsewhere. */
export const COMMERCIAL_CTAS: readonly CommercialCta[] = Object.freeze([
  {
    id: 'request-consultation',
    labelCs: 'Domluvit konzultaci',
    descriptionCs: 'Probereme doporučení a další kroky s odborníkem.',
    mailtoSubject: 'Poptávka — konzultace',
    successNextStepCs: 'Ozveme se vám s termíny konzultace.',
    enabled: true,
  },
  {
    id: 'request-offer',
    labelCs: 'Vyžádat nabídku',
    descriptionCs: 'Připravíme nezávaznou nabídku na základě vašeho rozhodnutí.',
    mailtoSubject: 'Poptávka — nabídka',
    successNextStepCs: 'Připravíme nabídku a pošleme ji na váš e-mail.',
    enabled: true,
  },
  {
    id: 'book-meeting',
    labelCs: 'Rezervovat schůzku',
    descriptionCs: 'Domluvíme osobní nebo online schůzku.',
    mailtoSubject: 'Poptávka — schůzka',
    successNextStepCs: 'Navrhneme termíny schůzky.',
    enabled: true,
  },
  {
    id: 'contact-specialist',
    labelCs: 'Kontaktovat specialistu',
    descriptionCs: 'Specialista se vám ozve s odpovědí na vaše otázky.',
    mailtoSubject: 'Poptávka — kontakt specialisty',
    successNextStepCs: 'Specialista se vám ozve zpět.',
    enabled: true,
  },
]);

export const COMMERCIAL_CONTACT_METHODS: readonly ContactMethodOption[] =
  Object.freeze([
    { id: 'email', labelCs: 'E-mail' },
    { id: 'phone', labelCs: 'Telefon' },
    { id: 'either', labelCs: 'Jakékoli' },
  ]);

export const COMMERCIAL_CONSENT_TEXT_CS =
  'Souhlasím se zpracováním kontaktních údajů za účelem vyřízení mé poptávky. Údaje nebudou sdíleny s třetími stranami pro marketing bez dalšího souhlasu.';

export function enabledCommercialCtas(): readonly CommercialCta[] {
  return COMMERCIAL_CTAS.filter((cta) => cta.enabled);
}

export function findCommercialCta(
  id: CommercialCtaId | null,
): CommercialCta | null {
  if (id === null) {
    return null;
  }
  return COMMERCIAL_CTAS.find((cta) => cta.id === id) ?? null;
}
