/**
 * Shared chapter spacer between Decision Journey sections (CSCB-01).
 * Keeps canvas spacing consistent — sections must not invent their own gaps.
 */
export function ChapterSpacer() {
  return (
    <div
      aria-hidden="true"
      className="h-chapter-spacing w-full shrink-0 bg-embed-background-primary"
    />
  );
}
