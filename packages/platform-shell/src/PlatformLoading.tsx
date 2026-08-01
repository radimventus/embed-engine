type PlatformLoadingProps = {
  readonly label?: string;
};

/**
 * VR-FIX-03 — Unified loading surface.
 */
export function PlatformLoading({
  label = 'Načítám…',
}: PlatformLoadingProps) {
  return (
    <div
      className="platform-loading"
      role="status"
      aria-live="polite"
      data-testid="platform-loading"
    >
      <div className="platform-loading__spinner" aria-hidden />
      <p className="platform-loading__label">{label}</p>
    </div>
  );
}
