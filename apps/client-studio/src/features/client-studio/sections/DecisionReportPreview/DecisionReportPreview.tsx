import {
  CHAPTER_CTA_CLASS,
  CHAPTER_CTA_FOCUS_CLASS,
  CHAPTER_PANEL_CLASS,
  CHAPTER_PANEL_DIVIDER_CLASS,
  CHAPTER_PANEL_LABEL_CLASS,
} from '../../chapter-layout';
import { CHAPTER_HEADER_CLASS } from '../spatial-terminal-layout';
import {
  MOCK_DECISION_REPORT_PREVIEW,
  type DecisionReportPreviewViewModel,
} from './DecisionReportPreviewViewModel';

type DecisionReportPreviewProps = {
  viewModel?: DecisionReportPreviewViewModel;
};

export function DecisionReportPreview({
  viewModel = MOCK_DECISION_REPORT_PREVIEW,
}: DecisionReportPreviewProps) {
  return (
    <section
      aria-label="Decision Report Preview"
      className="border-b border-embed-border-default px-section py-section"
    >
      <header>
        <h2 className={CHAPTER_HEADER_CLASS}>Decision Report</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-embed-foreground-secondary">
          Your personalized report is almost ready.
        </p>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-embed-foreground-secondary">
          This report summarizes your selected priorities and the most relevant aspects of this
          property.
        </p>
      </header>

      <article className={`mt-section ${CHAPTER_PANEL_CLASS}`} aria-label="Report preview">
        <h3 className="text-sm font-semibold tracking-wide text-embed-brand-navy">
          Decision Report
        </h3>

        <div className={CHAPTER_PANEL_DIVIDER_CLASS}>
          <p className={CHAPTER_PANEL_LABEL_CLASS}>Property</p>
          <p className="mt-1 text-sm font-medium text-embed-foreground-primary">
            {viewModel.propertyName}
          </p>
        </div>

        <div className={CHAPTER_PANEL_DIVIDER_CLASS}>
          <h4 className={CHAPTER_PANEL_LABEL_CLASS}>Selected Priorities</h4>
          <ul className="mt-2 space-y-1.5" aria-label="Selected priorities">
            {viewModel.priorities.map((priority) => (
              <li
                key={priority}
                className="flex items-start gap-2 text-sm leading-snug text-embed-foreground-primary"
              >
                <span className="mt-px shrink-0 text-embed-brand-navy" aria-hidden="true">
                  ✓
                </span>
                <span>{priority}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={CHAPTER_PANEL_DIVIDER_CLASS}>
          <h4 className={CHAPTER_PANEL_LABEL_CLASS}>Summary</h4>
          <p className="mt-2 text-sm leading-relaxed text-embed-foreground-secondary">
            {viewModel.summary}
          </p>
        </div>

        <div className={CHAPTER_PANEL_DIVIDER_CLASS}>
          <h4 className={CHAPTER_PANEL_LABEL_CLASS}>Included in the report</h4>
          <ul className="mt-2 space-y-1.5" aria-label="Included in the report">
            {viewModel.includedItems.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm leading-snug text-embed-foreground-primary"
              >
                <span className="mt-px shrink-0 text-embed-brand-navy" aria-hidden="true">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={CHAPTER_PANEL_DIVIDER_CLASS}>
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-medium text-embed-brand-navy transition-opacity duration-200 ease-out hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-navy/25 focus-visible:ring-offset-2"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-embed-neutral-200 bg-embed-neutral-50 text-xs"
              aria-hidden="true"
            >
              PDF
            </span>
            Download Preview
          </button>
        </div>

        <div className={CHAPTER_PANEL_DIVIDER_CLASS}>
          <h4 className="text-sm font-medium text-embed-foreground-primary">
            Send report to email
          </h4>
          <label className="mt-3 block text-sm text-embed-foreground-secondary" htmlFor="report-email">
            Email
            <input
              id="report-email"
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              className="mt-1.5 w-full max-w-md rounded-lg border border-embed-neutral-200 bg-embed-white px-3 py-2.5 text-sm text-embed-foreground-primary placeholder:text-embed-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-navy/25 focus-visible:ring-offset-2"
            />
          </label>
          <button
            type="button"
            className={`mt-4 ${CHAPTER_CTA_FOCUS_CLASS} ${CHAPTER_CTA_CLASS}`}
          >
            Send Report
          </button>
        </div>
      </article>
    </section>
  );
}
