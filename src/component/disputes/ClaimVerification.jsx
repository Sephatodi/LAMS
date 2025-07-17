// /src/components/disputes/ClaimVerification.jsx
import {
  Dangerous as FraudIcon,
  History as HistoryIcon,
  Help as UnverifiedIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Chip,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useGetHistoricalClaimsQuery } from '../../api/landBoardApi';

const ClaimVerification = ({ selectedClaim }) => {
  const { data: historicalClaims = [], isLoading } = useGetHistoricalClaimsQuery();
  const [verificationResults, setVerificationResults] = useState([]);
  const [riskScore, setRiskScore] = useState(0);

  useEffect(() => {
    if (!selectedClaim || historicalClaims.length === 0) return;

    // Cross-reference claim with historical data
    const results = [];
    let riskPoints = 0;

    // Check for matching historical claims
    const matchingClaims = historicalClaims.filter(claim => 
      claim.parcelId === selectedClaim.parcelId
    );

    if (matchingClaims.length > 0) {
      // Check for competing claims
      const competingClaims = matchingClaims.filter(claim => 
        claim.claimantId !== selectedClaim.applicantId
      );

      if (competingClaims.length > 0) {
        riskPoints += 40;
        results.push({
          type: 'competing_claim',
          severity: 'high',
          message: `${competingClaims.length} competing historical claims found`,
          details: competingClaims
        });
      }

      // Check claimant history
      const claimantHistory = historicalClaims.filter(claim => 
        claim.claimantId === selectedClaim.applicantId
      );

      if (claimantHistory.length > 3) {
        riskPoints += 20;
        results.push({
          type: 'frequent_claimant',
          severity: 'medium',
          message: `Applicant has ${claimantHistory.length} previous claims`,
          details: claimantHistory
        });
      }
    } else {
      // No historical record
      riskPoints += 10;
      results.push({
        type: 'no_history',
        severity: 'low',
        message: 'No historical claims found for this parcel',
        details: []
      });
    }

    // Check documentation consistency
    if (!selectedClaim.supportingDocs || selectedClaim.supportingDocs.length === 0) {
      riskPoints += 30;
      results.push({
        type: 'missing_docs',
        severity: 'high',
        message: 'No supporting documentation provided',
        details: []
      });
    }

    setVerificationResults(results);
    setRiskScore(Math.min(100, riskPoints));
  }, [selectedClaim, historicalClaims]);

  const getIcon = (severity) => {
    switch(severity) {
      case 'high': return <FraudIcon color="error" />;
      case 'medium': return <WarningIcon color="warning" />;
      default: return <UnverifiedIcon color="info" />;
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <HistoryIcon sx={{ mr: 1 }} /> Claim Verification
      </Typography>
      
      {isLoading ? (
        <LinearProgress />
      ) : !selectedClaim ? (
        <Alert severity="info">
          Select a land claim to begin verification
        </Alert>
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2">Risk Assessment:</Typography>
            <LinearProgress 
              variant="determinate" 
              value={riskScore} 
              color={
                riskScore > 60 ? 'error' :
                riskScore > 30 ? 'warning' : 'success'
              }
              sx={{ height: 10, borderRadius: 5, mb: 1 }}
            />
            <Typography variant="caption">
              Risk Score: {riskScore}/100 ({riskScore > 60 ? 'High Risk' : riskScore > 30 ? 'Medium Risk' : 'Low Risk'})
            </Typography>
          </Box>
          
          {verificationResults.length > 0 ? (
            <List dense>
              {verificationResults.map((result, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      {getIcon(result.severity)}
                    </ListItemIcon>
                    <ListItemText
                      primary={result.message}
                      secondary={result.details.length > 0 ? 
                        `${result.details.length} records found` : 'No details available'
                      }
                    />
                    <Chip 
                      label={result.type.replace('_', ' ')} 
                      size="small"
                      color={
                        result.severity === 'high' ? 'error' :
                        result.severity === 'medium' ? 'warning' : 'default'
                      }
                      variant="outlined"
                    />
                  </ListItem>
                  {index < verificationResults.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Alert severity="success" icon={<VerifiedIcon />}>
              No verification issues found for this claim
            </Alert>
          )}
        </>
      )}
    </Paper>
  );
};

export default ClaimVerification;