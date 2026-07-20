import { AstavLogo } from './AstavLogo';

export function ClientStudioHeader() {
  return (
    <header className="grid h-header shrink-0 -translate-y-[1px] grid-cols-[1fr_auto_1fr] items-center bg-[#F7F6F4] px-section">
      <AstavLogo />
      <p className="text-base text-embed-foreground-primary/70">Client studio</p>
      <div className="flex items-center justify-end gap-section">
        <button
          type="button"
          className="text-sm text-embed-foreground-primary underline decoration-embed-border-strong underline-offset-4"
        >
          Uložit
        </button>
        <button
          type="button"
          className="text-sm text-embed-foreground-primary underline decoration-embed-border-strong underline-offset-4"
        >
          Kontakt
        </button>
      </div>
    </header>
  );
}
