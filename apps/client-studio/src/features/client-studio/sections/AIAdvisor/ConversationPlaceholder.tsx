type MessageProps = {
  align: 'left' | 'right';
  time: string;
  text: string;
};

function Message({ align, time, text }: MessageProps) {
  return (
    <div className={align === 'right' ? 'flex flex-col items-end' : 'flex flex-col items-start'}>
      <div
        className={
          align === 'right'
            ? 'max-w-[85%] bg-embed-status-info/20 px-4 py-3 text-sm text-embed-foreground-primary'
            : 'max-w-[85%] bg-embed-background-tertiary px-4 py-3 text-sm text-embed-foreground-primary'
        }
      >
        {text}
      </div>
      <span className="mt-1 text-xs text-embed-foreground-muted">{time}</span>
    </div>
  );
}

export function ConversationPlaceholder() {
  return (
    <div className="mt-4 space-y-4">
      <Message
        align="left"
        time="10:40"
        text="Z prodeje 4–6 jednotek získáte zisk, který pokryje náklady na dům."
      />
      <Message align="right" time="10:42" text="Tento dům je i pro úzký pozemek?" />
      <Message
        align="left"
        time="10:43"
        text="Bezproblémový přístup, studie na míru a fotorealistické 3D vizualizace jsou součástí naší nabídky."
      />
    </div>
  );
}
