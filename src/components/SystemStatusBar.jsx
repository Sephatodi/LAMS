/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

// src/components/SystemStatusBar.js
import { CheckCircle, Error, Warning } from '@mui/icons-material';
import { Box, CircularProgress, Typography } from '@mui/material';

const SystemStatusBar = ({ status = {} }) => {
  const { isOnline, isLoading, lastSync, error } = status;

  return (
    <Box display="flex" alignItems="center" ml={2}>
      {isLoading ? (
        <>
          <CircularProgress size={20} color="inherit" />
          <Typography variant="caption" ml={1}>Syncing...</Typography>
        </>
      ) : error ? (
        <>
          <Error color="error" fontSize="small" />
          <Typography variant="caption" ml={1} color="error">Error</Typography>
        </>
      ) : !isOnline ? (
        <>
          <Warning color="warning" fontSize="small" />
          <Typography variant="caption" ml={1} color="warning">Offline</Typography>
        </>
      ) : (
        <>
          <CheckCircle color="success" fontSize="small" />
          <Typography variant="caption" ml={1}>Online{lastSync && ` • ${new Date(lastSync).toLocaleTimeString()}`}</Typography>
        </>
      )}
    </Box>
  );
};

export default SystemStatusBar;