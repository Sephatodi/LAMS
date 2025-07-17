/** @jsxRuntime classic */
/** @jsx React.createElement */

import { AuditLog, Lock, Security, VpnKey } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card, CardContent,
    Container,
    Divider,
    FormControlLabel,
    Grid,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import  React, { useState } from 'react';

const DataSecurity = () => {
  const [securityConfig, setSecurityConfig] = useState({
    enforce2FA: true,
    passwordComplexity: true,
    failedAttemptLock: 5,
    sessionTimeout: 30,
    auditLogging: true,
    dataEncryption: true
  });
  const [apiKey, setApiKey] = useState('••••••••••••••••');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleToggle = (name) => (event) => {
    setSecurityConfig({ ...securityConfig, [name]: event.target.checked });
  };

  const handleNumberChange = (name) => (event) => {
    setSecurityConfig({ ...securityConfig, [name]: parseInt(event.target.value) || 0 });
  };

  const generateApiKey = () => {
    // In real app, this would call backend
    setApiKey('sk_live_' + Math.random().toString(36).substring(2, 18));
    setShowApiKey(true);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 3 }}>
        <Typography variant="h4" gutterBottom>
          <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
          Data Security Configuration
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          These settings affect all users of the Botswana Land Board System
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Lock sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Authentication Security
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={securityConfig.enforce2FA}
                      onChange={handleToggle('enforce2FA')}
                      color="primary"
                    />
                  }
                  label="Enforce Two-Factor Authentication"
                  sx={{ mb: 2 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={securityConfig.passwordComplexity}
                      onChange={handleToggle('passwordComplexity')}
                      color="primary"
                    />
                  }
                  label="Require Complex Passwords"
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <TextField
                    label="Failed Attempts Before Lockout"
                    type="number"
                    value={securityConfig.failedAttemptLock}
                    onChange={handleNumberChange('failedAttemptLock')}
                    sx={{ mr: 2, width: 100 }}
                  />
                  <Typography variant="body2">
                    attempts
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <TextField
                    label="Session Timeout After"
                    type="number"
                    value={securityConfig.sessionTimeout}
                    onChange={handleNumberChange('sessionTimeout')}
                    sx={{ mr: 2, width: 100 }}
                  />
                  <Typography variant="body2">
                    minutes of inactivity
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <VpnKey sx={{ mr: 1, verticalAlign: 'middle' }} />
                  API Access
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    System API Key
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      value={showApiKey ? apiKey : '••••••••••••••••'}
                      type={showApiKey ? 'text' : 'password'}
                      variant="outlined"
                      size="small"
                      sx={{ flexGrow: 1, mr: 2 }}
                      InputProps={{ readOnly: true }}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? 'Hide' : 'Show'}
                    </Button>
                    <Button
                      variant="contained"
                      sx={{ ml: 2 }}
                      onClick={generateApiKey}
                    >
                      Regenerate
                    </Button>
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Last regenerated: 2023-06-10
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  <AuditLog sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Data Protection
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={securityConfig.auditLogging}
                      onChange={handleToggle('auditLogging')}
                      color="primary"
                    />
                  }
                  label="Enable Detailed Audit Logging"
                  sx={{ mb: 2 }}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={securityConfig.dataEncryption}
                      onChange={handleToggle('dataEncryption')}
                      color="primary"
                    />
                  }
                  label="Encrypt Sensitive Data at Rest"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" size="large">
            Save Security Settings
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default DataSecurity;