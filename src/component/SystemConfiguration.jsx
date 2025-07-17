/** @jsxRuntime classic */
/** @jsx React.createElement */


import {
    Alert,
    Box,
    Button,
    MenuItem,
    Select,
    Switch,
    Typography
} from "@mui/material";
import axios from "axios";
import  React, { useEffect, useState } from "react";

const SystemConfiguration = () => {
  const [settings, setSettings] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get("/api/system-settings");
      setSettings(response.data);
    } catch (error) {
      setError("Error fetching settings.");
      console.error("Error fetching settings:", error);
    }
  };

  const handleSave = async () => {
    try {
      await axios.post("/api/system-settings", settings);
      setSuccess(true);
      setError("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError("Error saving settings.");
      console.error("Error saving settings:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Configuration
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Settings saved successfully!</Alert>}
      
      <Box sx={{ mb: 3 }}>
        <Typography>Enable Two-Factor Authentication:</Typography>
        <Switch
          checked={settings.twoFactorAuth || false}
          onChange={(e) =>
            setSettings({ ...settings, twoFactorAuth: e.target.checked })
          }
        />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography>Enable Digital Record Keeping:</Typography>
        <Switch
          checked={settings.digitalRecordKeeping || false}
          onChange={(e) =>
            setSettings({ ...settings, digitalRecordKeeping: e.target.checked })
          }
        />
      </Box>

      {/* Payment Reminders Configuration */}
      <Box sx={{ mb: 3 }}>
        <Typography>Automated Payment Reminders:</Typography>
        <Switch
          checked={settings.paymentReminders || false}
          onChange={(e) =>
            setSettings({ ...settings, paymentReminders: e.target.checked })
          }
        />
        {settings.paymentReminders && (
          <Box sx={{ ml: 4, mt: 1 }}>
            <Typography variant="body2">Reminder Schedule:</Typography>
            <Select
              value={settings.reminderSchedule || 'weekly'}
              onChange={(e) =>
                setSettings({ ...settings, reminderSchedule: e.target.value })
              }
              size="small"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </Box>
        )}
      </Box>

      {/* Financial Backup Configuration */}
      <Box sx={{ mb: 3 }}>
        <Typography>Financial Record Backup:</Typography>
        <Switch
          checked={settings.financialBackup || false}
          onChange={(e) =>
            setSettings({ ...settings, financialBackup: e.target.checked })
          }
        />
        {settings.financialBackup && (
          <Box sx={{ ml: 4, mt: 1 }}>
            <Typography variant="body2">Backup Frequency:</Typography>
            <Select
              value={settings.backupFrequency || 'daily'}
              onChange={(e) =>
                setSettings({ ...settings, backupFrequency: e.target.value })
              }
              size="small"
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="hourly">Hourly</MenuItem>
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
            </Select>
          </Box>
        )}
      </Box>

      <Button variant="contained" onClick={handleSave}>
        Save Settings
      </Button>
    </Box>
  );
};

export default SystemConfiguration;