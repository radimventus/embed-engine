import { Component, type ErrorInfo, type ReactNode } from 'react';

import { CLIENT_STUDIO_RELEASE } from '../features/client-studio/pilot/productionConfig';

type ErrorBoundaryProps = {
  readonly children: ReactNode;
};

type ErrorBoundaryState = {
  readonly error: Error | null;
};

/**
 * App-level error boundary (CSCB-01 / CSCB-09).
 * Catches render failures so Client Studio never fails silently.
 * Logs diagnostics without Runtime payloads or customer PII.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ClientStudio] Uncaught render error', {
      version: CLIENT_STUDIO_RELEASE.version,
      product: CLIENT_STUDIO_RELEASE.product,
      message: error.message,
      componentStack: info.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.error !== null) {
      return (
        <div
          role="alert"
          className="flex min-h-screen flex-col items-center justify-center gap-4 bg-embed-background-primary px-section text-embed-foreground-primary"
        >
          <h1 className="text-lg font-medium">Client Studio se nepodařilo načíst</h1>
          <p className="max-w-md text-center text-sm text-embed-foreground-primary/70">
            Obnovte stránku. Pokud problém přetrvá, kontaktujte podporu.
          </p>
          <button
            type="button"
            className="rounded-sm bg-embed-brand-navy px-4 py-2 text-sm text-embed-background-primary"
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
          >
            Obnovit stránku
          </button>
          <p className="text-xs text-embed-foreground-primary/40">
            {CLIENT_STUDIO_RELEASE.product} v{CLIENT_STUDIO_RELEASE.version}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
