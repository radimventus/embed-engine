import type {
  CapabilityHost,
  CapabilityId,
  CapabilityInspectorModel,
} from '@embed-engine/capabilities';

import { PlatformStatusBadge } from './PlatformStatusBadge';

type CapabilityInspectorProps = {
  readonly model: CapabilityInspectorModel;
  readonly compact?: boolean;
};

function healthTone(
  status: string,
): 'pass' | 'warning' | 'fail' | 'draft' | 'info' {
  if (status === 'healthy') return 'pass';
  if (status === 'degraded') return 'warning';
  if (status === 'error') return 'fail';
  if (status === 'inactive') return 'draft';
  return 'info';
}

/**
 * VR-FIX-02 — Unified Inspector (header · metadata · status · modules).
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
      <p className="platform-capability-inspector__eyebrow">Modul</p>
      <h2 className="platform-capability-inspector__title">Inspector</h2>
      <p className="platform-capability-inspector__studio">
        Studio · {model.studioId}
      </p>

      {active !== null ? (
        <div className="platform-capability-inspector__active">
          <p className="platform-capability-inspector__name">
            {active.metadata.name}
          </p>
          <div className="platform-capability-inspector__badges">
            <PlatformStatusBadge tone={healthTone(active.health.status)}>
              {active.health.status}
            </PlatformStatusBadge>
            <PlatformStatusBadge tone="info">
              {active.metadata.maturity}
            </PlatformStatusBadge>
            <PlatformStatusBadge tone="gold">
              {active.metadata.entitlement}
            </PlatformStatusBadge>
          </div>
          <p className="platform-capability-inspector__desc">
            {active.metadata.description}
          </p>
          <p className="platform-capability-inspector__meta">
            v{active.metadata.version} · Owner · {active.metadata.owner}
          </p>
          {active.metadata.dependencies.length > 0 && (
            <p className="platform-capability-inspector__deps">
              Depends · {active.metadata.dependencies.join(', ')}
            </p>
          )}
        </div>
      ) : (
        <p className="platform-capability-inspector__empty">
          Vyberte produktový modul — Inspector zobrazí stav a metadata.
        </p>
      )}

      {!compact && (
        <>
          <p
            className="platform-type-section"
            style={{ marginTop: 24 }}
          >
            Product modules
          </p>
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
                  <PlatformStatusBadge
                    tone={item.health.active ? 'ready' : 'draft'}
                  >
                    {item.health.active ? 'Ready' : 'Idle'}
                  </PlatformStatusBadge>
                </li>
              );
            })}
          </ul>
        </>
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
