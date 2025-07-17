/** @jsxRuntime classic */
/** @jsx React.createElement */

import {
    Add,
    AdminPanelSettings, Lock,
    Notifications as NotificationsIcon,
    Save,
    Lock as SecurityIcon,
    Palette as ThemeIcon,
    VerifiedUser,
    Visibility, VisibilityOff
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    List, ListItem,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography
} from '@mui/material';
import  React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useApi from '../hooks/useApi';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const api = useApi();
  const navigate = useNavigate();

  // State for tab management
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState({
    settings: true,
    permissions: true,
    rules: true,
    workflows: true,
    saving: false
  });
  const [error, setError] = useState({
    settings: false,
    permissions: false,
    rules: false,
    workflows: false,
    save: false
  });
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    severity: 'success'
  });

  // Settings state
  const [settings, setSettings] = useState({
    theme: 'system',
    language: 'en',
    notifications: {
      email: true,
      sms: false,
      push: true,
      allocations: true,
      disputes: true,
      approvals: true
    }
  });

  // Admin state
  const [permissions, setPermissions] = useState([]);
  const [allocationRules, setAllocationRules] = useState([]);
  const [disputeWorkflows, setDisputeWorkflows] = useState([]);
  const [newPermission, setNewPermission] = useState({
    name: '',
    description: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Show notification
  const showNotification = useCallback((message, severity) => {
    setNotification({ show: true, message, severity });
    const timer = setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch settings data
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, settings: true }));
      setError(prev => ({ ...prev, settings: false }));
      
      const response = await api.get('/user/settings');
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error('Settings fetch error:', err);
      setError(prev => ({ ...prev, settings: true }));
      showNotification('Failed to load settings', 'error');
    } finally {
      setLoading(prev => ({ ...prev, settings: false }));
    }
  }, [api, showNotification]);

  // Fetch permissions (admin only)
  const fetchPermissions = useCallback(async () => {
    if (user?.role !== 'admin') return;
    
    try {
      setLoading(prev => ({ ...prev, permissions: true }));
      setError(prev => ({ ...prev, permissions: false }));
      
      const response = await api.get('/admin/permissions');
      const data = await response.json();
      setPermissions(data);
    } catch (err) {
      console.error('Permissions fetch error:', err);
      setError(prev => ({ ...prev, permissions: true }));
      showNotification('Failed to load permissions', 'error');
    } finally {
      setLoading(prev => ({ ...prev, permissions: false }));
    }
  }, [api, user?.role, showNotification]);

  // Fetch allocation rules
  const fetchAllocationRules = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, rules: true }));
      setError(prev => ({ ...prev, rules: false }));
      
      const response = await api.get('/settings/allocation-rules');
      const data = await response.json();
      setAllocationRules(data);
    } catch (err) {
      console.error('Allocation rules fetch error:', err);
      setError(prev => ({ ...prev, rules: true }));
      showNotification('Failed to load allocation rules', 'error');
    } finally {
      setLoading(prev => ({ ...prev, rules: false }));
    }
  }, [api, showNotification]);

  // Fetch dispute workflows
  const fetchDisputeWorkflows = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, workflows: true }));
      setError(prev => ({ ...prev, workflows: false }));
      
      const response = await api.get('/settings/dispute-workflows');
      const data = await response.json();
      setDisputeWorkflows(data);
    } catch (err) {
      console.error('Dispute workflows fetch error:', err);
      setError(prev => ({ ...prev, workflows: true }));
      showNotification('Failed to load dispute workflows', 'error');
    } finally {
      setLoading(prev => ({ ...prev, workflows: false }));
    }
  }, [api, showNotification]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle settings change
  const handleSettingsChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Handle notification preference change
  const handleNotificationChange = (key) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  // Save settings
  const saveSettings = async () => {
    try {
      setLoading(prev => ({ ...prev, saving: true }));
      setError(prev => ({ ...prev, save: false }));
      
      const response = await api.put('/user/settings', settings);
      const data = await response.json();
      
      if (data.success) {
        updateUser({ ...user, settings: data.settings });
        showNotification('Settings saved successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Save settings error:', err);
      setError(prev => ({ ...prev, save: true }));
      showNotification(err instanceof Error ? err.message : 'Failed to save settings', 'error');
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  // Change password
  const handlePasswordChange = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      setLoading(prev => ({ ...prev, saving: true }));
      
      const response = await api.put('/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        showNotification('Password changed successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Password change error:', err);
      showNotification(err instanceof Error ? err.message : 'Failed to change password', 'error');
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  // Toggle permission (admin only)
  const togglePermission = async (id) => {
    try {
      const response = await api.patch(`/admin/permissions/${id}/toggle`);
      const data = await response.json();
      
      if (data.success) {
        setPermissions(prev => prev.map(p => 
          p.id === id ? { ...p, enabled: !p.enabled } : p
        ));
        showNotification('Permission updated', 'success');
      }
    } catch (err) {
      console.error('Toggle permission error:', err);
      showNotification('Failed to update permission', 'error');
    }
  };

  // Toggle allocation rule
  const toggleAllocationRule = async (id) => {
    try {
      const response = await api.patch(`/settings/allocation-rules/${id}/toggle`);
      const data = await response.json();
      
      if (data.success) {
        setAllocationRules(prev => prev.map(r => 
          r.id === id ? { ...r, active: !r.active } : r
        ));
        showNotification('Allocation rule updated', 'success');
      }
    } catch (err) {
      console.error('Toggle allocation rule error:', err);
      showNotification('Failed to update allocation rule', 'error');
    }
  };

  // Toggle dispute workflow
  const toggleDisputeWorkflow = async (id) => {
    try {
      const response = await api.patch(`/settings/dispute-workflows/${id}/toggle`);
      const data = await response.json();
      
      if (data.success) {
        setDisputeWorkflows(prev => prev.map(w => 
          w.id === id ? { ...w, active: !w.active } : w
        ));
        showNotification('Dispute workflow updated', 'success');
      }
    } catch (err) {
      console.error('Toggle dispute workflow error:', err);
      showNotification('Failed to update dispute workflow', 'error');
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchSettings();
    if (user?.role === 'admin') {
      fetchPermissions();
    }
    fetchAllocationRules();
    fetchDisputeWorkflows();
  }, [fetchSettings, fetchPermissions, fetchAllocationRules, fetchDisputeWorkflows, user?.role]);

  return (
    <Box sx={{ p: 3 }}>
      <Snackbar
        open={notification.show}
        autoHideDuration={5000}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>

      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        System Settings
      </Typography>

      <Paper elevation={3}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="settings tabs"
        >
          <Tab label="Preferences" icon={<ThemeIcon />} />
          <Tab label="Notifications" icon={<NotificationsIcon />} />
          <Tab label="Security" icon={<SecurityIcon />} />
          {user?.role === 'admin' && <Tab label="Permissions" icon={<AdminPanelSettings />} />}
          {user?.role === 'admin' && <Tab label="Allocation Rules" icon={<VerifiedUser />} />}
          {user?.role === 'admin' && <Tab label="Dispute Workflows" icon={<VerifiedUser />} />}
        </Tabs>

        <Divider />

        {/* Preferences Tab */}
        <TabPanel value={activeTab} index={0}>
          {error.settings ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              Failed to load settings. <Button onClick={fetchSettings}>Retry</Button>
            </Alert>
          ) : loading.settings ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settings.theme}
                    label="Theme"
                    onChange={(e) => handleSettingsChange('theme', e.target.value)}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System Default</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.language}
                    label="Language"
                    onChange={(e) => handleSettingsChange('language', e.target.value)}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="tn">Setswana</MenuItem>
                    <MenuItem value="st">Sesotho</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={saveSettings}
                  disabled={loading.saving}
                  startIcon={<Save />}
                >
                  {loading.saving ? <CircularProgress size={24} /> : 'Save Preferences'}
                </Button>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={activeTab} index={1}>
          {error.settings ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              Failed to load notification settings. <Button onClick={fetchSettings}>Retry</Button>
            </Alert>
          ) : loading.settings ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Notification Channels
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.email}
                      onChange={() => handleNotificationChange('email')}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.sms}
                      onChange={() => handleNotificationChange('sms')}
                    />
                  }
                  label="SMS Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.push}
                      onChange={() => handleNotificationChange('push')}
                    />
                  }
                  label="Push Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Notification Types
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.allocations}
                      onChange={() => handleNotificationChange('allocations')}
                    />
                  }
                  label="Allocation Updates"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.disputes}
                      onChange={() => handleNotificationChange('disputes')}
                    />
                  }
                  label="Dispute Resolutions"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.approvals}
                      onChange={() => handleNotificationChange('approvals')}
                    />
                  }
                  label="Approval Requests"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={saveSettings}
                  disabled={loading.saving}
                  startIcon={<Save />}
                >
                  {loading.saving ? <CircularProgress size={24} /> : 'Save Notification Settings'}
                </Button>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              <TextField
                fullWidth
                label="Current Password"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
              />
              <TextField
                fullWidth
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                margin="normal"
                error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''}
                helperText={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== '' ? 'Passwords do not match' : ''}
              />
              <Button
                variant="contained"
                onClick={handlePasswordChange}
                disabled={
                  loading.saving ||
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  passwordData.newPassword !== passwordData.confirmPassword
                }
                sx={{ mt: 2 }}
                startIcon={<Lock />}
              >
                {loading.saving ? <CircularProgress size={24} /> : 'Change Password'}
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Active Sessions
              </Typography>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Current session: {new Date().toLocaleString()}
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }}>
                  View All Sessions
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Permissions Tab (Admin Only) */}
        {user?.role === 'admin' && (
          <TabPanel value={activeTab} index={3}>
            {error.permissions ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                Failed to load permissions. <Button onClick={fetchPermissions}>Retry</Button>
              </Alert>
            ) : loading.permissions ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    User Permissions
                  </Typography>
                  <List>
                    {permissions.map((permission) => (
                      <ListItem key={permission.id}>
                        <ListItemText
                          primary={permission.name}
                          secondary={permission.description}
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={permission.enabled}
                            onChange={() => togglePermission(permission.id)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Add New Permission
                  </Typography>
                  <TextField
                    fullWidth
                    label="Permission Name"
                    value={newPermission.name}
                    onChange={(e) => setNewPermission(prev => ({ ...prev, name: e.target.value }))}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    value={newPermission.description}
                    onChange={(e) => setNewPermission(prev => ({ ...prev, description: e.target.value }))}
                    margin="normal"
                    multiline
                    rows={2}
                  />
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    sx={{ mt: 2 }}
                  >
                    Add Permission
                  </Button>
                </Grid>
              </Grid>
            )}
          </TabPanel>
        )}

        {/* Allocation Rules Tab (Admin Only) */}
        {user?.role === 'admin' && (
          <TabPanel value={activeTab} index={4}>
            {error.rules ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                Failed to load allocation rules. <Button onClick={fetchAllocationRules}>Retry</Button>
              </Alert>
            ) : loading.rules ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Land Allocation Rules
                  </Typography>
                  <List>
                    {allocationRules.map((rule) => (
                      <ListItem key={rule.id}>
                        <ListItemText
                          primary={rule.name}
                          secondary={rule.description}
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={rule.active}
                            onChange={() => toggleAllocationRule(rule.id)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/settings/allocation-rules/new')}
                  >
                    Add New Rule
                  </Button>
                </Grid>
              </Grid>
            )}
          </TabPanel>
        )}

        {/* Dispute Workflows Tab (Admin Only) */}
        {user?.role === 'admin' && (
          <TabPanel value={activeTab} index={5}>
            {error.workflows ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                Failed to load dispute workflows. <Button onClick={fetchDisputeWorkflows}>Retry</Button>
              </Alert>
            ) : loading.workflows ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Dispute Resolution Workflows
                  </Typography>
                  <List>
                    {disputeWorkflows.map((workflow) => (
                      <ListItem key={workflow.id}>
                        <ListItemText
                          primary={workflow.name}
                          secondary={`${workflow.steps} steps`}
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            edge="end"
                            checked={workflow.active}
                            onChange={() => toggleDisputeWorkflow(workflow.id)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/settings/dispute-workflows/new')}
                  >
                    Add New Workflow
                  </Button>
                </Grid>
              </Grid>
            )}
          </TabPanel>
        )}
      </Paper>
    </Box>
  );
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default Settings;