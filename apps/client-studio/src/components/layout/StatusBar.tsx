type StatusBarProps = {
  status?: string;
};

export function StatusBar({ status = 'READY' }: StatusBarProps) {
  return (
    <footer className="flex h-8 shrink-0 items-center border-t border-embed-border-default bg-embed-background-secondary px-6">
      <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-embed-foreground-primary/45">
        <span className="text-embed-status-ready">●</span>
        {status}
      </span>
    </footer>
  );
}
