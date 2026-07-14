export function IntroText() {
  return (
    <div className="flex h-full min-h-[320px] flex-col border border-embed-border-default bg-embed-status-warning/15 p-6 md:min-h-[360px] md:p-8">
      <div className="aspect-square w-32 rounded-full border border-embed-border-default bg-embed-background-tertiary md:w-40" />
      <p className="mt-6 text-sm text-embed-foreground-secondary md:text-base">textové pole</p>
    </div>
  );
}
