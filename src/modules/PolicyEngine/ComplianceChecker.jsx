// /src/modules/policyEngine/ComplianceChecker.jsx
import {
  Checklist as ComplianceIcon,
  DoneAll as CompliantIcon,
  Refresh as RefreshIcon,
  Help as UnknownIcon,
  Warning as ViolationIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useCheckComplianceMutation } from '../../api/policyApi';

const ComplianceChecker = ({ decision, onComplianceChange }) => {
  const [checkCompliance, { data: complianceResult, isLoading }] = useCheckComplianceMutation();
  const [openDetails, setOpenDetails] = useState(false);

  // Run compliance check when decision changes
  useEffect(() => {
    if (decision) {
      checkCompliance(decision);
    }
  }, [decision, checkCompliance]);

  // Notify parent component of compliance status
  useEffect(() => {
    if (complianceResult) {
      onComplianceChange(complianceResult.isCompliant);
    }
  }, [complianceResult, onComplianceChange]);

  const getComplianceIcon = () => {
    if (!complianceResult) return <UnknownIcon color="disabled" />;
    return complianceResult.isCompliant ? 
      <CompliantIcon color="success" /> : 
      <ViolationIcon color="error" />;
  };

  const getComplianceLabel = () => {
    if (!complianceResult) return 'Compliance not checked';
    return complianceResult.isCompliant ? 
      'Decision is compliant' : 
      `Decision violates ${complianceResult.violations.length} policies`;
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <ComplianceIcon sx={{ mr: 1 }} /> Policy Compliance Check
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        {getComplianceIcon()}
        <Typography variant="body1">
          {getComplianceLabel()}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={() => decision && checkCompliance(decision)}
          disabled={isLoading}
        >
          Re-check
        </Button>
      </Box>

      {isLoading ? (
        <LinearProgress />
      ) : complianceResult && !complianceResult.isCompliant ? (
        <>
          <Typography variant="subtitle2" color="error" gutterBottom>
            Policy Violations Detected:
          </Typography>
          <List dense>
            {complianceResult.violations.map((violation, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={violation.policyTitle}
                    secondary={violation.description}
                  />
                  <Chip 
                    label={`Section ${violation.section}`} 
                    size="small" 
                    color="error"
                    variant="outlined"
                  />
                </ListItem>
                {index < complianceResult.violations.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          <Button 
            variant="text" 
            color="error"
            onClick={() => setOpenDetails(true)}
            sx={{ mt: 1 }}
          >
            View Detailed Analysis
          </Button>
        </>
      ) : complianceResult?.isCompliant ? (
        <Typography variant="body2" color="text.secondary">
          This decision complies with all relevant policies and regulations.
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No decision data available for compliance check.
        </Typography>
      )}

      {/* Detailed Analysis Dialog */}
      <Dialog 
        open={openDetails} 
        onClose={() => setOpenDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Compliance Violation Details</DialogTitle>
        <DialogContent dividers>
          {complianceResult?.violations.map((violation, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {violation.policyTitle} (Section {violation.section})
              </Typography>
              <Typography variant="body1" paragraph>
                {violation.detailedDescription}
              </Typography>
              <Typography variant="subtitle2">
                Recommended Action:
              </Typography>
              <Typography variant="body2" paragraph>
                {violation.remediation}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Policy Reference: {violation.policyReference}
              </Typography>
              {index < complianceResult.violations.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ComplianceChecker;