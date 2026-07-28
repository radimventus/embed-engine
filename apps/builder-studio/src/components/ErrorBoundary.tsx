import { Component, type ErrorInfo, type ReactNode } from 'react';

import { BUILDER_STUDIO_RELEASE } from '../features/builder-studio/release';

type ErrorBoundaryProps = {
  readonly children: ReactNode;
};

type ErrorBoundaryState = {
  readonly error: Error | null;
};

/**
 * App-level error boundary (EPIC-BLD-01).
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
    console.error('[BuilderStudio] Uncaught render error', {
      version: BUILDER_STUDIO_RELEASE.version,
      product: BUILDER_STUDIO_RELEASE.product,
      message: error.message,
      componentStack: info.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.error !== null) {
      return (
        <div
          role="alert"
          className="flex min-h-screen flex-col items-center justify-center gap-4 bg-builder-canvas px-8 text-builder-ink"
        >
          <h1 className="text-lg font-medium">
            Builder Studio se nepodařilo načíst
          </h1>
          <p className="max-w-md text-center text-sm text-builder-muted">
            Obnovte stránku. Pokud problém přetrvá, kontaktujte podporu.
          </p>
          <button
            type="button"
            className="rounded-xl bg-builder-navy px-4 py-2 text-sm font-semibold text-white"
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
          >
            Obnovit stránku
          </button>
          <p className="text-xs text-builder-muted">
            {BUILDER_STUDIO_RELEASE.product} v{BUILDER_STUDIO_RELEASE.version}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
