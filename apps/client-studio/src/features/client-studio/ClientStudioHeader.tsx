export function ClientStudioHeader() {
  return (
    <header className="grid h-header shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-embed-border-default bg-embed-background-primary px-section">
      <p className="text-base font-semibold text-embed-foreground-primary">ASTAV s.r.o.</p>
      <p className="text-base text-embed-foreground-secondary">Client studio</p>
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
