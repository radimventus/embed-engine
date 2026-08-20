type PriorityRacioBridgeProps = {
  readonly onContinue: () => void;
};

/**
 * Optional inter-scene emphasis. The standard scene controls remain primary.
 */
export function PriorityRacioBridge({ onContinue }: PriorityRacioBridgeProps) {
  return (
    <aside
      className="flex max-w-[560px] items-center gap-4 rounded-[8px] bg-embed-brand-navy px-5 py-3 mobile:flex-col mobile:items-stretch"
      data-testid="priority-racio-bridge"
    >
      <p className="m-0 text-sm leading-relaxed text-embed-background-primary">
        Teď přejdeme k častým otázkám a možnosti chat diskuse.
      </p>
      <button
        type="button"
        onClick={onContinue}
        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[8px] bg-embed-brand-gold px-[19px] text-[13px] font-medium text-embed-brand-navy transition-colors duration-150 hover:bg-embed-background-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2 touch-manipulation desktop:min-h-[38px]"
        data-testid="priority-racio-bridge-continue"
      >
        Pokračovat →
      </button>
    </aside>
  );
}
