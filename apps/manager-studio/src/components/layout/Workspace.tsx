import type { ReactNode } from 'react';

type WorkspaceProps = {
  readonly children?: ReactNode;
};

export function Workspace({ children }: WorkspaceProps) {
  return (
    <main className="flex flex-1 justify-center bg-embed-background-secondary">
      {children ?? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-embed-foreground-primary/45">Workspace</p>
        </div>
      )}
    </main>
  );
}
