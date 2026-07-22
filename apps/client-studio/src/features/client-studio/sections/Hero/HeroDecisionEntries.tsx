import { PrimaryLink } from '@embed-engine/ui';

import { scrollToSection } from '../../foundation/scrollToSection';
import { PILOT_SECTION_IDS } from '../../pilot/pilotVocabulary';

type DecisionEntry = {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly primary?: boolean;
};

const DECISION_ENTRIES: readonly DecisionEntry[] = [
  {
    id: 'explore-property',
    label: 'Prozkoumat dům',
    href: `#${PILOT_SECTION_IDS.propertyExplorer}`,
    primary: true,
  },
  {
    id: 'explore-layout',
    label: 'Podívat se na dispozici',
    href: `#${PILOT_SECTION_IDS.floorPlan}`,
  },
  {
    id: 'explore-priorities',
    label: 'Objevit priority',
    href: `#${PILOT_SECTION_IDS.priority}`,
  },
] as const;

/**
 * Decision Entry CTAs — open journey sections only.
 * Hero must not decide; it only opens the path (CSCB-02 / SR-002).
 */
export function HeroDecisionEntries() {
  return (
    <nav
      aria-label="Vstup do Decision Journey"
      className="flex max-w-md flex-col items-stretch gap-3"
    >
      {DECISION_ENTRIES.map((entry) => (
        <PrimaryLink
          key={entry.id}
          href={entry.href}
          size="sm"
          className={
            entry.primary
              ? undefined
              : '!bg-transparent !text-embed-foreground-primary underline decoration-embed-border-strong underline-offset-4 hover:opacity-80'
          }
          onClick={(event) => {
            event.preventDefault();
            const sectionId = entry.href.slice(1);
            scrollToSection(sectionId);
            window.history.pushState(null, '', entry.href);
          }}
        >
          {entry.label}
        </PrimaryLink>
      ))}
    </nav>
  );
}
