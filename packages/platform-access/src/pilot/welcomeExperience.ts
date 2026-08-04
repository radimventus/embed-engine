/**
 * PT-CJ-01 — Welcome & Pilot Entry copy (Apple Easy).
 * One screen · one goal · one primary CTA. Pure presentation — no Runtime.
 */

/** Primary commercial step after first login. */
export const WELCOME_TITLE = 'Vítejte ve svém CONIS Studio' as const;

export const WELCOME_LEAD =
  'Vše je připravené. Zbývá už jen vybrat pilotní program.' as const;

export const WELCOME_PASSWORD_NOTE =
  'Heslo můžete kdykoliv změnit v Nastavení.' as const;

export const WELCOME_PRIMARY_CTA_LABEL = 'Vybrat pilotní program' as const;

/** Subtle secondary path — continue without purchase. */
export const WELCOME_SECONDARY_CTA_LABEL =
  'Pokračovat do CONIS Studio' as const;

/** @deprecated PE-11 studio cards removed in PT-CJ-01 — kept for type stability. */
export type WelcomeStudioIntroId = 'client' | 'manager' | 'sales';

/** @deprecated PE-11 studio cards removed in PT-CJ-01. */
export type WelcomeStudioIntro = {
  readonly id: WelcomeStudioIntroId;
  readonly name: string;
  readonly summary: string;
  readonly primary: boolean;
};

/** @deprecated Empty — Welcome no longer lists studios. */
export const WELCOME_STUDIO_INTROS: readonly WelcomeStudioIntro[] =
  Object.freeze([]);

export function welcomeGreeting(_input?: {
  readonly displayName?: string;
  readonly firmName?: string;
}): string {
  return WELCOME_TITLE;
}

export function welcomeEnvironmentLead(_projectName?: string): string {
  return WELCOME_LEAD;
}
