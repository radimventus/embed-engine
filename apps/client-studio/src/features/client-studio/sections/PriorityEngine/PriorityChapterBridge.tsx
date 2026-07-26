import {
  PRIORITY_BRIDGE_CTA_CONTINUE,
  PRIORITY_BRIDGE_CTA_FIND,
  PRIORITY_BRIDGE_CTA_PLOT,
  PRIORITY_BRIDGE_CTA_REPORT,
  PRIORITY_BRIDGE_GAIN_HEADING,
  PRIORITY_BRIDGE_KNOW_HEADING,
  PRIORITY_BRIDGE_NEXT_HEADING,
  PRIORITY_BRIDGE_NEXT_LINES,
  PRIORITY_BRIDGE_REPORT_LINES,
  PRIORITY_BRIDGE_REPORT_TITLE,
  PRIORITY_BRIDGE_SUMMARY,
  PRIORITY_BRIDGE_TITLE,
} from './priorityConversation.constants';
import {
  PRIORITY_ENGINE_SECTION_HORIZONTAL_PADDING_CLASS,
} from './priority-engine-layout';
import { usePriorityConversationContext } from './PriorityConversationProvider';
import { SECTION_SURFACE_CLASS } from '../../section-surface';

const titleClass =
  'm-0 text-[22px] font-semibold leading-snug tracking-wide text-embed-foreground-primary';

const sectionHeadingClass =
  'm-0 text-[15px] font-semibold uppercase tracking-[0.06em] text-embed-brand-gold';

const bodyClass =
  'text-[15px] leading-[1.65] text-embed-foreground-primary';

const softClass =
  'text-[14px] leading-[1.6] text-embed-foreground-primary/75';

const primaryCtaClass =
  'rounded-[8px] border border-[#D4AF37] bg-[#D4AF37]/18 px-4 py-3 text-left text-[15px] font-medium text-embed-foreground-primary transition-colors hover:bg-[#D4AF37]/28 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35';

const secondaryCtaClass =
  'rounded-[8px] border border-embed-foreground-primary/18 bg-transparent px-4 py-3 text-left text-[15px] font-medium text-embed-foreground-primary transition-colors hover:border-[#D4AF37]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35';

/**
 * Full-width bridge after Priority — closes chapter 1, opens value chapter.
 * User-facing copy never uses internal „Audit“ terminology.
 */
export function PriorityChapterBridge() {
  const {
    phase,
    hypothesis,
    continueToNextChapter,
    continueWithPlotCheck,
    continueWithPlotFind,
    continueWithReport,
  } = usePriorityConversationContext();

  if (phase !== 'complete' || hypothesis === null) {
    return null;
  }

  return (
    <section
      className={`scroll-mt-header ${SECTION_SURFACE_CLASS} ${PRIORITY_ENGINE_SECTION_HORIZONTAL_PADDING_CLASS}`}
      data-testid="priority-chapter-bridge"
      aria-label="Shrnutí priorit a další hodnota"
    >
      <div className="mx-auto flex max-w-[920px] flex-col gap-7 py-2">
        <header className="flex flex-col gap-3">
          <h2 className={titleClass} data-testid="priority-bridge-title">
            {PRIORITY_BRIDGE_TITLE}
          </h2>
          <p className={bodyClass}>{PRIORITY_BRIDGE_SUMMARY}</p>
        </header>

        <div className="flex flex-col gap-2.5" data-testid="priority-bridge-know">
          <h3 className={sectionHeadingClass}>{PRIORITY_BRIDGE_KNOW_HEADING}</h3>
          <p className={bodyClass}>{hypothesis.prioritiesLine}</p>
          <p
            className={bodyClass}
            data-testid="priority-bridge-hypothesis"
          >
            {hypothesis.pictureLine}
          </p>
          <p className={softClass}>{hypothesis.thanksLine}</p>
        </div>

        <div
          className="rounded-[12px] border border-[#D4AF37]/45 bg-[#D4AF37]/12 px-5 py-5"
          data-testid="priority-bridge-report"
        >
          <h3 className={sectionHeadingClass}>{PRIORITY_BRIDGE_GAIN_HEADING}</h3>
          <p className="mt-2 text-[18px] font-semibold leading-snug text-embed-foreground-primary">
            {PRIORITY_BRIDGE_REPORT_TITLE}
          </p>
          {PRIORITY_BRIDGE_REPORT_LINES.map((line) => (
            <p key={line} className={`${bodyClass} mt-2`}>
              {line}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-3" data-testid="priority-bridge-next">
          <h3 className={sectionHeadingClass}>{PRIORITY_BRIDGE_NEXT_HEADING}</h3>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {PRIORITY_BRIDGE_NEXT_LINES.map((line) => (
              <li key={line} className={bodyClass}>
                {line}
              </li>
            ))}
          </ul>
          <div className="mt-2 grid grid-cols-1 gap-2.5 mobile:grid-cols-1 sm:grid-cols-3">
            <button
              type="button"
              className={primaryCtaClass}
              data-testid="priority-bridge-cta-plot"
              onClick={continueWithPlotCheck}
            >
              {PRIORITY_BRIDGE_CTA_PLOT}
            </button>
            <button
              type="button"
              className={secondaryCtaClass}
              data-testid="priority-bridge-cta-find"
              onClick={continueWithPlotFind}
            >
              {PRIORITY_BRIDGE_CTA_FIND}
            </button>
            <button
              type="button"
              className={secondaryCtaClass}
              data-testid="priority-bridge-cta-report"
              onClick={continueWithReport}
            >
              {PRIORITY_BRIDGE_CTA_REPORT}
            </button>
          </div>
          <button
            type="button"
            className={`${primaryCtaClass} mt-1 self-start`}
            data-testid="priority-bridge-cta-continue"
            onClick={continueToNextChapter}
          >
            {PRIORITY_BRIDGE_CTA_CONTINUE}
          </button>
        </div>
      </div>
    </section>
  );
}
