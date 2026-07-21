import { useEffect, useState } from 'react';
import type { Interpretation } from '@embed-engine/core/cognitive';

import {
  applyQuestionOpened,
  useApplyCognitiveSignal,
} from '../../cognitive/CognitiveRuntimeContext';
import { useInterpretation } from '../../cognitive/InterpretationProvider';
import { SECTION_SURFACE_CLASS } from '../../section-surface';
import {
  AI_ADVISOR_CONVERSATION_CELL_CLASS,
  AI_ADVISOR_DISCLAIMER_CELL_CLASS,
  AI_ADVISOR_FAQ_COLUMN_CELL_CLASS,
  AI_ADVISOR_GRID_CLASS,
  AI_ADVISOR_HEADER_CELL_CLASS,
  AI_ADVISOR_INPUT_CELL_CLASS,
  AI_CHAT_CONTENT_CONTAINER_CLASS,
} from './ai-advisor-layout';
import { Conversation } from './Conversation';
import { Disclaimer } from './Disclaimer';
import { InputBar } from './InputBar';
import { SectionHeader } from './SectionHeader';
import { FaqList, FaqTitle } from './SuggestedQuestions';
import {
  createMessageId,
  formatMessageTime,
  type Message,
} from './types';

/**
 * Resolve Signal topicId from Interpretation only (no DecisionState / Runtime).
 */
function topicIdFromInterpretation(interpretation: Interpretation): string {
  const focused = interpretation.priorities.find((priority) => priority.weight === 1);
  if (focused !== undefined) {
    return focused.id;
  }

  const highlightedFaq = interpretation.recommendedQuestions.find(
    (question) => question.highlighted,
  );
  if (highlightedFaq !== undefined) {
    return highlightedFaq.topicId;
  }

  return interpretation.recommendedQuestions[0]?.topicId ?? 'layout';
}

/**
 * AI + FAQ renderer — conversation framing from Interpretation.
 * Local messages are presentation transcript only (not Cognitive truth).
 * Intents leave only as Signals via Runtime binding.
 */
export function AIAdvisor() {
  const interpretation = useInterpretation();
  const applySignal = useApplyCognitiveSignal();
  const [inputValue, setInputValue] = useState(interpretation.nextAction);
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'context-1',
      role: 'assistant',
      text: interpretation.conversationContext,
      time: formatMessageTime(new Date()),
    },
  ]);
  const [lastTopic, setLastTopic] = useState(interpretation.activeTopic);

  useEffect(() => {
    setInputValue(interpretation.nextAction);
  }, [interpretation.nextAction]);

  useEffect(() => {
    if (interpretation.activeTopic === lastTopic) {
      return;
    }

    setLastTopic(interpretation.activeTopic);
    setMessages((current) => [
      ...current,
      {
        id: createMessageId(),
        role: 'assistant',
        text: `${interpretation.conversationContext} ${interpretation.recommendations[0] ?? ''}`.trim(),
        time: formatMessageTime(new Date()),
      },
    ]);
  }, [
    interpretation.activeTopic,
    interpretation.conversationContext,
    interpretation.recommendations,
    lastTopic,
  ]);

  const handleQuestionSelect = (question: string, topicId: string) => {
    setInputValue(question);
    applyQuestionOpened(
      applySignal,
      topicId,
      `Question opened: ${question.slice(0, 48)}`,
    );
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) {
      return;
    }

    const topicId = topicIdFromInterpretation(interpretation);

    applyQuestionOpened(applySignal, topicId, `Question asked: ${text.slice(0, 48)}`);

    const time = formatMessageTime(new Date());
    setMessages((current) => [
      ...current,
      {
        id: createMessageId(),
        role: 'user',
        text,
        time,
      },
      {
        id: createMessageId(),
        role: 'assistant',
        text: `Understood — staying with ${interpretation.activeTopic}. ${interpretation.nextAction}`,
        time,
      },
    ]);
    setInputValue('');
  };

  return (
    <section aria-label="AI Advisor" className={SECTION_SURFACE_CLASS}>
      <div className={AI_ADVISOR_GRID_CLASS}>
        <div className={AI_ADVISOR_FAQ_COLUMN_CELL_CLASS}>
          <FaqTitle />
          <FaqList onQuestionSelect={handleQuestionSelect} />
        </div>

        <div className={AI_ADVISOR_HEADER_CELL_CLASS}>
          <SectionHeader />
          <p
            className="mt-2 text-[11px] leading-snug text-embed-foreground-primary/55"
            data-testid="ai-active-topic"
          >
            Active Priority: {interpretation.activeTopic}
          </p>
          <p
            className="mt-1 text-xs leading-relaxed text-embed-foreground-primary/70 transition-opacity duration-300"
            data-testid="ai-conversation-context"
          >
            {interpretation.conversationContext}
          </p>
        </div>

        <div className={AI_ADVISOR_CONVERSATION_CELL_CLASS}>
          <div className={AI_CHAT_CONTENT_CONTAINER_CLASS}>
            <Conversation messages={messages} />
          </div>
        </div>

        <div className={AI_ADVISOR_INPUT_CELL_CLASS}>
          <p
            className="mb-2 text-[11px] text-embed-brand-gold"
            data-testid="ai-next-action"
          >
            Next Step: {interpretation.nextAction}
          </p>
          <InputBar value={inputValue} onChange={setInputValue} onSend={handleSend} />
        </div>

        <div className={AI_ADVISOR_DISCLAIMER_CELL_CLASS}>
          <Disclaimer />
        </div>
      </div>
    </section>
  );
}
