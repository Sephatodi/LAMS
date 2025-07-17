/** @jsxRuntime classic */
/** @jsx React.createElement */

// src/components/LayerErrorBoundary.jsx
import { ReportProblem } from '@mui/icons-material';
import { Alert, Box } from '@mui/material';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class LayerErrorBoundary extends Component {
  state = { error: null };

  static propTypes = {
    children: PropTypes.node,
    error: PropTypes.instanceOf(Error),
    fallback: PropTypes.func
  };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Layer Error:', error, errorInfo);
    // Log to error monitoring service
    if (window.Sentry) window.Sentry.captureException(error);
  }

  render() {
    const { error } = this.state;
    const { children, error: propsError, fallback } = this.props;

    if (error || propsError) {
      return fallback ? fallback(error || propsError) : (
        <Box sx={{ p: 2 }}>
          <Alert severity="error" icon={<ReportProblem />}>
            <strong>Layer Error:</strong> {(error || propsError).message}
          </Alert>
        </Box>
      );
    }

    return children;
  }
}