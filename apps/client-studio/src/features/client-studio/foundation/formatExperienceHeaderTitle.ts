/**
 * Presentation-only Experience header title (not a Runtime identity field).
 * PE-02 — optional partner firmName from Brand Projection.
 *
 * Example: `house-modern-01` → `Client Studio / Modern 01`
 * With firm: `Pilot Domů · Client Studio / Modern 01`
 */
export function formatExperienceHeaderTitle(
  objectId: string | null | undefined,
  firmName?: string | null,
): string {
  const raw = objectId?.trim() ?? '';
  let base = 'Client Studio';

  if (raw.length > 0) {
    const withoutHousePrefix = raw.replace(/^house-/i, '');
    const segments = withoutHousePrefix.split(/[-_]+/).filter(Boolean);
    if (segments.length > 0) {
      const objectLabel = segments
        .map((segment) => {
          if (/^\d+$/.test(segment)) {
            return segment;
          }
          return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
        })
        .join(' ');
      base = `Client Studio / ${objectLabel}`;
    }
  }

  const firm = firmName?.trim() ?? '';
  if (firm.length === 0) {
    return base;
  }
  return `${firm} · ${base}`;
}
