import { useEffect, useMemo, useRef, useState } from 'react';

import { ConversationError } from '@embed-engine/ai';

import { SECTION_SURFACE_CLASS } from '../../section-surface';
import { useDecisionSessionRuntime } from '../../runtime/DecisionSessionRuntimeProvider';
import { useDecisionContext } from '../../runtime/useDecisionContext';
import { PILOT_SECTION_IDS } from '../../pilot/pilotVocabulary';
import {
  categorizeAiQuestion,
  useOptionalDecisionAnalytics,
} from '../../analytics';
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
import { getEmbedAIService } from './embedAIService';
import {
  advisorIntroFromAiContext,
  faqItemsFromAiContext,
  orderFaqItemsForPriorities,
} from './experiencePresentation';
import { InputBar } from './InputBar';
import { SectionHeader } from './SectionHeader';
import { FaqList, FaqTitle } from './SuggestedQuestions';
import {
  AI_LOADING_RESPONSE,
  createMessageId,
  formatMessageTime,
  type Message,
} from './types';

/**
 * AI Advisor — FAQ + intro from Runtime AIContext; live chat via AIService (PT-011).
 */
export function AIAdvisor() {
  const { experience } = useDecisionSessionRuntime();
  const decision = useDecisionContext();
  const analytics = useOptionalDecisionAnalytics();
  const ai = experience.context.decision.ai;
  const faqItems = useMemo(() => {
    const projected = faqItemsFromAiContext(ai);
    return orderFaqItemsForPriorities(
      projected,
      experience.context.decision.priorityIds,
    );
  }, [ai, experience.context.decision.priorityIds]);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: createMessageId(),
      role: 'assistant',
      text: advisorIntroFromAiContext(ai),
      time: formatMessageTime(new Date()),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const conversationLengthRef = useRef(1);
  conversationLengthRef.current = messages.length;
  const sendLockRef = useRef(false);

  useEffect(() => {
    analytics?.aiSessionOpened(ai.id);
    return () => {
      analytics?.aiSessionEnded(conversationLengthRef.current);
    };
  }, [ai.id, analytics]);

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
    if (!text || sendLockRef.current || isLoading) {
      return;
    }

    sendLockRef.current = true;
    setIsLoading(true);
    setInputValue('');

    const now = new Date();
    const time = formatMessageTime(now);
    const userId = createMessageId();
    const pendingId = createMessageId();

    setMessages((current) => [
      ...current,
      { id: userId, role: 'user', text, time },
      {
        id: pendingId,
        role: 'assistant',
        text: AI_LOADING_RESPONSE,
        time,
      },
    ]);

    void (async () => {
      try {
        const result = await getEmbedAIService().sendMessage({
          message: text,
          decision,
        });

        setMessages((current) =>
          current.map((message) =>
            message.id === pendingId
              ? {
                  ...message,
                  text: result.content,
                  time: formatMessageTime(new Date()),
                }
              : message,
          ),
        );

        analytics?.aiInteraction({
          questionCategory: categorizeAiQuestion(text),
          responseGenerated: true,
          clarificationRequested: false,
          conversationLength: conversationLengthRef.current,
        });
      } catch (error) {
        const userMessage =
          error instanceof ConversationError
            ? error.userMessage
            : 'Došlo k chybě při generování odpovědi. Zkuste to prosím znovu.';

        setMessages((current) =>
          current.map((message) =>
            message.id === pendingId
              ? {
                  ...message,
                  text: userMessage,
                  time: formatMessageTime(new Date()),
                }
              : message,
          ),
        );

        analytics?.aiInteraction({
          questionCategory: categorizeAiQuestion(text),
          responseGenerated: false,
          clarificationRequested: false,
          conversationLength: conversationLengthRef.current,
        });
      } finally {
        sendLockRef.current = false;
        setIsLoading(false);
      }
    })();
  };

  return (
    <section
      id={PILOT_SECTION_IDS.aiAdvisor}
      tabIndex={-1}
      aria-label="AI Advisor"
      className={`scroll-mt-header ${SECTION_SURFACE_CLASS}`}
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
            disabled={isLoading}
          />
        </div>

        <div className={AI_ADVISOR_DISCLAIMER_CELL_CLASS}>
          <Disclaimer />
        </div>
      </div>
    </section>
  );
}
