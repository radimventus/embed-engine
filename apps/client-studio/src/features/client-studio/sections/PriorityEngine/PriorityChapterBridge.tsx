import {
  PRIORITY_CONVERSATION_COMPLETION_CHAT_LABEL,
  PRIORITY_CONVERSATION_COMPLETION_FAQ_LABEL,
  PRIORITY_CONVERSATION_NEXT_PATHS_PROMPT,
  PRIORITY_BRIDGE_GAIN_HEADING,
  PRIORITY_BRIDGE_KNOW_HEADING,
  PRIORITY_BRIDGE_NEXT_HEADING,
  PRIORITY_BRIDGE_NEXT_LINES,
  PRIORITY_BRIDGE_REPORT_LINES,
  PRIORITY_BRIDGE_REPORT_TITLE,
  PRIORITY_BRIDGE_SUMMARY,
  PRIORITY_BRIDGE_TITLE,
} from './priorityConversation.constants';
import { usePriorityConversationContext } from './PriorityConversationProvider';
import { PRIORITY_BRIDGE_ANCHOR_ID } from '../../foundation/scrollToSection';

const titleClass =
  'm-0 text-[20px] font-semibold leading-[1.35] text-embed-foreground-primary';

/** Shared gold heading — CAP UX 41 (prompt + section titles). */
const goldHeadingClass =
  'm-0 text-[18px] font-semibold leading-[1.45] text-embed-brand-gold';

const bodyClass =
  'm-0 text-[15px] leading-[1.65] text-embed-foreground-primary';

const softClass =
  'm-0 text-[14px] leading-[1.6] text-embed-foreground-primary/75';

/**
 * Bridge block inside Priority section — under cards (CAP UX 31).
 * Latent-card surface: page bg + 1 px gray border.
 */
export function PriorityChapterBridge() {
  const { phase, hypothesis } = usePriorityConversationContext();

  if (phase !== 'complete' || hypothesis === null) {
    return null;
  }

  return (
    <div
      id={PRIORITY_BRIDGE_ANCHOR_ID}
      tabIndex={-1}
      className="mt-[50px] rounded-[8px] border border-solid border-[#E3E3E3] bg-[#F7F6F4] p-[50px] mobile:mt-8 mobile:p-5"
      data-testid="priority-chapter-bridge"
      aria-label="Shrnutí priorit a další hodnota"
    >
      <div className="flex flex-col gap-5">
        <header className="mx-auto flex w-[75%] flex-col gap-3 mobile:w-full">
          <h2 className={titleClass} data-testid="priority-bridge-title">
            {PRIORITY_BRIDGE_TITLE}
          </h2>
          <p className={bodyClass}>{PRIORITY_BRIDGE_SUMMARY}</p>
        </header>

        {/* Full card width + expanded insight lines (CAP UX3 07). */}
        <div
          className="flex w-full flex-col gap-3"
          data-testid="priority-bridge-know"
        >
          <h3 className={goldHeadingClass}>{PRIORITY_BRIDGE_KNOW_HEADING}</h3>
          <p className={bodyClass}>{hypothesis.prioritiesLine}</p>
          <p
            className={bodyClass}
            data-testid="priority-bridge-hypothesis"
          >
            {hypothesis.pictureLine}
          </p>
          {hypothesis.insightLines.map((line) => (
            <p key={line} className={bodyClass}>
              {line}
            </p>
          ))}
          <p className={softClass}>{hypothesis.thanksLine}</p>
        </div>

        <div
          className="mx-auto flex w-[75%] flex-col gap-2 mobile:w-full"
          data-testid="priority-bridge-report"
        >
          <h3 className={goldHeadingClass}>{PRIORITY_BRIDGE_GAIN_HEADING}</h3>
          <p
            className={bodyClass}
            style={{ fontWeight: 700 }}
          >
            {PRIORITY_BRIDGE_REPORT_TITLE}
          </p>
          {PRIORITY_BRIDGE_REPORT_LINES.map((line) => (
            <p key={line} className={bodyClass}>
              {line}
            </p>
          ))}
        </div>

        <div
          className="mx-auto flex w-[75%] flex-col gap-2 mobile:w-full"
          data-testid="priority-bridge-next"
        >
          <h3 className={goldHeadingClass}>{PRIORITY_BRIDGE_NEXT_HEADING}</h3>
          {PRIORITY_BRIDGE_NEXT_LINES.map((line) => (
            <p key={line} className={bodyClass}>
              {line}
            </p>
          ))}
        </div>

        <div
          className="mx-auto w-[75%] border-t border-[#E3E3E3] pt-4 text-center mobile:w-full"
          data-testid="priority-bridge-crossroads"
        >
          <p className={goldHeadingClass}>
            {PRIORITY_CONVERSATION_NEXT_PATHS_PROMPT}
          </p>
          <p className="mt-2 whitespace-pre text-[18px] font-medium leading-[1.45] text-embed-foreground-primary mobile:whitespace-normal mobile:text-base">
            {`\u2199 ${PRIORITY_CONVERSATION_COMPLETION_FAQ_LABEL}            ${PRIORITY_CONVERSATION_COMPLETION_CHAT_LABEL} \u2198`}
          </p>
        </div>
      </div>
    </div>
  );
}
