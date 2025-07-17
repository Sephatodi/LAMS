// src/components/WaterResourcePopup.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { 
  Box, Typography, Divider, Chip, 
  LinearProgress, Button 
} from '@mui/material';
import { 
  LeakAdd, Speed, Construction, 
  Timeline, Info 
} from '@mui/icons-material';

const WaterResourcePopup = React.memo(({ feature, analysis }) => {
  const efficiencyPercentage = Math.min(100, Math.max(0, analysis.efficiency));

  return (
    <Box sx={{ minWidth: 250, p: 1 }}>
      <Typography variant="h6" gutterBottom>
        <Info sx={{ verticalAlign: 'middle', mr: 1 }} />
        {feature.properties.asset_id || 'Water Asset'}
      </Typography>
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Speed color="primary" sx={{ mr: 1 }} />
        <Typography variant="body2">
          Pressure: <strong>{analysis.pressure.toFixed(1)} kPa</strong>
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Timeline color="primary" sx={{ mr: 1 }} />
        <Typography variant="body2">
          Flow: <strong>{analysis.flowRate.toFixed(2)} l/s</strong>
        </Typography>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" display="block">
          System Efficiency
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={efficiencyPercentage}
          color={
            efficiencyPercentage > 75 ? 'success' :
            efficiencyPercentage > 50 ? 'warning' : 'error'
          }
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Typography variant="caption" display="block" textAlign="right">
          {efficiencyPercentage}%
        </Typography>
      </Box>
      
      {analysis.leakDetected && (
        <Chip
          icon={<LeakAdd />}
          label="LEAK DETECTED"
          color="error"
          size="small"
          sx={{ mb: 1 }}
        />
      )}
      
      {analysis.recommendations.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" gutterBottom>
            <Construction sx={{ verticalAlign: 'middle', mr: 1 }} />
            Recommendations
          </Typography>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            {analysis.recommendations.map((rec, i) => (
              <li key={i}>
                <Typography variant="body2">{rec}</Typography>
              </li>
            ))}
          </ul>
        </>
      )}
      
      <Button 
        variant="outlined" 
        size="small" 
        fullWidth 
        sx={{ mt: 1 }}
        onClick={() => window.open(`/assets/${feature.properties.asset_id}`)}
      >
        View Details
      </Button>
    </Box>
  );
});

WaterResourcePopup.propTypes = {
  feature: PropTypes.object.isRequired,
  analysis: PropTypes.shape({
    pressure: PropTypes.number,
    flowRate: PropTypes.number,
    leakDetected: PropTypes.bool,
    efficiency: PropTypes.number,
    recommendations: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
};

export default WaterResourcePopup;