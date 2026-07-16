export function IntroText() {
  return (
    <div className="flex h-full min-h-0 flex-col justify-center border border-embed-border-default bg-embed-white p-section">
      <p className="text-sm font-medium leading-relaxed text-embed-brand-navy">
        Calibrate your decision filter
      </p>
      <p className="mt-3 text-sm leading-relaxed text-embed-foreground-secondary">
        Select the priorities that matter most to you. Your choices define how this property will
        be interpreted — not how it is scored.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-embed-foreground-secondary">
        Adjust importance for each selected priority to reflect what truly influences your decision.
      </p>
    </div>
  );
}
