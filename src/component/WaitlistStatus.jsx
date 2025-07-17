/** @jsxRuntime classic */
/** @jsx React.createElement */

import { HourglassEmpty, Info } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, LinearProgress, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

const WaitlistStatus = ({ position }) => {
  // State for tracking previous position
  const [prevPosition, setPrevPosition] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // Effect to track position changes and show notifications
  useEffect(() => {
    if (position && prevPosition && position !== prevPosition) {
      if (position < prevPosition) {
        enqueueSnackbar(`Your position improved from #${prevPosition} to #${position}`, { 
          variant: 'success',
          autoHideDuration: 3000
        });
      }
      setPrevPosition(position);
    } else if (position && !prevPosition) {
      setPrevPosition(position);
    }
  }, [position, prevPosition, enqueueSnackbar]);

  // Enhanced time estimation
  const calculateTime = (pos) => {
    if (!pos) return 'Calculating...';
    const avgProcessingTime = 15; // minutes per application
    const totalMinutes = pos * avgProcessingTime;
    
    if (totalMinutes < 60) return `${totalMinutes} minutes`;
    if (totalMinutes < 1440) return `${Math.floor(totalMinutes / 60)} hours`;
    return `${Math.floor(totalMinutes / 1440)} days`;
  };

  const getStatusLevel = (pos) => {
    if (!pos) return 'unknown';
    if (pos <= 10) return 'high';
    if (pos <= 50) return 'medium';
    return 'low';
  };

  const status = getStatusLevel(position);

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <HourglassEmpty sx={{ mr: 1 }} />
          Application Queue Status
        </Typography>
        
        {position ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" sx={{ mr: 2 }}>
                #{position}
              </Typography>
              <Chip 
                label={
                  status === 'high' ? 'Processing Soon' : 
                  status === 'medium' ? 'In Progress' : 
                  'In Queue'
                }
                color={
                  status === 'high' ? 'success' : 
                  status === 'medium' ? 'warning' : 
                  'default'
                }
              />
            </Box>
            
            <Typography variant="body1" gutterBottom>
              Estimated Processing Time: <strong>{calculateTime(position)}</strong>
            </Typography>
            
            <LinearProgress 
              variant="determinate" 
              value={Math.min(100 - (position / 100) * 100, 100)} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                mb: 2,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 
                    status === 'high' ? 'success.main' : 
                    status === 'medium' ? 'warning.main' : 
                    'grey.500'
                }
              }}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Info color="info" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {status === 'high' ? 'Your application is nearing the top of the queue' :
                 status === 'medium' ? 'Your application is being processed' :
                 'Your application is in the queue'}
              </Typography>
            </Box>
          </>
        ) : (
          <Typography variant="body1">Loading waitlist information...</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default WaitlistStatus;