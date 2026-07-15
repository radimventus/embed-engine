import type { ReactNode } from 'react';

type DesktopCanvasProps = {
  children: ReactNode;
};

export function DesktopCanvas({ children }: DesktopCanvasProps) {
  return (
    <div
      data-desktop-canvas
      className="box-border w-canvas min-w-canvas max-w-canvas shrink-0 grow-0 self-start border border-embed-border-default bg-embed-background-primary pb-section pt-section mobile:max-w-none mobile:min-w-0 mobile:w-full"
    >
      {children}
    </div>
  );
}
