import type {
  CapabilityHost,
  CapabilityId,
  CapabilityInspectorModel,
} from '@embed-engine/capabilities';

type CapabilityInspectorProps = {
  readonly model: CapabilityInspectorModel;
  readonly compact?: boolean;
};

/**
 * EPIC-BX-13 — right Inspector surface for Capability Platform metadata.
 */
export function CapabilityInspector({
  model,
  compact = false,
}: CapabilityInspectorProps) {
  const active =
    model.capabilities.find(
      (item) => item.metadata.id === model.activeCapabilityId,
    ) ?? null;

  return (
    <aside
      className="platform-capability-inspector"
      data-testid="capability-inspector"
      aria-label="Capability Inspector"
    >
      <p className="platform-capability-inspector__eyebrow">Capability</p>
      <h2 className="platform-capability-inspector__title">Inspector</h2>
      <p className="platform-capability-inspector__studio">
        Studio · {model.studioId}
      </p>

      {active !== null ? (
        <div className="platform-capability-inspector__active">
          <p className="platform-capability-inspector__name">
            {active.metadata.name}
          </p>
          <p className="platform-capability-inspector__meta">
            v{active.metadata.version} · {active.metadata.maturity} ·{' '}
            {active.health.status}
          </p>
          <p className="platform-capability-inspector__desc">
            {active.metadata.description}
          </p>
          <p className="platform-capability-inspector__owner">
            Owner · {active.metadata.owner}
          </p>
          {active.metadata.dependencies.length > 0 && (
            <p className="platform-capability-inspector__deps">
              Depends · {active.metadata.dependencies.join(', ')}
            </p>
          )}
        </div>
      ) : (
        <p className="platform-capability-inspector__empty">
          Vyberte produktovou sekci — Inspector zobrazí aktivní capability.
        </p>
      )}

      {!compact && (
        <ul className="platform-capability-inspector__list">
          {model.capabilities.map((item) => {
            const isActive = item.metadata.id === model.activeCapabilityId;
            return (
              <li
                key={item.metadata.id}
                className={
                  isActive
                    ? 'platform-capability-inspector__item platform-capability-inspector__item--active'
                    : 'platform-capability-inspector__item'
                }
              >
                <span>{item.metadata.name}</span>
                <span>{item.health.active ? 'on' : 'off'}</span>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

export function buildInspectorModel(
  host: CapabilityHost,
  activeCapabilityId: CapabilityId | null = null,
): CapabilityInspectorModel {
  return host.inspectorModel(activeCapabilityId);
}
