import type { ReactNode } from 'react';

type DesktopCanvasProps = {
  children: ReactNode;
};

export function DesktopCanvas({ children }: DesktopCanvasProps) {
  return (
    <div
      data-desktop-canvas
      className="box-border w-full min-w-0 max-w-none shrink-0 grow-0 self-start overflow-x-hidden bg-embed-background-primary pt-0 desktop:w-canvas desktop:min-w-canvas desktop:max-w-canvas"
    >
      {children}
    </div>
  );
}
