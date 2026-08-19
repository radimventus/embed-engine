import { useEffect, useMemo, useRef, useState } from "react";
import { Panel } from "@embed-engine/ui";
import { SOCIAL_PROOF_TICK_MS } from "@embed-engine/core";

import { SocialProofIcon } from "./SocialProofIcon";
import {
  nextSocialProofIndex,
  SOCIAL_PROOF_MIN_MESSAGES_BEFORE_REPEAT,
  type SocialProofEntry,
  useSocialProofFeed,
} from "./useSocialProofFeed";

const FEED_TICKER_PAUSE_MS = SOCIAL_PROOF_TICK_MS;
const FEED_TICKER_SLIDE_MS = 400;
const FEED_VISIBLE_ITEM_COUNT = 3;
const FEED_RENDERED_ITEM_COUNT = FEED_VISIBLE_ITEM_COUNT + 1;

function SocialProofItem({ icon, value, text }: SocialProofEntry) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <SocialProofIcon name={icon} />
      <div className="min-w-0">
        <p className="text-sm leading-snug text-[#001930]">
          <span className="mr-2 text-2xl font-bold tracking-tight">
            {value}
          </span>
          {text}
        </p>
      </div>
    </div>
  );
}

export function SocialProof() {
  const [startIndex, setStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const recentMessagesRef = useRef<string[]>([]);
  const entries = useSocialProofFeed();
  const visibleEntries = useMemo(
    () =>
      Array.from(
        { length: Math.min(FEED_RENDERED_ITEM_COUNT, entries.length) },
        (_, offset) => entries[(startIndex + offset) % entries.length]!,
      ),
    [entries, startIndex],
  );

  useEffect(() => {
    if (entries.length === 0) {
      setStartIndex(0);
      setIsAnimating(false);
      return;
    }
    setStartIndex((current) => current % entries.length);
  }, [entries.length]);

  useEffect(() => {
    if (
      entries.length <= SOCIAL_PROOF_MIN_MESSAGES_BEFORE_REPEAT ||
      isAnimating
    ) {
      return;
    }
    const timer = window.setTimeout(
      () => setIsAnimating(true),
      FEED_TICKER_PAUSE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [entries.length, isAnimating, startIndex]);

  return (
    <Panel
      as="section"
      id="social-proof"
      tabIndex={-1}
      aria-label="Signály důvěry a rozhodování"
      data-landing-anchor="social-proof"
      variant="elevated"
      className="relative scroll-mt-header !bg-[#FFFFFF] text-[#001930]"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-[2px] z-10 h-px"
        style={{ backgroundColor: "#D4AF37" }}
      />
      <div className="hidden h-social-proof items-center overflow-hidden px-section desktop:flex">
        {entries.length > 0 ? (
          <ul
            className="m-0 flex w-[calc(400%/3)] list-none p-0"
            onTransitionEnd={() => {
              if (
                !isAnimating ||
                entries.length <= SOCIAL_PROOF_MIN_MESSAGES_BEFORE_REPEAT
              )
                return;
              setStartIndex((current) => {
                const next = nextSocialProofIndex(
                  current,
                  entries,
                  recentMessagesRef.current,
                );
                recentMessagesRef.current = [
                  ...recentMessagesRef.current,
                  entries[next]!.id,
                ].slice(-12);
                return next;
              });
              setIsAnimating(false);
            }}
            style={{
              transform: isAnimating
                ? "translateX(-25%)"
                : "translateX(0)",
              transition: isAnimating
                ? `transform ${FEED_TICKER_SLIDE_MS}ms linear`
                : "none",
            }}
          >
            {visibleEntries.map((entry, index) => (
              <li
                key={entry.id}
                className={[
                  "min-w-0 shrink-0 px-4",
                  index < FEED_VISIBLE_ITEM_COUNT - 1
                    ? "border-r border-[#D4AF37]/50"
                    : "",
                ].join(" ")}
                style={{ flexBasis: "25%" }}
              >
                <SocialProofItem {...entry} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {entries.length > 0 ? (
        <div className="desktop:hidden px-section py-3">
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {entries.slice(0, FEED_VISIBLE_ITEM_COUNT).map((entry) => (
              <li key={entry.id}>
                <SocialProofItem {...entry} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Panel>
  );
}
