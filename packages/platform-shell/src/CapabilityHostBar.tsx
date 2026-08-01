import type { CapabilityHost, CapabilityId } from '@embed-engine/capabilities';

type CapabilityHostBarProps = {
  readonly host: CapabilityHost;
  readonly activeCapabilityId?: CapabilityId | null;
};

/**
 * EPIC-BX-13 — Platform Shell strip showing loaded studio capabilities.
 */
export function CapabilityHostBar({
  host,
  activeCapabilityId = null,
}: CapabilityHostBarProps) {
  const activeCount = host.healthReport().filter((item) => item.active).length;
  const activeMeta =
    activeCapabilityId !== null
      ? host.metadata(activeCapabilityId)
      : undefined;

  return (
    <div
      className="platform-capability-bar"
      data-testid="capability-host-bar"
      aria-label="Capability Host"
    >
      <span className="platform-capability-bar__label">
        Capabilities · {activeCount}/{host.declaredIds.length} active
      </span>
      <span className="platform-capability-bar__ids">
        {host.declaredIds.join(' · ')}
      </span>
      {activeMeta !== undefined && (
        <span className="platform-capability-bar__active">
          Focus · {activeMeta.name}
        </span>
      )}
    </div>
  );
}
