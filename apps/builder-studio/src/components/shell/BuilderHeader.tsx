type BuilderHeaderProps = {
  readonly partnerName: string;
};

export function BuilderHeader({ partnerName }: BuilderHeaderProps) {
  return (
    <header className="flex h-builder-header shrink-0 items-center justify-between border-b border-builder-lineSoft bg-white px-[30px]">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">CONIS Builder</h1>
        <div className="text-sm text-builder-muted">{partnerName}</div>
      </div>
    </header>
  );
}
