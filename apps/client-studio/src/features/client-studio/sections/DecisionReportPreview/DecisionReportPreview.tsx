import { FramedInput, Panel, PrimaryButton } from '@embed-engine/ui';

import {
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
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-embed-foreground-primary/70">
          Your personalized report is almost ready.
        </p>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-embed-foreground-primary/70">
          This report summarizes your selected priorities and the most relevant aspects of this
          property.
        </p>
      </header>

      <Panel as="article" variant="inset" className="mt-section" aria-label="Report preview">
        <h3 className="text-sm font-semibold tracking-wide text-embed-foreground-primary">
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
                <span className="mt-px shrink-0 text-embed-brand-gold" aria-hidden="true">
                  ✓
                </span>
                <span>{priority}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={CHAPTER_PANEL_DIVIDER_CLASS}>
          <h4 className={CHAPTER_PANEL_LABEL_CLASS}>Summary</h4>
          <p className="mt-2 text-sm leading-relaxed text-embed-foreground-primary/70">
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
                <span className="mt-px shrink-0 text-embed-brand-gold" aria-hidden="true">
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
            className="flex items-center gap-2 text-sm font-medium text-embed-foreground-primary transition-opacity duration-200 ease-out hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-embed-border-default bg-embed-background-tertiary text-xs"
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
          <label className="mt-3 block text-sm text-embed-foreground-primary/70" htmlFor="report-email">
            Email
            <FramedInput
              id="report-email"
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              className="mt-1.5 max-w-md"
            />
          </label>
          <PrimaryButton type="button" className="mt-4">
            Send Report
          </PrimaryButton>
        </div>
      </Panel>
    </section>
  );
}
