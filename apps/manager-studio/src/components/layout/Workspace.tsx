import type { ReactNode } from 'react';

type WorkspaceProps = {
  readonly children?: ReactNode;
};

/**
 * VR-FIX-01 — Manager working surface (scrolls inside sticky shell).
 */
export function Workspace({ children }: WorkspaceProps) {
  return (
    <main className="mx-auto w-full max-w-[1520px] px-8 py-7">
      {children ?? (
        <div className="flex flex-1 items-center justify-center py-16">
          <p className="text-sm text-[#64748B]">Workspace</p>
        </div>
      )}
    </main>
  );
}
