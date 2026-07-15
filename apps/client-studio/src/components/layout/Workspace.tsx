import type { ReactNode } from 'react';

type WorkspaceProps = {
  children?: ReactNode;
};

export function Workspace({ children }: WorkspaceProps) {
  return (
    <main className="flex flex-1 items-start justify-center overflow-x-auto overflow-y-auto bg-embed-background-secondary">
      {children ?? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-embed-foreground-tertiary">Workspace</p>
        </div>
      )}
    </main>
  );
}
