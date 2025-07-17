import { Alert } from '@mui/material';
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Alert severity="error">
          Something went wrong. {this.state.error?.message}
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;