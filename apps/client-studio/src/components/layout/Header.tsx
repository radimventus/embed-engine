type HeaderProps = {
  studioTitle: string;
};

export function Header({ studioTitle }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-embed-border-default px-6">
      <div className="flex items-center gap-6">
        <span className="text-sm font-medium tracking-brand text-embed-foreground-primary">
          EMBED
        </span>
        <span className="text-sm text-embed-foreground-primary/70">{studioTitle}</span>
      </div>
      <div aria-hidden="true" />
    </header>
  );
}
