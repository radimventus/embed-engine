/**
 * TASK-81 — Partner START.
 * One-time PRE-PILOT lifecycle entry, not a Studio.
 */

export const WELCOME_TITLE = 'Vítejte ve svém CONIS Studio' as const;

export const WELCOME_LEAD =
  'Vše je připravené. Zbývá už jen vybrat pilotní program.' as const;

export const WELCOME_PASSWORD_NOTE =
  'Heslo můžete kdykoliv změnit v Nastavení.' as const;

export const WELCOME_PRIMARY_CTA_LABEL = 'Vybrat pilotní program' as const;

export const WELCOME_SECONDARY_CTA_LABEL =
  'Pokračovat do CONIS Studio' as const;

export type WelcomeStudioIntroId = 'client' | 'manager' | 'sales';

export type WelcomeStudioIntro = {
  readonly id: WelcomeStudioIntroId;
  readonly name: string;
  readonly summary: string;
  readonly primary: boolean;
};

export const WELCOME_STUDIO_INTROS: readonly WelcomeStudioIntro[] =
  Object.freeze([
    {
      id: 'client',
      name: 'Client Studio',
      summary: 'Prostor, kde si klient (zájemce) prohlédne dům.',
      primary: false,
    },
    {
      id: 'sales',
      name: 'Sales Studio',
      summary: 'Prostředí obchodníka ukazuje, co klienta zajímá.',
      primary: false,
    },
    {
      id: 'manager',
      name: 'Manager Studio',
      summary: 'Informační centrum zobrazuje, jak se klienti rozhodují.',
      primary: true,
    },
  ]);

export function welcomeGreeting(_input?: {
  readonly displayName?: string;
  readonly firmName?: string;
}): string {
  return WELCOME_TITLE;
}

export function welcomeEnvironmentLead(_projectName?: string): string {
  return WELCOME_LEAD;
}
