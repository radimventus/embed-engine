/**
 * Presentation-only Experience header title (not a Runtime identity field).
 *
 * Example: `house-modern-01` → `Client Studio / Modern 01`
 */
export function formatExperienceHeaderTitle(
  objectId: string | null | undefined,
): string {
  const raw = objectId?.trim() ?? '';
  if (raw.length === 0) {
    return 'Client Studio';
  }

  const withoutHousePrefix = raw.replace(/^house-/i, '');
  const segments = withoutHousePrefix.split(/[-_]+/).filter(Boolean);
  if (segments.length === 0) {
    return 'Client Studio';
  }

  const objectLabel = segments
    .map((segment) => {
      if (/^\d+$/.test(segment)) {
        return segment;
      }
      return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
    })
    .join(' ');

  return `Client Studio / ${objectLabel}`;
}
