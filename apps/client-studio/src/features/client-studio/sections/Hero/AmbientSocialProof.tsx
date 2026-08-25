import { useEffect, useRef, useState } from "react";

import { SocialProofIcon } from "./SocialProofIcon";
import {
  nextSocialProofIndex,
  SOCIAL_PROOF_MIN_MESSAGES_BEFORE_REPEAT,
  useSocialProofFeed,
} from "./useSocialProofFeed";

const INITIAL_DELAY_MS = 10000;
const DWELL_MS = 6000;
const NEXT_DELAY_MS = 12000;

function pageIsSuppressed(): boolean {
  const active = document.activeElement;
  const priorityConversation = document.querySelector(
    '[data-testid="priority-conversation"]',
  );
  const priorityRect = priorityConversation?.getBoundingClientRect();
  const priorityIsVisible =
    priorityRect !== undefined &&
    priorityRect !== null &&
    priorityRect.bottom > 0 &&
    priorityRect.top < window.innerHeight;
  return (
    document.querySelector(
      '[role="dialog"][aria-modal="true"]:not([data-embed-overlay])',
    ) !== null ||
    priorityIsVisible ||
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement ||
    active instanceof HTMLSelectElement ||
    active?.getAttribute("contenteditable") === "true"
  );
}

export function AmbientSocialProof({
  enabled,
  journeyHasLeftMain,
}: {
  readonly enabled: boolean;
  readonly journeyHasLeftMain: boolean;
}) {
  const entries = useSocialProofFeed();
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [hasShown, setHasShown] = useState(false);
  const [retry, setRetry] = useState(0);
  const recentMessagesRef = useRef<string[]>([]);

  useEffect(() => {
    if (
      !enabled ||
      !journeyHasLeftMain ||
      entries.length === 0 ||
      (hasShown && entries.length <= SOCIAL_PROOF_MIN_MESSAGES_BEFORE_REPEAT)
    ) {
      setVisible(false);
      return;
    }
    const delay = hasShown ? NEXT_DELAY_MS : INITIAL_DELAY_MS;
    const showTimer = window.setTimeout(() => {
      if (!pageIsSuppressed()) {
        setVisible(true);
        setHasShown(true);
      } else {
        setRetry((current) => current + 1);
      }
    }, delay);
    return () => window.clearTimeout(showTimer);
  }, [enabled, entries.length, hasShown, index, journeyHasLeftMain, retry]);

  useEffect(() => {
    if (!visible) return;
    const hideTimer = window.setTimeout(() => {
      setVisible(false);
      if (entries.length > SOCIAL_PROOF_MIN_MESSAGES_BEFORE_REPEAT) {
        setIndex((current) => {
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
      }
    }, DWELL_MS);
    return () => window.clearTimeout(hideTimer);
  }, [entries, visible]);

  if (!visible || !enabled || !journeyHasLeftMain || entries.length === 0)
    return null;
  const entry = entries[index % entries.length]!;

  return (
    <aside
      aria-live="polite"
      aria-label="Signál důvěry"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(20px+var(--guided-journey-bottom-nav-offset,0px))] z-40 flex justify-start px-section desktop:ml-sidebar"
    >
      <div className="flex max-w-[32rem] items-center gap-3 rounded-xl border border-[#D4AF37]/40 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
        <SocialProofIcon name={entry.icon} />
        <p className="text-sm leading-snug text-[#001930]">
          <span className="mr-2 text-xl font-bold tracking-tight">
            {entry.value}
          </span>
          {entry.text}
        </p>
      </div>
    </aside>
  );
}
