/** Target visual gap between sibling Experience sections (CAP UX3 08). */
const CHAPTER_SPACING_PX = 30;
/** Cancels JourneySceneFrame `gap-[18px]` on both sides so net gap stays 30px. */
const SCENE_GAP_COMPENSATION_PX = 18;

/**
 * Shared chapter spacer between Decision Journey sections (CSCB-01).
 * Inline height avoids Tailwind config cache drift; negative margins cancel
 * parent flex gap so Hero↔Tour / Priority↔FAQ read as exactly 30px.
 */
export function ChapterSpacer() {
  return (
    <div
      aria-hidden="true"
      data-chapter-spacer=""
      className="w-full shrink-0 bg-embed-background-primary"
      style={{
        height: CHAPTER_SPACING_PX,
        marginTop: -SCENE_GAP_COMPENSATION_PX,
        marginBottom: -SCENE_GAP_COMPENSATION_PX,
      }}
    />
  );
}
