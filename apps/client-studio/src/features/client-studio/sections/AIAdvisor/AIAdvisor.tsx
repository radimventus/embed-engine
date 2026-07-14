import { ConversationPlaceholder } from './ConversationPlaceholder';
import { Disclaimer } from './Disclaimer';
import { InputBar } from './InputBar';
import { SectionHeader } from './SectionHeader';
import { SuggestedQuestions } from './SuggestedQuestions';

export function AIAdvisor() {
  return (
    <section aria-label="AI Advisor" className="border-b border-embed-border-default">
      <div className="grid grid-cols-2 divide-x divide-embed-border-default">
        <SuggestedQuestions />
        <div className="px-4 py-6 md:px-8 md:py-8">
          <SectionHeader />
          <ConversationPlaceholder />
          <InputBar />
          <Disclaimer />
        </div>
      </div>
    </section>
  );
}
