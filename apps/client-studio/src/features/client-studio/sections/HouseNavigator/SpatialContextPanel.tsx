import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';

function floorLabel(floor: number): string {
  return floor === 0 ? 'Přízemí' : `Patro ${floor}`;
}

/**
 * Spatial Context Panel (CSCB-03 / RCS-03) — projected room facts only.
 * No interpretation; values come from Runtime Experience Context.
 * Mobile room-detail chrome; desktop SSOT leaves this unmounted in the live column.
 */
export function SpatialContextPanel() {
  const { experience } = useDecisionSessionRuntime();
  const room = experience.context.activeRoom.room;
  const roomMedia = experience.context.roomMedia;
  const navigation = experience.context.navigation;

  if (room === null) {
    return (
      <div
        aria-label="Prostorový kontext"
        className="flex min-h-11 flex-col justify-center gap-1 px-0 py-2"
      >
        <p className="text-sm text-embed-foreground-primary/55">
          Objektový pohled — vyberte místnost pro prohlídku
        </p>
        <p className="text-xs text-embed-foreground-primary/40">
          Patro {navigation.currentFloor ?? '—'}
        </p>
      </div>
    );
  }

  const metrics = room.metrics ?? [
    { label: 'Plocha', value: `${room.area} m²` },
    { label: 'Patro', value: floorLabel(room.floor) },
  ];

  return (
    <div
      aria-label="Prostorový kontext"
      data-room-id={room.id}
      data-testid="spatial-context-panel"
      className="flex min-h-11 flex-col justify-center gap-2 px-0 py-2"
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-embed-brand-gold">
          {roomMedia.title ?? room.name}
        </p>
        <h3 className="mt-1 text-base font-semibold text-embed-foreground-primary mobile:text-lg">
          {room.name}
        </h3>
      </div>
      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-embed-foreground-primary/70 mobile:gap-x-4 mobile:text-sm">
        {metrics.slice(0, 3).map((metric) => (
          <div key={metric.label} className="flex min-h-11 items-center gap-1.5 desktop:min-h-0">
            <dt>{metric.label}</dt>
            <dd className="font-medium text-embed-foreground-primary">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
