// Error Boundary component
import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error details in development
    if (import.meta.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          border: '1px solid #ff6b6b',
          borderRadius: '8px',
          backgroundColor: '#ffe0e0',
          color: '#d63031',
          textAlign: 'center',
          margin: '20px'
        }}>
          <h2>Oops! Something went wrong</h2>
          <p>We're sorry, but something unexpected happened.</p>
          
          {import.meta.env.NODE_ENV === 'development' && (
            <details style={{ 
              marginTop: '20px', 
              textAlign: 'left',
              backgroundColor: '#fff',
              padding: '10px',
              borderRadius: '4px'
            }}>
              <summary>Error Details (Development Only)</summary>
              <pre style={{ margin: '10px 0', fontSize: '12px' }}>
                {this.state.error && this.state.error.toString()}
              </pre>
              <pre style={{ margin: '10px 0', fontSize: '12px' }}>
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
          
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#d63031',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
