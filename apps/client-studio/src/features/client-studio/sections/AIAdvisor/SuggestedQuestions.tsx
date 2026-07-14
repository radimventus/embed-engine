const FAQ_ITEMS = [
  'Lorem ipsum dolor sit amet?',
  'Lorem ipsum dolor sit amet?',
  'Lorem ipsum dolor sit amet?',
  'Lorem ipsum dolor sit amet?',
  'Lorem ipsum dolor sit amet?',
  'Lorem ipsum dolor sit amet?',
] as const;

type SuggestedQuestionsProps = {
  onQuestionSelect: (question: string) => void;
};

export function SuggestedQuestions({ onQuestionSelect }: SuggestedQuestionsProps) {
  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <h2 className="text-sm font-bold tracking-wide text-embed-foreground-primary md:text-base">
        CO NAŠE KLIENTY NEJVÍCE ZAJÍMÁ:
      </h2>
      <ul className="mt-4 divide-y divide-embed-border-default border border-embed-border-default">
        {FAQ_ITEMS.map((question, index) => (
          <li key={index}>
            <button
              type="button"
              onClick={() => onQuestionSelect(question)}
              className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-sm text-embed-foreground-primary"
            >
              <span>{question}</span>
              <span aria-hidden="true" className="text-embed-foreground-tertiary">
                ▾
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
