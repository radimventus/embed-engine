import { AstavLogo } from './AstavLogo';
import { MANAGER_STUDIO_RELEASE } from './operations/operationsVocabulary';

/**
 * AppShell top bar (MSCB-01).
 */
export function ManagerStudioHeader() {
  return (
    <header className="grid h-header shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-embed-border-default bg-embed-background-primary px-section">
      <AstavLogo />
      <p className="text-base text-embed-foreground-primary/70">
        Manager Studio
      </p>
      <p className="justify-self-end text-xs text-embed-foreground-primary/40">
        v{MANAGER_STUDIO_RELEASE.version}
      </p>
    </header>
  );
}
