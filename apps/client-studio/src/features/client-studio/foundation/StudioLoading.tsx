/**
 * Unified Runtime bootstrap loading surface (CSCB-01 / SR-001).
 */
export function StudioLoading({ label = 'Načítání Client Studia…' }: {
  readonly label?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] w-full items-center justify-center bg-embed-background-primary px-section"
    >
      <p className="text-sm text-embed-foreground-primary/60">{label}</p>
    </div>
  );
}
