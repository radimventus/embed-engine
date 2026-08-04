/**
 * PE-11 — Welcome Experience content (partner first session).
 * Pure presentation copy — no Runtime / capabilities.
 */

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
      summary:
        'Embed Experience pro koncového klienta — priorita, FAQ, chat a audit.',
      primary: true,
    },
    {
      id: 'manager',
      name: 'Manager Studio',
      summary: 'Partnerský provoz a přehled pilotního projektu.',
      primary: false,
    },
    {
      id: 'sales',
      name: 'Sales Studio',
      summary: 'Obchodní pohled na pilotní nabídku a komunikaci.',
      primary: false,
    },
  ]);

export const WELCOME_PRIMARY_CTA_LABEL = 'Otevřít Client Studio' as const;

export function welcomeGreeting(input: {
  readonly displayName: string;
  readonly firmName: string;
}): string {
  return `${input.displayName}, vítejte v Partner Environment firmy ${input.firmName}.`;
}

export function welcomeEnvironmentLead(projectName: string): string {
  return `Pilotní prostředí je připravené: ukázkový projekt ${projectName}, branding partnera a tři Studia. Builder ani Office nejsou součástí partnerského přístupu.`;
}
