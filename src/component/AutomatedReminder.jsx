/** @jsxRuntime classic */
/** @jsx React.createElement */

import { ScheduleSend } from '@mui/icons-material';
import {
    Button,
    Card,
    CardContent,
    Checkbox,
    FormControlLabel,
    Grid,
    TextField,
    Typography
} from '@mui/material';
import  React, { useState } from 'react';

const AutomatedReminders = () => {
  const [reminders, setReminders] = useState({
    paymentDue: true,
    paymentOverdue: true,
    documentExpiry: false,
    customMessage: ''
  });

  const handleChange = (name, value) => {
    setReminders({ ...reminders, [name]: value });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <ScheduleSend sx={{ mr: 1, verticalAlign: 'middle' }} />
          Automated Reminders
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={reminders.paymentDue}
                  onChange={(e) => handleChange('paymentDue', e.target.checked)}
                />
              }
              label="Send payment due reminders"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={reminders.paymentOverdue}
                  onChange={(e) => handleChange('paymentOverdue', e.target.checked)}
                />
              }
              label="Send payment overdue alerts"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={reminders.documentExpiry}
                  onChange={(e) => handleChange('documentExpiry', e.target.checked)}
                />
              }
              label="Send document expiry notifications"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Custom Reminder Message"
              multiline
              rows={3}
              value={reminders.customMessage}
              onChange={(e) => handleChange('customMessage', e.target.value)}
              placeholder="Enter a custom message template for reminders..."
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button variant="contained" color="primary">
              Save Reminder Settings
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AutomatedReminders;