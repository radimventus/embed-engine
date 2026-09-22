export const DECISION_TOPIC_CHAT_EVENT = "conis:decision-topic-chat" as const;

export type DecisionTopicChatDetail = {
  readonly houseId: string;
  readonly topicTitle: string;
};

export function decisionTopicChatPrompt(topicTitle: string): string {
  return `Co bych měl vědět k tématu „${topicTitle.trim()}“?`;
}

export function openDecisionTopicInChat(detail: DecisionTopicChatDetail): void {
  window.dispatchEvent(
    new CustomEvent<DecisionTopicChatDetail>(DECISION_TOPIC_CHAT_EVENT, {
      detail,
    }),
  );
}
