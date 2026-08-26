import { colors } from "@embed-engine/design-tokens";

import {
  PRIORITY_BRIDGE_TITLE,
  PRIORITY_PAYOFF_EXPLORATION_BULLETS,
  PRIORITY_PAYOFF_FACTS_HEADING,
  PRIORITY_PAYOFF_INTRO,
  PRIORITY_PAYOFF_MEANING_HEADING,
  PRIORITY_PAYOFF_PLOT_TRANSITION,
  PRIORITY_PAYOFF_RECALL_HEADING,
  PRIORITY_PAYOFF_RECALL_INTRO,
  PRIORITY_PAYOFF_UPPER_LINES,
} from "./priorityConversation.constants";
import { PRIORITY_ENGINE_TITLE_CLASS } from "./priority-engine-layout";
import { usePriorityConversationContext } from "./PriorityConversationProvider";
import { PRIORITY_BRIDGE_ANCHOR_ID } from "../../foundation/scrollToSection";
import { useDecisionSessionRuntime } from "../../runtime/DecisionSessionRuntimeProvider";

const bodyClass =
  "m-0 text-[15px] leading-[1.65] text-embed-foreground-primary";

const panelHeadingClass = "m-0 text-[17px] font-bold uppercase leading-[1.4]";

const goldIntenseStyle = { color: colors.brand.goldIntense };

const panelClass =
  "rounded-[8px] border border-solid border-[#E3E3E3] bg-[#F7F6F4] p-5 desktop:grid desktop:grid-rows-[48px_repeat(3,minmax(132px,1fr))]";

const payoffRowClass = `${bodyClass} relative flex flex-col items-start py-3 desktop:py-3`;

/**
 * Bridge block inside Priority section — under cards (CAP UX 31).
 * Latent-card surface: page bg + 1 px gray border.
 */
export function PriorityChapterBridge() {
  const { phase, hypothesis } = usePriorityConversationContext();
  const { experience, houseKnowledge } = useDecisionSessionRuntime();

  if (phase !== "complete" || hypothesis === null) {
    return null;
  }

  const roomMedia = experience.context.roomMedia;
  const recallImage = roomMedia.thumbnails.find(
    (item) =>
      item.kind === "photo" &&
      !/(?:^|\/)01\.(?:png|jpe?g|webp)$/i.test(item.src),
  );
  const roomTitle = roomMedia.title ?? "vybraný prostor";
  const interpretationByFactId = new Map(
    (houseKnowledge?.interpretations ?? []).map((item) => [
      item.factId,
      item.text,
    ]),
  );
  const payoffRows = (houseKnowledge?.facts ?? [])
    .flatMap((fact) => {
      const meaning = interpretationByFactId.get(fact.id);
      return meaning === undefined ||
        fact.factPoint === undefined ||
        fact.interpretationPoint === undefined
        ? []
        : [
            {
              factPoint: fact.factPoint,
              interpretationPoint: fact.interpretationPoint,
              fact: fact.statement,
              meaning,
            },
          ];
    })
    .slice(0, 3);

  return (
    <div
      id={PRIORITY_BRIDGE_ANCHOR_ID}
      tabIndex={-1}
      className="mt-[50px] w-full min-w-0 max-w-none bg-[#FFFFFF] py-[50px] mobile:mt-8 mobile:px-3 mobile:py-5"
      data-testid="priority-chapter-bridge"
      aria-label="Shrnutí priorit a další hodnota"
    >
      <div className="flex w-full min-w-0 max-w-none flex-col gap-8">
        <header className="flex w-full min-w-0 max-w-none flex-col gap-2">
          <h2
            className={`${PRIORITY_ENGINE_TITLE_CLASS} uppercase`}
            data-testid="priority-bridge-title"
          >
            {PRIORITY_BRIDGE_TITLE}
          </h2>
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {PRIORITY_PAYOFF_UPPER_LINES.map((line) => (
              <p key={line} className={bodyClass}>
                {line}
              </p>
            ))}
          </div>
        </header>

        <div
          className="grid w-full grid-cols-3 items-stretch gap-5 tabletMin:grid-cols-2 tabletMin:gap-4 tabletMax:grid-cols-3 mobile:grid-cols-1 mobile:gap-4"
          data-testid="priority-payoff-panels"
        >
          <section className={panelClass} data-testid="priority-payoff-facts">
            <h3 className={panelHeadingClass} style={goldIntenseStyle}>
              {PRIORITY_PAYOFF_FACTS_HEADING}
            </h3>
            {payoffRows.map((row, index) => (
              <div
                key={row.fact}
                className={`${payoffRowClass} ${index === 0 ? "" : "border-t border-[#E3E3E3]"}`}
              >
                <strong className="block uppercase">{row.factPoint}</strong>
                <span>{row.fact}</span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[calc(100%+10px)] top-[calc(0.75rem+1.4em/2)] z-10 hidden h-px w-[42px] -translate-y-1/2 bg-[#D9CDAF] before:absolute before:-left-1 before:top-1/2 before:h-2 before:w-2 before:-translate-y-1/2 before:rounded-full before:border before:border-[#D9CDAF] before:bg-[#F7F6F4] after:absolute after:-right-1 after:top-1/2 after:h-2 after:w-2 after:-translate-y-1/2 after:rounded-full after:border after:border-[#D9CDAF] after:bg-[#F7F6F4] desktop:block"
                />
              </div>
            ))}
          </section>

          <section className={panelClass} data-testid="priority-payoff-meaning">
            <h3 className={panelHeadingClass} style={goldIntenseStyle}>
              {PRIORITY_PAYOFF_MEANING_HEADING}
            </h3>
            {payoffRows.map((row, index) => (
              <p
                key={row.fact}
                className={`${payoffRowClass} ${index === 0 ? "" : "border-t border-[#E3E3E3]"}`}
              >
                <strong className="uppercase">{row.interpretationPoint}</strong>
                <span>{row.meaning}</span>
              </p>
            ))}
          </section>

          <section
            className="flex min-h-full flex-col rounded-[8px] border border-solid border-[#E3E3E3] bg-[#F7F6F4] p-5"
            data-testid="priority-payoff-recall"
          >
            <h3 className={panelHeadingClass} style={goldIntenseStyle}>
              {PRIORITY_PAYOFF_RECALL_HEADING}
            </h3>
            {recallImage ? (
              <img
                src={recallImage.src}
                alt={roomTitle}
                className="-mt-[2px] aspect-[4/3] w-full rounded-[6px] object-contain"
              />
            ) : null}
            <p className={`${bodyClass} mt-[30px]`}>
              {PRIORITY_PAYOFF_RECALL_INTRO}
            </p>
          </section>
        </div>

        <div className="mx-auto flex w-full min-w-0 max-w-[760px] flex-col items-center gap-2 text-center mobile:max-w-none">
          <p
            className="m-0 text-[18px] font-bold leading-[1.5]"
            style={goldIntenseStyle}
          >
            {PRIORITY_PAYOFF_INTRO}
          </p>
          <ul
            className={`${bodyClass} m-0 flex w-full min-w-0 max-w-[760px] list-disc flex-col gap-1.5 pl-12 text-left mobile:max-w-none mobile:pl-6`}
          >
            <li>
              {
                PRIORITY_PAYOFF_EXPLORATION_BULLETS[0].split(
                  "OTÁZKY A ODPOVĚDI",
                )[0]
              }
              <strong>OTÁZKY A ODPOVĚDI</strong>
              {
                PRIORITY_PAYOFF_EXPLORATION_BULLETS[0].split(
                  "OTÁZKY A ODPOVĚDI",
                )[1]
              }
            </li>
            <li>
              {
                PRIORITY_PAYOFF_EXPLORATION_BULLETS[1].split(
                  "DISKUTOVAT PŘES CHAT",
                )[0]
              }
              <strong>DISKUTOVAT PŘES CHAT</strong>
              {
                PRIORITY_PAYOFF_EXPLORATION_BULLETS[1].split(
                  "DISKUTOVAT PŘES CHAT",
                )[1]
              }
            </li>
            <li>
              {PRIORITY_PAYOFF_EXPLORATION_BULLETS[2].split("OSOBNÍ SOUHRN")[0]}
              <strong>OSOBNÍ SOUHRN</strong>
              {
                PRIORITY_PAYOFF_EXPLORATION_BULLETS[2]
                  .split("OSOBNÍ SOUHRN")[1]
                  .split("FAKTY A OBRÁZKY")[0]
              }
              <strong>FAKTY A OBRÁZKY</strong>
              {
                PRIORITY_PAYOFF_EXPLORATION_BULLETS[2].split(
                  "FAKTY A OBRÁZKY",
                )[1]
              }
            </li>
          </ul>
          <p className={`${bodyClass} font-bold`}>
            {PRIORITY_PAYOFF_PLOT_TRANSITION}
          </p>
        </div>
      </div>
    </div>
  );
}
