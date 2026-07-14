import { useState } from 'react';

import { Conversation } from './Conversation';
import { Disclaimer } from './Disclaimer';
import { InputBar } from './InputBar';
import { SectionHeader } from './SectionHeader';
import { SuggestedQuestions } from './SuggestedQuestions';
import {
  AI_PLACEHOLDER_RESPONSE,
  INITIAL_MESSAGES,
  createMessageId,
  formatMessageTime,
} from './types';
import type { Message } from './types';

export function AIAdvisor() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

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
    <section aria-label="AI Advisor" className="border-b border-embed-border-default">
      <div className="grid grid-cols-2 divide-x divide-embed-border-default">
        <SuggestedQuestions onQuestionSelect={handleQuestionSelect} />
        <div className="px-4 py-6 md:px-8 md:py-8">
          <SectionHeader />
          <Conversation messages={messages} />
          <InputBar value={inputValue} onChange={setInputValue} onSend={handleSend} />
          <Disclaimer />
        </div>
      </div>
    </section>
  );
}
