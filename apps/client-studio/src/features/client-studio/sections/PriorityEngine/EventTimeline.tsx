import type { InterpretationEvent } from '@embed-engine/core/cognitive';

type EventTimelineProps = {
  events: readonly InterpretationEvent[];
};

export function EventTimeline({ events }: EventTimelineProps) {
  return (
    <aside
      aria-label="Event timeline"
      className="rounded-[8px] border border-embed-border-default bg-white/70 p-3"
      data-testid="event-timeline"
    >
      <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-embed-foreground-primary/55">
        Your path
      </p>
      {events.length === 0 ? (
        <p className="mt-2 text-xs leading-relaxed text-embed-foreground-primary/45">
          Explore the house — rooms, floors, gallery — and watch priorities adapt.
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1.5">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex items-start gap-2 text-xs leading-snug text-embed-foreground-primary/80 transition-opacity duration-300"
              data-testid={`timeline-${event.signalType}`}
            >
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-embed-brand-gold" />
              <span>{event.label}</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
