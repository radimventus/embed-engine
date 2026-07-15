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
    <div className="flex h-full flex-col px-section py-section">
      <h2 className="text-base font-bold tracking-wide text-embed-brand-navy">
        CO NAŠE KLIENTY NEJVÍCE ZAJÍMÁ:
      </h2>
      <ul className="mt-section flex flex-1 flex-col divide-y divide-embed-border-default border border-embed-border-default">
        {FAQ_ITEMS.map((question, index) => (
          <li key={index} className="flex flex-1">
            <button
              type="button"
              onClick={() => onQuestionSelect(question)}
              className="flex flex-1 cursor-pointer items-center justify-between px-section text-left text-sm text-embed-foreground-primary"
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
