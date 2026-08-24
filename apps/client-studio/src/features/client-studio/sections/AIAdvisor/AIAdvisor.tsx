import { useEffect, useMemo, useRef, useState } from 'react';

import { ConversationError } from '@embed-engine/ai';
import { canonicalHouseKnowledgeEntries } from '@embed-engine/object-house';

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
  advisorOpeningForExperience,
  faqItemsFromCanonicalHouseKnowledge,
  faqItemsForExperience,
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

function createAssistantSeed(text: string): Message {
  return {
    id: createMessageId(),
    role: 'assistant',
    text,
    time: formatMessageTime(new Date()),
  };
}

/**
 * AI Advisor — Priority coaching FAQ + seeded chat; live replies via AIService.
 */
export function AIAdvisor() {
  const { experience, houseKnowledge, dispatch } = useDecisionSessionRuntime();
  const decision = useDecisionContext();
  const analytics = useOptionalDecisionAnalytics();
  const ai = experience.context.decision.ai;
  const priorityIds = experience.context.decision.priorityIds;
  const faqItems = useMemo(
    () =>
      houseKnowledge !== null && houseKnowledge.priorityFaq.length > 0
        ? faqItemsFromCanonicalHouseKnowledge(houseKnowledge)
        : faqItemsForExperience({ ai, priorityIds }),
    [ai, houseKnowledge, priorityIds],
  );
  const openingText = useMemo(
    () => advisorOpeningForExperience({ ai, priorityIds }),
    [ai, priorityIds],
  );
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => [
    createAssistantSeed(openingText),
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const conversationLengthRef = useRef(1);
  conversationLengthRef.current = messages.length;
  const sendLockRef = useRef(false);
  const userHasSpokenRef = useRef(false);

  useEffect(() => {
    analytics?.aiSessionOpened(ai.id);
    return () => {
      analytics?.aiSessionEnded(conversationLengthRef.current);
    };
  }, [ai.id, analytics]);

  useEffect(() => {
    if (userHasSpokenRef.current) {
      return;
    }
    setMessages([createAssistantSeed(openingText)]);
  }, [ai.id, openingText]);

  const handleQuestionSelect = (question: string) => {
    setInputValue(question);
  };

  const handleQuestionOpened = (item: (typeof faqItems)[number]) => {
    dispatch({
      type: 'OpenQuestion',
      questionId: item.id,
      prompt: item.question,
    });
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || sendLockRef.current || isLoading) {
      return;
    }

    userHasSpokenRef.current = true;
    sendLockRef.current = true;
    setIsLoading(true);
    setInputValue('');

    const now = new Date();
    const time = formatMessageTime(now);
    const userId = createMessageId();
    const pendingId = createMessageId();
    dispatch({
      type: 'SubmitChatQuestion',
      questionId: userId,
    });

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
        console.info("[T72-CHAT-TRACE] AIAdvisor before sendMessage", {
          messageLength: text.length,
          hasWindowDelivery:
            typeof window !== 'undefined' &&
            typeof window.__EMBED_AI_DELIVERY__?.deliveryUrl === 'string',
          windowDeliveryUrl:
            typeof window !== 'undefined'
              ? window.__EMBED_AI_DELIVERY__?.deliveryUrl ?? null
              : null,
        });

        const result = await getEmbedAIService().sendMessage({
          message: text,
          decision,
          object:
            houseKnowledge === null
              ? undefined
              : {
                  objectId: houseKnowledge.canonicalHouseId,
                  knowledge: {
                    entries: canonicalHouseKnowledgeEntries(houseKnowledge),
                  },
                },
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
          <FaqList
            items={faqItems}
            onQuestionSelect={handleQuestionSelect}
            onQuestionOpened={handleQuestionOpened}
          />
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
