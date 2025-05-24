
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-fixlyfy-bg-interface">
          <div className="text-center p-8">
            <div className="w-16 h-16 rounded-xl fixlyfy-gradient flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto">
              F
            </div>
            <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
            <p className="text-fixlyfy-text-secondary mb-6 max-w-md">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <div className="space-x-4">
              <Button 
                onClick={() => window.location.reload()}
                className="bg-fixlyfy hover:bg-fixlyfy/90"
              >
                Refresh Page
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
              >
                Go to Dashboard
              </Button>
            </div>
            {this.state.error && (
              <details className="mt-6 text-left max-w-md mx-auto">
                <summary className="cursor-pointer text-sm text-fixlyfy-text-secondary">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
