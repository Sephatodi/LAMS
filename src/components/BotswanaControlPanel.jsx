/** @jsxRuntime classic */
/** @jsx React.createElement */
import React from 'react';

import LayersIcon from '@mui/icons-material/Layers';
import { Box, Paper, Switch, Typography } from '@mui/material';

const BotswanaControlPanel = ({ state, dispatch, user }) => {
  return (
    <Paper elevation={3} sx={{
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 1000,
      p: 2,
      width: 300
    }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        <LayersIcon sx={{ mr: 1 }} />
        Map Layers
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Switch
          checked={state.activeLayers.parcels}
          onChange={() => dispatch({ type: 'TOGGLE_LAYER', payload: 'parcels' })}
        />
        <Typography>Land Parcels</Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Switch
          checked={state.activeLayers.boundaries}
          onChange={() => dispatch({ type: 'TOGGLE_LAYER', payload: 'boundaries' })}
        />
        <Typography>Tribal Boundaries</Typography>
      </Box>
      
      {user.role === 'admin' && (
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
          <Typography variant="subtitle2">Admin Tools</Typography>
          {/* Add admin-specific controls here */}
        </Box>
      )}
    </Paper>
  );
};

export default BotswanaControlPanel;