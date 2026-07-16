type DecisionProgressProps = {
  minimumMet: boolean;
  minimumSelection: number;
  selectedCount: number;
};

export function DecisionProgress({
  minimumMet,
  minimumSelection,
  selectedCount,
}: DecisionProgressProps) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <p className="text-sm leading-none text-embed-foreground-secondary">
        <span className="font-medium tracking-wide">Selected</span>{' '}
        <span className="tabular-nums font-semibold text-embed-foreground-primary">
          {selectedCount} / {minimumSelection}
        </span>
      </p>
      {minimumMet ? (
        <p className="text-sm font-medium leading-none tracking-wide text-embed-brand-navy">
          ✓ Minimum completed
        </p>
      ) : null}
    </div>
  );
}
