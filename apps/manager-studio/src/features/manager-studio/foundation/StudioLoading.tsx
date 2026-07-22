/**
 * Unified Runtime bootstrap loading surface (MSCB-01).
 */
export function StudioLoading({
  label = 'Načítám Manager Studio…',
}: {
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
