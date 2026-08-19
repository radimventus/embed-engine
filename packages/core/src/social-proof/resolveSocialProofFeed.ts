import {
  resolveSocialProofDataset,
  type SocialProofGroup,
  type SocialProofTopic,
} from "./socialProofCatalog";
import {
  presentSocialProofMetric,
  presentSocialProofSignal,
  type SocialProofPresentationIcon,
} from "./socialProofPresentation";
import type { LiveSocialProofSignal } from "./socialProofSignal";

/**
 * Framework-neutral, render-ready customer Social Proof contract.
 * All customer surfaces consume this shape instead of composing proof copy.
 */
export type SocialProofDisplayItem = {
  readonly id: string;
  readonly group: SocialProofGroup;
  readonly topic: SocialProofTopic;
  readonly topicFamily: SocialProofTopicFamily;
  readonly icon: SocialProofPresentationIcon;
  readonly value: string;
  readonly text: string;
};

export const SOCIAL_PROOF_TOPIC_FAMILIES = {
  LAND_VALIDATION: "land_validation",
  LAND_SEARCH: "land_search",
  PDF: "pdf",
  RETURN_TO_TOUR: "return_after_priorities",
  RETURN_SHARE: "return_after_priorities",
  OWN_QUESTION: "own_question",
  TOP_PRIORITY: "top_priority",
  SET_PRIORITIES: "priorities_set",
  FAQ: "faq",
  CHAT: "chat",
  LIVE_HOUSE_VIEWERS: "house_view",
  LIVE_SETTING_PRIORITIES: "priorities_set",
  LIVE_FAQ: "faq",
  LIVE_CHAT: "chat",
  LIVE_LAND_VALIDATION: "land_validation",
} as const satisfies Record<SocialProofTopic, string>;
export type SocialProofTopicFamily =
  (typeof SOCIAL_PROOF_TOPIC_FAMILIES)[SocialProofTopic];

export type ResolveSocialProofFeedInput = {
  readonly houseId: string;
  readonly isReferenceHouse: boolean;
  /**
   * Only verified concurrent-presence signals belong here. Its absence means
   * there is no LIVE item; this resolver never estimates or invents one.
   */
  readonly live?: readonly LiveSocialProofSignal[];
};

function displayItem(
  group: SocialProofGroup,
  topic: SocialProofTopic,
  presentation: {
    readonly id: string;
    readonly icon: SocialProofPresentationIcon;
    readonly value: string;
    readonly text: string;
  },
): SocialProofDisplayItem {
  return Object.freeze({
    group,
    topic,
    topicFamily: SOCIAL_PROOF_TOPIC_FAMILIES[topic],
    ...presentation,
  });
}

export function resolveSocialProofFeed(
  input: ResolveSocialProofFeedInput,
): readonly SocialProofDisplayItem[] {
  const dataset = resolveSocialProofDataset(input);
  if (dataset === null) return Object.freeze([]);

  const historical = dataset.historical.flatMap((metric) => {
    const presentation = presentSocialProofMetric(metric);
    return presentation === null
      ? []
      : [displayItem(metric.group, metric.topic, presentation)];
  });
  const live = (input.live ?? []).flatMap((signal) => {
    if (signal.houseId !== input.houseId) return [];
    const presentation = presentSocialProofSignal(signal);
    return presentation === null
      ? []
      : [displayItem("LIVE", "LIVE_HOUSE_VIEWERS", presentation)];
  });

  return Object.freeze([...historical, ...live]);
}
