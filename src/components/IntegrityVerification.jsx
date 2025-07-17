/** @jsxRuntime classic */
/** @jsx React.createElement */


import { VerifiedUser, Warning } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Grid,
    LinearProgress,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';

const IntegrityVerification = ({ allocationId }) => {
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        const response = await api.get(`/allocations/${allocationId}/integrity`);
        setVerification(response.data);
      } catch (err) {
        console.error('Failed to fetch verification data', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVerification();
  }, [allocationId]);

  const verifyManually = async () => {
    try {
      setLoading(true);
      await api.post(`/allocations/${allocationId}/verify`);
      setVerification(prev => ({ ...prev, status: 'verified' }));
    } catch (err) {
      console.error('Verification failed', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Allocation Integrity Verification
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Automated Checks</Typography>
              <LinearProgress 
                variant="determinate" 
                value={verification.autoScore} 
                color={verification.autoScore > 75 ? 'success' : verification.autoScore > 50 ? 'warning' : 'error'}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Typography variant="caption">
                {verification.autoChecks.filter(c => c.passed).length} / {verification.autoChecks.length} checks passed
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {verification.status === 'verified' ? (
                <>
                  <VerifiedUser color="success" sx={{ mr: 1 }} />
                  <Typography>Manually Verified</Typography>
                </>
              ) : (
                <>
                  <Warning color="warning" sx={{ mr: 1 }} />
                  <Typography>Requires Verification</Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={verifyManually}
                    sx={{ ml: 2 }}
                  >
                    Verify Now
                  </Button>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          Verification Details
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          {verification.autoChecks.map((check, i) => (
            <Box component="li" key={i} sx={{ mb: 1 }}>
              <Typography variant="body2">
                {check.name}: {check.passed ? 'Passed' : 'Failed'}
                {!check.passed && ` - ${check.reason}`}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default IntegrityVerification;