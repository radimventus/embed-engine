import type { ReactNode } from 'react';

type DesktopCanvasProps = {
  children: ReactNode;
};

export function DesktopCanvas({ children }: DesktopCanvasProps) {
  return (
    <div className="flex min-h-full justify-center pt-section">
      <div className="w-canvas border border-embed-border-default bg-embed-background-primary">
        {children}
      </div>
    </div>
  );
}
