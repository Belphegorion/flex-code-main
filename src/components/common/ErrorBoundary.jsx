import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console — could be extended to a logging service
    console.error('ErrorBoundary caught an error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="card p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">We encountered an unexpected error while rendering this page.</p>
            <pre className="text-xs text-left overflow-auto max-h-40 bg-gray-50 dark:bg-gray-800 p-2 rounded">{String(this.state.error)}</pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
