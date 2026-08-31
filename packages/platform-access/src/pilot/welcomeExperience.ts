/**
 * TASK-81 — Partner START.
 * One-time PRE-PILOT lifecycle entry, not a Studio.
 */

export const WELCOME_TITLE = 'Vítejte v CONIS' as const;

export const WELCOME_LEAD =
  'Vaše partnerské prostředí je připravené. V CONIS pracujete ve třech vzájemně propojených Studiích.' as const;

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
      summary: 'Zkušenost, kterou vidí a používá zákazník.',
      primary: false,
    },
    {
      id: 'sales',
      name: 'Sales Studio',
      summary: 'Konkrétní zákazníci, jejich priority a další obchodní krok.',
      primary: false,
    },
    {
      id: 'manager',
      name: 'Manager Studio',
      summary: 'Připravenost projektu, rozhodovací trajektorie a doporučení.',
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
