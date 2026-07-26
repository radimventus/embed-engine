/**
 * Soft “Conis is thinking” cue — not a loading spinner.
 */
export function ConisThinkingDots({ className = '' }: { className?: string }) {
  return (
    <p
      className={`flex items-center gap-1 text-[18px] leading-none tracking-[0.12em] text-embed-brand-gold ${className}`}
      data-testid="priority-conversation-thinking"
      aria-label="Conis přemýšlí"
    >
      <span className="inline-block animate-pulse opacity-40">•</span>
      <span
        className="inline-block animate-pulse opacity-70"
        style={{ animationDelay: '180ms' }}
      >
        ••
      </span>
      <span
        className="inline-block animate-pulse"
        style={{ animationDelay: '360ms' }}
      >
        •••
      </span>
    </p>
  );
}
