import type { ReactNode } from 'react';

type WorkspaceProps = {
  children?: ReactNode;
};

export function Workspace({ children }: WorkspaceProps) {
  return (
    <main className="flex min-w-0 flex-1 justify-center overflow-x-hidden bg-embed-background-secondary pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] desktop:pb-0">
      {children ?? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-embed-foreground-primary/45">Workspace</p>
        </div>
      )}
    </main>
  );
}
