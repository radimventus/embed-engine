export function ClientStudioHeader() {
  return (
    <header className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-embed-border-default bg-embed-background-primary px-4 py-3 md:px-6 md:py-4">
      <p className="text-sm font-semibold text-embed-foreground-primary md:text-base">
        ASTAV s.r.o.
      </p>
      <p className="text-sm text-embed-foreground-secondary md:text-base">Client studio</p>
      <div className="flex items-center justify-end gap-4 md:gap-6">
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
