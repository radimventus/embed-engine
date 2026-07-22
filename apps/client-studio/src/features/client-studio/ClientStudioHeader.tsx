import { AstavLogo } from './AstavLogo';
import { scrollToSection } from './foundation/scrollToSection';
import { PILOT_SECTION_IDS } from './pilot/pilotVocabulary';

/**
 * AppShell top navigation (CSCB-01).
 * Owns brand + journey shortcuts — not section content.
 */
export function ClientStudioHeader() {
  return (
    <header className="grid h-header shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-embed-border-default bg-embed-background-primary px-section">
      <AstavLogo />
      <p className="text-base text-embed-foreground-primary/70">Client studio</p>
      <div className="flex items-center justify-end gap-section">
        <button
          type="button"
          className="text-sm text-embed-foreground-primary underline decoration-embed-border-strong underline-offset-4"
          onClick={() => {
            scrollToSection(PILOT_SECTION_IDS.audit);
          }}
        >
          Kontakt
        </button>
      </div>
    </header>
  );
}
