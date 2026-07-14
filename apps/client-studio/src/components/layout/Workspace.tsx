import type { ReactNode } from 'react';

type WorkspaceProps = {
  children?: ReactNode;
};

export function Workspace({ children }: WorkspaceProps) {
  return (
    <main className="flex flex-1 items-center justify-center bg-embed-background-primary">
      {children ?? <p className="text-sm text-embed-foreground-tertiary">Workspace</p>}
    </main>
  );
}
