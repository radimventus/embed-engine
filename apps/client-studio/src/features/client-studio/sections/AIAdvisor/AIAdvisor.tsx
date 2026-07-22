import { useEffect, useMemo, useState } from 'react';

import { SECTION_SURFACE_CLASS } from '../../section-surface';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
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
import {
  advisorIntroFromAiContext,
  faqItemsFromAiContext,
} from './experiencePresentation';
import { InputBar } from './InputBar';
import { SectionHeader } from './SectionHeader';
import { FaqList, FaqTitle } from './SuggestedQuestions';
import {
  AI_PLACEHOLDER_RESPONSE,
  createMessageId,
  formatMessageTime,
  type Message,
} from './types';

/**
 * AI Advisor — FAQ + intro render from Runtime AIContext.
 * No hardcoded semantic Q&A or seed conversation copy (ED-DA-01R).
 */
export function AIAdvisor() {
  const { experience } = useDecisionSessionRuntime();
  const ai = experience.context.decision.ai;
  const faqItems = useMemo(() => faqItemsFromAiContext(ai), [ai]);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: createMessageId(),
      role: 'assistant',
      text: advisorIntroFromAiContext(ai),
      time: formatMessageTime(new Date()),
    },
  ]);

  useEffect(() => {
    setMessages([
      {
        id: createMessageId(),
        role: 'assistant',
        text: advisorIntroFromAiContext(ai),
        time: formatMessageTime(new Date()),
      },
    ]);
  }, [ai.id]);

  const handleQuestionSelect = (question: string) => {
    setInputValue(question);
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) {
      return;
    }

    const now = new Date();
    const time = formatMessageTime(now);

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
        text: AI_PLACEHOLDER_RESPONSE,
        time,
      },
    ]);
    setInputValue('');
  };

  return (
    <section
      aria-label="AI Advisor"
      className={SECTION_SURFACE_CLASS}
      data-ai-context-id={ai.id}
    >
      <div className={AI_ADVISOR_GRID_CLASS}>
        <div className={AI_ADVISOR_FAQ_COLUMN_CELL_CLASS}>
          <FaqTitle />
          <FaqList items={faqItems} onQuestionSelect={handleQuestionSelect} />
        </div>

        <div className={AI_ADVISOR_HEADER_CELL_CLASS}>
          <SectionHeader />
        </div>

        <div className={AI_ADVISOR_CONVERSATION_CELL_CLASS}>
          <div className={AI_CHAT_CONTENT_CONTAINER_CLASS}>
            <Conversation messages={messages} />
          </div>
        </div>

        <div className={AI_ADVISOR_INPUT_CELL_CLASS}>
          <InputBar
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
          />
        </div>

        <div className={AI_ADVISOR_DISCLAIMER_CELL_CLASS}>
          <Disclaimer />
        </div>
      </div>
    </section>
  );
}
